// Teste de extração de áudio usando cookies JSON
const fs = require('fs');
const { extractYoutube } = require('./helper/extractYoutube');
const { convertJsonCookiesToString } = require('./helper/cookiesAdapter');

// Salvar os cookies do usuário em um arquivo JSON
const salvarCookiesJson = () => {
  const cookiesJson = `[
    {
        "domain": ".youtube.com",
        "expirationDate": 1763262774.175599,
        "hostOnly": false,
        "httpOnly": true,
        "name": "VISITOR_PRIVACY_METADATA",
        "partitionKey": {
            "hasCrossSiteAncestor": false,
            "topLevelSite": "https://youtube.com"
        },
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "CgJCUhIEGgAgEA%3D%3D"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1780976187.049272,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000wgjICvCqH54iUsdGpNtfETdXvD_SteWe6syJci1owToEd7PKe2OZRV2j_HIQLhntisPE-AACgYKAa8SARMSFQHGX2MiXbA9U3Rgf9l2H-m-S0wbGRoVAUF8yKouahuUbkH6oiRo8PZNg2qA0076"
    },
    {
        "domain": ".youtube.com",
        "hostOnly": false,
        "httpOnly": true,
        "name": "YSC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": true,
        "storeId": null,
        "value": "9P7EAv1FMi8"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1779246434.146355,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjEBjplskNsI6dJeXElHrHyhqyrdm9r4sd3ZhiLxs1So5CfiCGCNj8fbdx4Mi7tkawiJEAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1780976187.048914,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "yuTX9OmFgc_agD8W/ApQBD97ScCXHlqOKa"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1779246774.175707,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzWkOjIb6P_uBGrmvLyGaza_9MsdFnRbgUQ3w5hOL0XSxsa1Zx05nma1MKOcIkJ_X4PrbtzJ"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1780976187.048781,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "ABdNmG4_Fec2JC8mx"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1780976187.04898,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "yuTX9OmFgc_agD8W/ApQBD97ScCXHlqOKa"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1780976187.049204,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000wgjICvCqH54iUsdGpNtfETdXvD_SteWe6syJci1owToEd7PKh-cKP8wJQVWm2761kqBc7wACgYKAV0SARMSFQHGX2Mi30NwCTBxsuy7hyg0PtGtwxoVAUF8yKp_M4HQbuCdIlVObPrm9jd_0076"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1780976187.049042,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "yuTX9OmFgc_agD8W/ApQBD97ScCXHlqOKa"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1779246774.175746,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzW3tbP-fAh-fiWlUgD-bgDtrob8y_N9CftE7iSVGcYie5nCtTQ0-CC0QMuSnhkPSG_TyB0F"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1779246434.146478,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjEBjplskNsI6dJeXElHrHyhqyrdm9r4sd3ZhiLxs1So5CfiCGCNj8fbdx4Mi7tkawiJEAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1776723541.715914,
        "hostOnly": false,
        "httpOnly": true,
        "name": "LOGIN_INFO",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AFmmF2swRgIhALmJDTVWPIB5YRsMY86XKn2_D7umWJqf8BobAD724-ezAiEA9ep9ci5qczzqpwlyOvEtWnQC_jNXXrI5hgJ7NGvSav4:QUQ3MjNmeXFVY2k5NGQzdWpCQW5pZ18ybVdxQWVkdDIyaE1zRmhuQTE0bFNxV1p2cVpjay1EUmZUa2xZbXlEYXAwbWE1TGJKY2stS1F5anh2NENjdFFOc042clN2SkU0R0ctSWZhVlN6T0pRMk5oM2d1THAzR1ZMWXpmNUZnWk1Pb3VSSEdfYkFhMFdxY3l6TGpJLVdlWmkzXy1WZ3Z0VzF3"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1782270768.245804,
        "hostOnly": false,
        "httpOnly": false,
        "name": "PREF",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "f6=40000080&tz=America.Sao_Paulo&f7=100&repeat=NONE&autoplay=true&volume=19&f5=20000"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1763262774.17547,
        "hostOnly": false,
        "httpOnly": true,
        "name": "VISITOR_INFO1_LIVE",
        "partitionKey": {
            "hasCrossSiteAncestor": false,
            "topLevelSite": "https://youtube.com"
        },
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "o0TTxXC5R-4"
    }
]`;

  fs.writeFileSync('./cookies.json', cookiesJson);
  console.log('Arquivo cookies.json criado com sucesso!');
  
  // Testar a conversão
  const cookieString = convertJsonCookiesToString(JSON.parse(cookiesJson));
  console.log('Cookies convertidos para string:');
  console.log(cookieString.substring(0, 100) + '...');
};

// ID de vídeo para teste
const videoId = 'dQw4w9WgXcQ'; // "Never Gonna Give You Up"

async function testarExtracao() {
  console.log('Iniciando teste de extração com cookies JSON...');
  
  // Salvar cookies em arquivo JSON
  salvarCookiesJson();
  
  try {
    console.log(`Tentando extrair áudio para o vídeo ID: ${videoId}`);
    const resultado = await extractYoutube(videoId, 'audio');
    
    console.log('\n✅ Extração bem-sucedida!');
    console.log('URL do áudio:', resultado.url.substring(0, 100) + '...');
    console.log('Tipo MIME:', resultado.mimeType);
    console.log('Bitrate:', resultado.bitrate);
    
    // Salvar resultado em arquivo para verificação
    fs.writeFileSync('./teste_cookies_json_resultado.json', JSON.stringify({
      sucesso: true,
      url: resultado.url,
      mimeType: resultado.mimeType,
      bitrate: resultado.bitrate,
      container: resultado.container
    }, null, 2));
    
    console.log('\nResultado salvo em teste_cookies_json_resultado.json');
    return true;
  } catch (error) {
    console.error('\n❌ Erro na extração:', error.message);
    
    fs.writeFileSync('./teste_cookies_json_resultado.json', JSON.stringify({
      sucesso: false,
      erro: error.message
    }, null, 2));
    
    console.log('\nErro salvo em teste_cookies_json_resultado.json');
    return false;
  }
}

// Executar o teste
testarExtracao();
