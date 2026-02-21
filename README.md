# 🤖 Automação NFS-e PRO

[![Direitos Reservados](https://img.shields.io/badge/Licen%C3%A7a-Direitos_Reservados-lightgrey.svg)](#%EF%B8%8F-propriedade-intelectual-e-uso)
[![Problemas Abertos](https://img.shields.io/github/issues/JEAN-ALMEIDA-CZO/automacao-nfse-pro?color=red)](https://github.com/JEAN-ALMEIDA-CZO/automacao-nfse-pro/issues)
[![Último Commit](https://img.shields.io/github/last-commit/JEAN-ALMEIDA-CZO/automacao-nfse-pro?color=blue)](https://github.com/JEAN-ALMEIDA-CZO/automacao-nfse-pro/commits)

Uma extensão avançada para navegadores baseados em Chromium (Chrome/Edge) desenvolvida para assumir o controlo do Emissor Nacional de NFS-e (Gov.br). Ela transforma o trabalho manual e repetitivo num processo **100% automatizado, rápido e silencioso**, gerindo faturações, extração de notas e relatórios de fecho de forma inteligente.

---

<p align="center">
  <img src="Automação NFSE PRO.png" alt="Automação NFS-e PRO" width="100%">

</p>

👉 [**Ver Vídeo Completo de Demonstração**](https://drive.google.com/file/d/1PEGc5pD1N60SQVY16Q8wxNeKpUDCqZCq/preview)

---

## ✨ Funcionalidades

- 📊 **Gerador de Planilha Nativo**: Monte o seu CSV numa interface visual intuitiva dentro da própria extensão. Perfeito para cadastrar diversos tipos de serviços e gerir a emissão de **notas recorrentes** em segundos.
- 🤖 **Emissão 100% Automatizada**: O robô processa o seu ficheiro CSV, navega e preenche sozinho todas as etapas complexas do portal do Governo (Pessoas, Serviço, Valores), emitindo lotes inteiros sem intervenção humana.
- 📥 **Extração Inteligente em Lote**: Acabou o fecho mensal? A ferramenta varre as páginas e descarrega todos os ficheiros **XML e PDF** (notas emitidas e recebidas) de uma vez, sem precisar de cliques repetitivos.
- 📈 **Auditoria e Relatórios Integrados**: Geração instantânea de relatórios em formato TXT com inteligência de cálculo, separando visualmente e somando automaticamente os montantes de notas válidas e notas canceladas/rejeitadas.
- 🌐 **Tudo Direto no Navegador**: Uma arquitetura leve e segura. A automação conta com uma interface moderna que exibe o progresso em tempo real no ecrã, sem exigir a instalação de softwares pesados de terceiros na máquina.

---

## 🛠️ Tecnologias Utilizadas

- **JavaScript (Vanilla)** — Lógica assíncrona, injeção de interface, controlo de DOM e manipulação de ficheiros.
- **Manifest V3** — Padrão mais recente, seguro e performático para extensões do Google Chrome.
- **Chrome Extension API** — Utilização intensa de `chrome.downloads`, `chrome.storage.local` e `chrome.runtime` (Message Passing).
- **HTML5 & CSS3** — Interface injetada com *Glassmorphism* para se adaptar nativamente ao layout do portal Gov.br.

---

## 🧩 Estrutura do Projeto

A arquitetura foi desenhada para contornar limitações de segurança e lentidões de instâncias AJAX do portal governamental:

- `manifest.json` — Coração da extensão, define permissões (storage, downloads) e as injeções nos scripts.
- `background.js` — Service Worker isolado responsável por gerir a fila de downloads silenciosos.
- `content.js` / `coletor.js` — Motores injetados no DOM. Analisam tabelas, extraem dados, inserem overlays e geram os documentos.
- `bridge.js` — Ponte executada no contexto `MAIN`. É responsável por se comunicar diretamente com as bibliotecas nativas do portal (jQuery e Select2), contornando restrições de CORS.
- `gerador.html` / `gerador.js` — Interface autónoma para criação visual e formatação correta dos ficheiros CSV.

---

## 🚀 Como Instalar e Usar no Navegador

Como esta é uma ferramenta de automação customizada, a instalação é feita através do **Modo de Desenvolvedor** em qualquer navegador baseado em Chromium (Chrome, Edge, Brave, etc).

**Passo a passo:**

**Passo 1: Faça o Download do Projeto**
Clone este repositório na sua máquina ou faça o download em formato `.zip` (e descompacte a pasta).

```bash
   git clone https://github.com/JEAN-ALMEIDA-CZO/AUTOMACAO-NFSE-PRO.git
   ```

(Ou clique no botão verde "Code" do GitHub e depois em "Download ZIP", descompactando a pasta em seguida).

**Passo 2: Aceda à página de Extensões**
Abra o seu navegador e digite o seguinte endereço na barra de URL:
- **Google Chrome / Brave:** `chrome://extensions/`
- **Microsoft Edge:** `edge://extensions/`

**Passo 3: Ative o Modo do Desenvolvedor**
No canto superior direito da tela de extensões, ative a chave "Modo do desenvolvedor" (Developer mode).

**Passo 4: Carregue a Extensão**
Clique no botão "Carregar sem compactação" (Load unpacked) que aparecerá no canto superior esquerdo. Na janela que abrir, selecione a pasta da extensão que você baixou (a pasta raiz onde está o arquivo `manifest.json`).

**Passo 5: Pronto! 🎉**
A extensão já está instalada e ativa. Basta aceder ao portal do Emissor Nacional de NFS-e (Gov.br) e as barras de automação aparecerão automaticamente na sua tela!

---

## ⚠️ Propriedade Intelectual e Uso

Este projeto é de minha autoria e está protegido pela Lei do Software (Lei nº 9.609/98) e pela Lei de Direitos Autorais (Lei nº 9.610/98). O código pode ser discutido e servir de inspiração, desde que dados os devidos créditos. A cópia, comercialização, distribuição ou revenda desta ferramenta é estritamente proibida.
