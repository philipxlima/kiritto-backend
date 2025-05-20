/**
 * Adaptador para converter cookies do formato JSON para string
 * 
 * Este arquivo contém funções para converter cookies exportados em formato JSON
 * (como os exportados por extensões de navegador) para o formato de string
 * utilizado em cabeçalhos HTTP.
 */

/**
 * Converte cookies do formato JSON para string no formato de cabeçalho HTTP
 * @param {Array|String} cookies - Array de objetos de cookie ou string JSON
 * @returns {String} String formatada para uso no cabeçalho Cookie
 */
function convertJsonCookiesToString(cookies) {
  try {
    // Se for uma string, tenta fazer o parse para JSON
    if (typeof cookies === 'string') {
      cookies = JSON.parse(cookies);
    }
    
    // Verifica se é um array
    if (!Array.isArray(cookies)) {
      throw new Error('O formato de cookies deve ser um array de objetos');
    }
    
    // Converte cada cookie para o formato "nome=valor"
    return cookies
      .filter(cookie => cookie && cookie.name && cookie.value) // Filtra cookies válidos
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
  } catch (error) {
    console.error('Erro ao converter cookies JSON:', error);
    return '';
  }
}

/**
 * Carrega cookies de um arquivo JSON
 * @param {String} filePath - Caminho para o arquivo JSON de cookies
 * @returns {String} String formatada para uso no cabeçalho Cookie
 */
function loadCookiesFromJsonFile(filePath) {
  try {
    const fs = require('fs');
    const cookiesJson = fs.readFileSync(filePath, 'utf8');
    return convertJsonCookiesToString(cookiesJson);
  } catch (error) {
    console.error(`Erro ao carregar cookies do arquivo ${filePath}:`, error);
    return '';
  }
}

module.exports = {
  convertJsonCookiesToString,
  loadCookiesFromJsonFile
};
