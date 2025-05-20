// Exemplo de como usar o extrator com cookies
const { extractYoutube } = require('./helper/extractYoutube');
const fs = require('fs');

// Função para simular cookies (para fins de exemplo)
const criarArquivoCookiesExemplo = () => {
  const cookiesExemplo = `# Exemplo de formato de cookies
# Substitua este conteúdo pelos seus cookies reais do YouTube
# Formato: domínio\tincluir subdomínios\tcaminho\tseguro\texpiração\tnome\tvalor
.youtube.com\tTRUE\t/\tTRUE\t1716662400\tSID\texemplo_sid_value
.youtube.com\tTRUE\t/\tTRUE\t1716662400\tHSID\texemplo_hsid_value
.youtube.com\tTRUE\t/\tTRUE\t1716662400\tSSID\texemplo_ssid_value
.youtube.com\tTRUE\t/\tTRUE\t1716662400\tAEC\texemplo_aec_value
.youtube.com\tTRUE\t/\tTRUE\t1716662400\tLOGIN_INFO\texemplo_login_info_value`;
  
  fs.writeFileSync('./cookies_exemplo.txt', cookiesExemplo);
  console.log('Arquivo de cookies de exemplo criado: cookies_exemplo.txt');
};

// ID do vídeo do YouTube
const videoId = 'dQw4w9WgXcQ'; // "Never Gonna Give You Up"

async function obterAudio() {
  // Criar arquivo de cookies de exemplo
  criarArquivoCookiesExemplo();
  
  console.log('Demonstração de uso do extrator de áudio');
  console.log('----------------------------------------');
  console.log('ID do vídeo:', videoId);
  console.log('Iniciando extração...');
  
  try {
    // Verificar se existe arquivo de cookies real
    if (!fs.existsSync('./cookies.txt')) {
      console.log('\n⚠️ AVISO: Arquivo cookies.txt não encontrado!');
      console.log('Para funcionamento correto, você precisa:');
      console.log('1. Fazer login no YouTube em seu navegador');
      console.log('2. Exportar os cookies usando uma extensão como Cookie-Editor');
      console.log('3. Salvar como cookies.txt na raiz do projeto');
      console.log('\nTentando extração sem cookies (provavelmente falhará)...');
    } else {
      console.log('Cookies encontrados, usando para autenticação...');
    }
    
    // O extrator tentará todos os métodos disponíveis
    const audio = await extractYoutube(videoId, 'audio');
    console.log('\n✅ Extração bem-sucedida!');
    console.log('URL do áudio:', audio.url.substring(0, 100) + '...');
    console.log('Tipo MIME:', audio.mimeType);
    console.log('Bitrate:', audio.bitrate);
    console.log('Container:', audio.container);
    return audio;
  } catch (error) {
    console.error('\n❌ Erro ao extrair áudio:', error.message);
    console.log('\nSolução:');
    console.log('1. Verifique se você forneceu cookies válidos do YouTube');
    console.log('2. Tente usar um proxy (edite a lista em helper/extractYoutube.js)');
    console.log('3. Verifique se o yt-dlp está instalado (npm install -g yt-dlp)');
  }
}

// Executar o exemplo
obterAudio();
