const ytdl = require("@distube/ytdl-core");
const axios = require("axios");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const fs = require("fs");
const HttpsProxyAgent = require("https-proxy-agent");

const BASE_URL = (vid) => `https://www.youtube.com/watch?v=${vid}`;

// Função de log aprimorada para depuração
const logDebug = (message, data = null) => {
  console.log(`[DEBUG] ${message}`, data ? data : '');
};

// Lista de proxies - pode ser expandida ou carregada de um arquivo/API
const proxies = [
  'http://proxy1.example.com:8080',
  'http://proxy2.example.com:8080',
  // Adicione mais proxies conforme necessário
];

// Função para obter um proxy aleatório
const getRandomProxy = () => {
  // Se não houver proxies configurados, retorna null
  if (!proxies || proxies.length === 0 || proxies[0].includes('example.com')) {
    return null;
  }
  return proxies[Math.floor(Math.random() * proxies.length)];
};

// Função para carregar cookies de um arquivo ou variável de ambiente
const loadCookies = () => {
  try {
    // Tentar carregar de variável de ambiente primeiro
    if (process.env.YOUTUBE_COOKIES) {
      return process.env.YOUTUBE_COOKIES;
    }
    
    // Tentar carregar de um arquivo
    const cookiesPath = './cookies.txt';
    if (fs.existsSync(cookiesPath)) {
      return fs.readFileSync(cookiesPath, 'utf8');
    }
    
    return '';
  } catch (error) {
    logDebug(`Erro ao carregar cookies: ${error.message}`);
    return '';
  }
};

// Filtrar formatos de áudio
const filterFormats = (formats, type) => {
  if (!formats || !Array.isArray(formats)) {
    logDebug("Formatos inválidos recebidos:", formats);
    return [];
  }
  
  if (type === "audioonly") {
    return formats.filter((format) => {
      const mimeType = format.mimeType || format.type;
      return mimeType && mimeType.toLowerCase().includes("audio");
    });
  }
  return formats;
};

// Encontrar formato com maior bitrate
const highestBitrate = (formats) => {
  if (!formats || formats.length === 0) {
    return null;
  }
  
  return formats.reduce((highest, format) => {
    const currentBitrate = parseInt(format.bitrate || 0);
    const highestBitrate = parseInt(highest.bitrate || 0);
    return currentBitrate > highestBitrate ? format : highest;
  }, formats[0]);
};

// Função principal para extrair áudio do YouTube usando ytdl-core
exports.extractFromYtdlCore = async (id, dataType) => {
  try {
    logDebug(`Tentando extrair áudio para ID: ${id} usando ytdl-core`);
    
    // Configurar opções com proxy e cookies, se disponíveis
    const requestOptions = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Origin": "https://www.youtube.com",
        "Referer": "https://www.youtube.com"
      }
    };
    
    // Adicionar cookies se disponíveis
    const cookies = loadCookies();
    if (cookies) {
      requestOptions.headers["Cookie"] = cookies;
    }
    
    // Adicionar proxy se disponível
    const proxy = getRandomProxy();
    if (proxy) {
      requestOptions.agent = new HttpsProxyAgent(proxy);
    }
    
    let info = await ytdl.getInfo(BASE_URL(id), {
      requestOptions: requestOptions
    });
    
    let audioFormats = ytdl.filterFormats(info.formats, "audioonly");
    
    if (!audioFormats || audioFormats.length === 0) {
      logDebug("Nenhum formato de áudio encontrado com ytdl-core");
      throw new Error("Nenhum formato de áudio encontrado.");
    }
    
    if (dataType === "audio") {
      const format = highestBitrate(audioFormats);
      logDebug("Formato de áudio encontrado:", { 
        url: format.url.substring(0, 100) + "...", 
        mimeType: format.mimeType,
        bitrate: format.bitrate
      });
      return format;
    }
  } catch (error) {
    logDebug(`Erro ao extrair com ytdl-core: ${error.message}`);
    throw error;
  }
};

// Lista atualizada de instâncias Piped API
const pipedInstances = [
  "https://pipedapi.kavin.rocks",
  "https://api-piped.moomoo.me",
  "https://pipedapi.tokhmi.xyz",
  "https://pipedapi.syncpundit.io",
  "https://api.piped.projectsegfau.lt",
  "https://piped-api.garudalinux.org",
  "https://pipedapi.rivo.lol"
];

// Cache de status das instâncias Piped
const pipedStatusCache = new Map();

// Função para obter uma instância Piped ativa
const getActivePipedInstance = () => {
  // Filtrar instâncias marcadas como ativas ou não testadas
  const availableInstances = pipedInstances.filter(
    instance => pipedStatusCache.get(instance) !== false
  );
  
  // Se todas estiverem marcadas como inativas, resetar o cache e tentar todas novamente
  if (availableInstances.length === 0) {
    pipedInstances.forEach(instance => pipedStatusCache.delete(instance));
    return pipedInstances[0];
  }
  
  // Retornar uma instância aleatória entre as disponíveis
  return availableInstances[Math.floor(Math.random() * availableInstances.length)];
};

