# Instruções para Uso do Extrator de Áudio do YouTube

## Problema Identificado

O YouTube implementou medidas rigorosas contra bots, exigindo verificação CAPTCHA ou login para acessar conteúdo de áudio. Os erros que você estava enfrentando são resultado dessas proteções:

```
[DEBUG] Erro ao extrair com ytdl-core: Sign in to confirm you're not a bot
[DEBUG] Erro ao extrair com API pública: Request failed with status code 403
[DEBUG] Erro com instância Invidious: getaddrinfo ENOTFOUND invidious.namazso.eu
```

## Solução Implementada

Implementamos várias camadas de soluções para contornar esses bloqueios:

1. **Sistema de fallback inteligente** que tenta múltiplos métodos de extração
2. **Suporte a proxies** para evitar bloqueios por IP
3. **Integração com yt-dlp** que é mais resiliente contra bloqueios
4. **Rotação automática de instâncias** Piped e Invidious
5. **Suporte a cookies de autenticação** para contornar verificações de bot

## Requisito Crítico: Cookies de Autenticação

Para que o extrator funcione corretamente, **você precisa fornecer cookies válidos de uma sessão autenticada do YouTube**. Esta é a única maneira confiável de contornar as restrições atuais.

### Como obter e usar cookies do YouTube:

1. **Faça login no YouTube** em seu navegador
2. **Exporte os cookies** usando uma extensão como "Cookie-Editor" ou "EditThisCookie"
3. **Salve os cookies** em um arquivo chamado `cookies.txt` na raiz do projeto
4. **OU** defina a variável de ambiente `YOUTUBE_COOKIES` com o conteúdo dos cookies

## Exemplo de Uso

```javascript
// Exemplo de como usar o extrator com cookies
const { extractYoutube } = require('./helper/extractYoutube');

// ID do vídeo do YouTube
const videoId = 'dQw4w9WgXcQ';

async function obterAudio() {
  try {
    // O extrator tentará todos os métodos disponíveis
    const audio = await extractYoutube(videoId, 'audio');
    console.log('URL do áudio:', audio.url);
    console.log('Tipo MIME:', audio.mimeType);
    console.log('Bitrate:', audio.bitrate);
    return audio;
  } catch (error) {
    console.error('Erro ao extrair áudio:', error.message);
  }
}

obterAudio();
```

## Configuração Adicional

### Proxies (Opcional)

Para usar proxies, edite a lista no arquivo `helper/extractYoutube.js`:

```javascript
const proxies = [
  'http://seu-proxy1.com:8080',
  'http://seu-proxy2.com:8080'
];
```

### Instâncias Alternativas

O código já inclui várias instâncias Piped e Invidious, mas você pode adicionar mais conforme necessário.

## Observações Importantes

1. **Sem cookies válidos, o extrator provavelmente falhará** devido às restrições do YouTube
2. **Mantenha os cookies atualizados**, pois eles podem expirar
3. **As instâncias de terceiros (Piped/Invidious) podem ficar instáveis** ou serem bloqueadas

## Solução de Problemas

Se você continuar enfrentando problemas:

1. Verifique se os cookies são válidos e estão atualizados
2. Tente usar proxies diferentes
3. Atualize as dependências para as versões mais recentes
4. Verifique se o yt-dlp está instalado e atualizado

O código foi projetado para ser resiliente, mas as restrições do YouTube estão em constante evolução, podendo exigir ajustes futuros.
