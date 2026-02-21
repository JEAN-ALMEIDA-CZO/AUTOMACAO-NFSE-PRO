/**
 * background.js
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // ── DOWNLOAD DE XML ─────────────────────────────────────────────────────────
  if (message.type === 'downloadXmlSeguro') {
    const { url, folderName, filename } = message.payload;

    if (!url) {
      console.error('[AUTOMAÇÃO NFSE] URL inválida recebida no Background.');
      return;
    }

    // Sanitização do nome da pasta (Remove caracteres proibidos no Windows/Linux)
    const pastaSegura = folderName.replace(/[:*?"<>|\\]/g, '');

    // Garante que não haja barras duplas acidentais no caminho final
    const caminhoLimpo = `${pastaSegura}/${filename}`.replace(/\/\//g, '/');

    console.log(`[AUTOMAÇÃO NFSE] Baixando: ${caminhoLimpo}`);

    chrome.downloads.download({
      url:            url,
      filename:       caminhoLimpo,
      conflictAction: 'overwrite',
      saveAs:         false // Salva silenciosamente na pasta padrão sem abrir prompt
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error(
          `[AUTOMAÇÃO NFSE] Falha no download de ${filename}:`,
          chrome.runtime.lastError.message
        );
      } else {
        console.log(`[AUTOMAÇÃO NFSE] Download iniciado com sucesso: ID ${downloadId}`);
      }
    });

    return true;
  }

  // ── ABRIR GERADOR.HTML ──────────────────────────────────────────────────────
  if (message.type === 'openGerador') {
    chrome.tabs.create({ url: chrome.runtime.getURL('gerador.html') }, (tab) => {
      if (chrome.runtime.lastError) {
        console.error(
          '[AUTOMAÇÃO NFSE] Falha ao abrir gerador.html:',
          chrome.runtime.lastError.message
        );
      } else {
        console.log(`[AUTOMAÇÃO NFSE] gerador.html aberto na aba ID ${tab.id}`);
      }
    });
    return true;
  }

});