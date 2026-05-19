# Discord News Feed

O launcher pode carregar noticias por um endpoint publico definido em `discordNews.url` no arquivo de distribuicao.
O token do bot nunca deve ir dentro do launcher.

## Configuracao sugerida

1. Crie um bot no Discord Developer Portal.
2. Convide o bot para o servidor `1378365916751859742`.
3. De permissao para ver os canais e ler historico de mensagens nos canais:
   - Avisos: `1406960395482038336`
   - Patch Notes: `1485740625579081848`
4. Publique `docs/discord-news-worker.js` como Cloudflare Worker.
5. Configure o secret do Worker:

```bash
wrangler secret put DISCORD_BOT_TOKEN
```

6. Atualize a distribuicao remota do launcher:

```json
{
  "discordNews": {
    "url": "https://shy-violet-c6e7.canallucastropod.workers.dev",
    "timeout": 5000
  }
}
```

O campo `rss` pode ficar como fallback, mas o launcher vai tentar `discordNews.url` primeiro.