// Função alternativa usando API Piped
exports.extractFromPublicAPI = async (id, dataType) => {
  try {
    logDebug(`Tentando extrair áudio para ID: ${id} usando API pública Piped`);
    
    // Obter uma instância ativa
    const instance = getActivePipedInstance();
    logDebug(`Usando instância Piped: ${instance}`);
    
    // Configurar opções com proxy, se disponível
    const requestOptions = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json"
      },
      timeout: 10000 // 10 segundos de timeout
    };
    
    // Adicionar proxy se disponível
    const proxy = getRandomProxy();
    if (proxy) {
      requestOptions.httpsAgent = new HttpsProxyAgent(proxy);
    }
    
    const response = await axios.get(`${instance}/streams/${id}`, requestOptions);
    
    // Marcar instância como ativa
    pipedStatusCache.set(instance, true);
    
    if (!response.data || !response.data.audioStreams) {
      logDebug("Resposta inválida da API Piped");
      throw new Error("Resposta inválida da API.");
    }
    
    const audioStreams = response.data.audioStreams;
    
    if (!audioStreams || audioStreams.length === 0) {
      logDebug("Nenhum stream de áudio encontrado na API Piped");
      throw new Error("Nenhum stream de áudio disponível.");
    }
    
    // Ordenar por bitrate e pegar o melhor
    audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    const bestAudio = audioStreams[0];
    
    logDebug("Melhor stream de áudio encontrado:", {
      url: bestAudio.url.substring(0, 100) + "...",
      mimeType: bestAudio.mimeType,
      bitrate: bestAudio.bitrate
    });
    
    return {
      url: bestAudio.url,
      mimeType: bestAudio.mimeType || "audio/webm",
      bitrate: bestAudio.bitrate,
      container: bestAudio.container || "webm"
    };
  } catch (error) {
    // Marcar instância como inativa
    const instance = getActivePipedInstance();
    pipedStatusCache.set(instance, false);
    
    logDebug(`Erro ao extrair com API Piped: ${error.message}`);
    throw error;
  }
};

// Lista atualizada de instâncias Invidious
const invidiousInstances = [
  "https://invidious.snopyta.org",
  "https://invidious.kavin.rocks",
  "https://vid.puffyan.us",
  "https://invidious.namazso.eu",
  "https://yewtu.be",
  "https://invidious.flokinet.to",
  "https://invidious.esmailelbob.xyz",
  "https://inv.riverside.rocks",
  "https://invidious.projectsegfau.lt",
  "https://invidio.xamh.de",
  "https://y.com.sb"
];

// Cache de status das instâncias Invidious
const invidiousStatusCache = new Map();

// Função para obter uma instância Invidious ativa
const getActiveInvidiousInstance = () => {
  // Filtrar instâncias marcadas como ativas ou não testadas
  const availableInstances = invidiousInstances.filter(
    instance => invidiousStatusCache.get(instance) !== false
  );
  
  // Se todas estiverem marcadas como inativas, resetar o cache e tentar todas novamente
  if (availableInstances.length === 0) {
    invidiousInstances.forEach(instance => invidiousStatusCache.delete(instance));
    return invidiousInstances[0];
  }
  
  // Retornar uma instância aleatória entre as disponíveis
  return availableInstances[Math.floor(Math.random() * availableInstances.length)];
};

// Função de fallback usando Invidious
exports.extractFromInvidious = async (id, dataType) => {
  try {
    logDebug(`Tentando extrair áudio para ID: ${id} usando Invidious`);
    
    // Obter uma instância ativa
    const instance = getActiveInvidiousInstance();
    logDebug(`Usando instância Invidious: ${instance}`);
    
    // Configurar opções com proxy, se disponível
    const requestOptions = {
      timeout: 5000, // 5 segundos de timeout
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    };
    
    // Adicionar proxy se disponível
    const proxy = getRandomProxy();
    if (proxy) {
      requestOptions.httpsAgent = new HttpsProxyAgent(proxy);
    }
    
    const { data } = await axios.get(
      `${instance}/api/v1/videos/${id}?fields=adaptiveFormats`,
      requestOptions
    );
    
    // Marcar instância como ativa
    invidiousStatusCache.set(instance, true);
    
    if (!data || !data.adaptiveFormats) {
      throw new Error("Dados inválidos da API Invidious");
    }
    
    const audioFormats = data.adaptiveFormats.filter(
      format => format.type && format.type.startsWith("audio")
    );
    
    if (audioFormats.length === 0) {
      throw new Error("Nenhum formato de áudio encontrado");
    }
    
    // Ordenar por bitrate e pegar o melhor
    audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    const bestAudio = audioFormats[0];
    
    logDebug("Formato de áudio encontrado via Invidious:", {
      url: bestAudio.url.substring(0, 100) + "...",
      type: bestAudio.type,
      bitrate: bestAudio.bitrate
    });
    
    return {
      url: bestAudio.url,
      mimeType: bestAudio.type || "audio/webm",
      bitrate: bestAudio.bitrate,
      container: "webm"
    };
  } catch (error) {
    // Marcar instância como inativa
    const instance = getActiveInvidiousInstance();
    invidiousStatusCache.set(instance, false);
    
    logDebug(`Erro ao extrair com Invidious: ${error.message}`);
    throw error;
  }
};

