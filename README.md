# Oreon Launcher

Launcher oficial do servidor **Oreon** (Minecraft Roleplay RPG medieval), baseado no Helios Launcher.

## Visao Geral

O Oreon Launcher automatiza o processo para o jogador:

- baixar e validar arquivos do cliente;
- manter mods e bibliotecas atualizados via `distribution.json`;
- validar Java e iniciar o jogo com parametros corretos;
- conectar no servidor Oreon com um clique.

Stack principal:

- Electron
- EJS + CSS + JS
- `helios-core`

## Funcionalidades Atuais

- Gerenciamento de arquivos por manifesto remoto (`distribution.json`).
- Suporte a mod loader Fabric.
- Download e verificacao de integridade de dependencias antes de iniciar.
- Configuracoes de Java, memoria e diretorio de dados.
- Login Microsoft (dependente de aprovacao do App Registration).
- **Login Offline (provisorio)** para desenvolvimento/testes.

## Login

Atualmente existem dois fluxos:

1. **Microsoft Login**
2. **Login Offline**

Observacao importante sobre o modo offline:

- funciona para abrir o cliente e testar;
- para entrar em servidor com esse modo, o servidor precisa estar compatível com autenticacao offline (ex.: `online-mode=false` no ambiente de teste).

## Distribution (Manifesto do Launcher)

O launcher consome um JSON remoto definido em:

- [app/assets/js/distromanager.js](C:/Users/Admin/Documents/Projeto%20OreonLauncher/app/assets/js/distromanager.js)

Formato e exemplo local:

- [docs/oreon_distribution.json](C:/Users/Admin/Documents/Projeto%20OreonLauncher/docs/oreon_distribution.json)

No estado atual, o manifesto esta hospedado via GitHub Raw (branch `main`).

## Requisitos de Desenvolvimento

- Node.js 20.x
- Windows/macOS/Linux para build do launcher

## Executar em Desenvolvimento

```bash
npm install
npm start
```

## Build

```bash
npm run dist
```

Build por plataforma:

- `npm run dist:win`
- `npm run dist:mac`
- `npm run dist:linux`

## Estrutura Importante

- `index.js`: processo principal do Electron.
- `app/`: telas EJS, scripts e assets.
- `app/assets/js/processbuilder.js`: montagem do comando Java/Minecraft.
- `app/assets/js/authmanager.js`: autenticacao (Microsoft/offline).
- `docs/`: documentacao e manifestos de exemplo.

## Microsoft Authentication (Azure)

Para o login Microsoft funcionar em producao, o `AZURE_CLIENT_ID` do projeto precisa estar configurado e aprovado pela Microsoft/Minecraft.

Arquivo de configuracao:

- [app/assets/js/ipcconstants.js](C:/Users/Admin/Documents/Projeto%20OreonLauncher/app/assets/js/ipcconstants.js)

Guia:

- [docs/MicrosoftAuth.md](C:/Users/Admin/Documents/Projeto%20OreonLauncher/docs/MicrosoftAuth.md)

## Notas

- Este projeto e um fork/customizacao do Helios Launcher para o ecossistema Oreon.
- O `distribution.json` e a fonte de verdade para mods, bibliotecas, versoes e servidor alvo.
