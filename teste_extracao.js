// Arquivo de exemplo para testar a extração de áudio
const { extractYoutube } = require('./helper/extractYoutube');
const { extractFromPlayDl } = require('./helper/playDlExtractor');
const fs = require('fs');

// ID de vídeo para teste
const videoId = 'dQw4w9WgXcQ'; // ID do vídeo "Never Gonna Give You Up"

// Função para testar todos os métodos de extração
async function testarExtracao() {
  console.log('Iniciando testes de extração de áudio...');
  
  try {
    // Testar o método principal que tenta todos os extratores em sequência
    console.log('\n[TESTE 1] Testando método principal extractYoutube');
    const resultado = await extractYoutube(videoId, 'audio');
    console.log('✅ Sucesso! URL obtida:', resultado.url.substring(0, 100) + '...');
    console.log('Formato:', resultado.mimeType);
    console.log('Bitrate:', resultado.bitrate);
    
    // Testar o método play-dl separadamente
    console.log('\n[TESTE 2] Testando método play-dl');
    try {
      const resultadoPlayDl = await extractFromPlayDl(videoId, 'audio');
      console.log('✅ Sucesso! URL obtida:', resultadoPlayDl.url.substring(0, 100) + '...');
      console.log('Formato:', resultadoPlayDl.mimeType);
      console.log('Bitrate:', resultadoPlayDl.bitrate);
    } catch (error) {
      console.log('❌ Falha no método play-dl:', error.message);
    }
    
    // Salvar resultado em um arquivo para verificação
    fs.writeFileSync('./teste_extracao_resultado.json', JSON.stringify({
      sucesso: true,
      url: resultado.url,
      mimeType: resultado.mimeType,
      bitrate: resultado.bitrate,
      container: resultado.container
    }, null, 2));
    
    console.log('\nTestes concluídos! Resultados salvos em teste_extracao_resultado.json');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    fs.writeFileSync('./teste_extracao_resultado.json', JSON.stringify({
      sucesso: false,
      erro: error.message
    }, null, 2));
  }
}

// Executar os testes
testarExtracao();