// Nova função para extrair áudio usando yt-dlp
exports.extractFromYtDlp = async (id, dataType) => {
  try {
    logDebug(`Tentando extrair áudio para ID: ${id} usando yt-dlp`);
    
    // Verificar se yt-dlp está instalado
    try {
      await execPromise("which yt-dlp");
    } catch (error) {
      // Instalar yt-dlp se não estiver disponível
      logDebug("yt-dlp não encontrado, tentando instalar...");
      try {
        await execPromise("pip install yt-dlp");
      } catch (installError) {
        logDebug(`Erro ao instalar yt-dlp: ${installError.message}`);
        throw new Error("Não foi possível instalar yt-dlp");
      }
    }
    
    // Comando para obter apenas a URL do áudio
    const command = `yt-dlp -f 'ba' -g "https://www.youtube.com/watch?v=${id}"`;
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      logDebug(`Erro no stderr do yt-dlp: ${stderr}`);
    }
    
    const audioUrl = stdout.trim();
    if (!audioUrl) {
      throw new Error('URL de áudio não encontrada');
    }
    
    // Obter informações adicionais para determinar o formato
    const infoCommand = `yt-dlp -f 'ba' -j "https://www.youtube.com/watch?v=${id}"`;
    const { stdout: infoStdout } = await execPromise(infoCommand);
    const info = JSON.parse(infoStdout);
    
    return {
      url: audioUrl,
      mimeType: info.acodec === 'opus' ? 'audio/webm' : 'audio/mp4',
      bitrate: info.abr * 1000 || 128000,
      container: info.ext || 'webm'
    };
  } catch (error) {
    logDebug(`Erro ao extrair com yt-dlp: ${error.message}`);
    throw error;
  }
};

// Função principal que tenta todos os métodos em sequência
exports.extractYoutube = async (id, dataType) => {
  logDebug(`Iniciando extração para ID: ${id}, tipo: ${dataType}`);
  
  const extractors = [
    { fn: exports.extractFromYtdlCore, name: "ytdl-core" },
    { fn: exports.extractFromPublicAPI, name: "API pública" },
    { fn: exports.extractFromInvidious, name: "Invidious" },
    { fn: exports.extractFromYtDlp, name: "yt-dlp" }
  ];
  
  let lastError = null;
  
  for (const extractor of extractors) {
    try {
      logDebug(`Tentando extrator: ${extractor.name}`);
      const result = await extractor.fn(id, dataType);
      logDebug(`Extração bem-sucedida com ${extractor.name}`);
      return result;
    } catch (error) {
      lastError = error;
      logDebug(`Falha no extrator ${extractor.name}: ${error.message}`);
      // Continuar para o próximo extrator
    }
  }
  
  // Se chegou aqui, todos os métodos falharam
  logDebug("Todos os métodos de extração falharam");
  throw lastError || new Error("Não foi possível extrair o áudio por nenhum método disponível");
};

// Manter compatibilidade com o código existente
exports.extractFromPipeDaAPI = exports.extractFromPublicAPI;
exports.extractFromBeatbump = async (id, dataType) => {
  logDebug("extractFromBeatbump chamado, redirecionando para extractYoutube");
  return exports.extractYoutube(id, dataType);
};
exports.extractFromAlltube249 = async (id, dataType) => {
  logDebug("extractFromAlltube249 chamado, redirecionando para extractYoutube");
  return exports.extractYoutube(id, dataType);
};
exports.extractFromAlltube250 = async (id, dataType) => {
  logDebug("extractFromAlltube250 chamado, redirecionando para extractYoutube");
  return exports.extractYoutube(id, dataType);
};
exports.extractFromAlltube251 = async (id, dataType) => {
  logDebug("extractFromAlltube251 chamado, redirecionando para extractYoutube");
  return exports.extractYoutube(id, dataType);
};
exports.extractFromYoutubeRaw = async (id, dataType) => {
  logDebug("extractFromYoutubeRaw chamado, redirecionando para extractYoutube");
  return exports.extractYoutube(id, dataType);
};
