const playdl = require('play-dl');

// Função para extrair áudio usando play-dl
exports.extractFromPlayDl = async (id, dataType) => {
  try {
    console.log(`[DEBUG] Tentando extrair áudio para ID: ${id} usando play-dl`);
    
    // Verificar se o vídeo está disponível
    const validateVideo = await playdl.validate(`https://www.youtube.com/watch?v=${id}`);
    if (!validateVideo) {
      throw new Error('Vídeo não disponível ou não encontrado');
    }
    
    // Obter informações do vídeo
    const info = await playdl.video_info(`https://www.youtube.com/watch?v=${id}`);
    
    // Obter formatos de áudio
    const audioFormats = info.format.filter(format => 
      format.mimeType && format.mimeType.includes('audio')
    );
    
    if (!audioFormats || audioFormats.length === 0) {
      throw new Error('Nenhum formato de áudio encontrado');
    }
    
    // Ordenar por bitrate e pegar o melhor
    audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    const bestAudio = audioFormats[0];
    
    // Obter URL de streaming
    const stream = await playdl.stream_from_info(info, { quality: bestAudio.quality });
    
    return {
      url: stream.url,
      mimeType: bestAudio.mimeType || 'audio/webm',
      bitrate: bestAudio.bitrate,
      container: bestAudio.mimeType.includes('webm') ? 'webm' : 'mp4'
    };
  } catch (error) {
    console.log(`[DEBUG] Erro ao extrair com play-dl: ${error.message}`);
    throw error;
  }
};
