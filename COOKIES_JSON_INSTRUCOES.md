# Como Usar Cookies JSON para Extração de Áudio do YouTube

Este guia explica como utilizar cookies exportados do navegador em formato JSON para melhorar a extração de áudio do YouTube no projeto.

## Por que usar cookies?

O YouTube implementou medidas rigorosas contra bots, exigindo verificação CAPTCHA ou login para acessar conteúdo de áudio. Usar cookies de uma sessão autenticada é a maneira mais eficaz de contornar essas restrições.

## Passo a Passo

### 1. Exportar Cookies do Navegador

1. Instale uma extensão para exportar cookies:
   - Chrome: [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg) ou [Cookie-Editor](https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm)
   - Firefox: [Cookie-Editor](https://addons.mozilla.org/en-US/firefox/addon/cookie-editor/)

2. Acesse o YouTube (https://www.youtube.com) e faça login na sua conta

3. Abra a extensão de cookies e exporte os cookies em formato JSON:
   - No EditThisCookie: Clique no ícone da extensão → Clique no botão "Exportar" (formato JSON)
   - No Cookie-Editor: Clique no ícone da extensão → Clique em "Export" → "Export as JSON"

4. Salve o conteúdo exportado em um arquivo chamado `cookies.json` na raiz do projeto

### 2. Integração no Projeto

O código já foi adaptado para usar automaticamente os cookies do arquivo `cookies.json`. Não é necessária nenhuma modificação adicional no código.

### 3. Verificação

Para verificar se os cookies estão funcionando corretamente:

1. Execute o script de teste:
   ```
   node teste_cookies_json.js
   ```

2. Se a extração for bem-sucedida, você verá uma mensagem de confirmação e os detalhes do áudio extraído.

## Detalhes Técnicos

### Como Funciona

1. O adaptador `cookiesAdapter.js` converte os cookies do formato JSON para o formato de string usado em cabeçalhos HTTP
2. O extrator de áudio carrega automaticamente os cookies do arquivo `cookies.json` se ele existir
3. Os cookies são incluídos nas requisições para o YouTube, permitindo acesso autenticado

### Formatos Suportados

O sistema suporta cookies em dois formatos:
- **JSON**: Formato exportado por extensões como EditThisCookie e Cookie-Editor (recomendado)
- **Texto**: Formato tradicional de cookies em arquivo de texto

## Solução de Problemas

Se você encontrar problemas:

1. **Cookies expirados**: Os cookies do YouTube geralmente expiram após algumas semanas. Se a extração falhar, tente exportar novos cookies.

2. **Formato incorreto**: Verifique se o arquivo JSON está no formato correto, como um array de objetos com propriedades `name` e `value`.

3. **Permissões**: Certifique-se de que o arquivo `cookies.json` está na raiz do projeto e é acessível pelo Node.js.

4. **Bloqueio persistente**: Se mesmo com cookies válidos o YouTube continuar bloqueando, tente usar o método yt-dlp que foi integrado ao código.

## Observações Importantes

- **Segurança**: Os cookies contêm informações de autenticação da sua conta do YouTube. Não compartilhe o arquivo `cookies.json` com terceiros.

- **Uso responsável**: Use esta funcionalidade apenas para fins legítimos e dentro dos termos de serviço do YouTube.

- **Atualizações**: O YouTube pode alterar seus mecanismos de proteção a qualquer momento, exigindo atualizações nesta abordagem.
