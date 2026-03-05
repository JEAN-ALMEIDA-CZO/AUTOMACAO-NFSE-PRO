chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // =========================================================================
  // ROTA 1: ABERTURA DE PÁGINAS PRIVILEGIADAS (BYPASS DE POPUP BLOCKER)
  // =========================================================================
  if (message.action === 'ABRIR_PAGINA_GERADOR') {
    console.log("[AUTOMAÇÃO NFSE] Solicitação para abrir o Gerador recebida.");
    
    chrome.tabs.create({ 
        url: chrome.runtime.getURL("gerador.html") 
    });
    
    sendResponse({ success: true });
    return true; // Mantém o canal de comunicação aberto
  }

  // =========================================================================
  // ROTA 2: MOTOR DE DOWNLOAD SILENCIOSO E ROTEAMENTO DE PASTAS
  // =========================================================================
  if (message.type === 'downloadXmlSeguro') {
    const { url, folderName, filename } = message.payload;

    if (!url) {
      console.error("[AUTOMAÇÃO NFSE] URL inválida recebida no Background.");
      return;
    }

    // Sanitização do nome da pasta (Remove caracteres proibidos no Windows/Linux)
    const pastaSegura = folderName.replace(/[:*?"<>|\\]/g, '');
    
    // Garante que não haja barras duplas acidentais no caminho final
    const caminhoLimpo = `${pastaSegura}/${filename}`.replace(/\/\//g, '/');

    console.log(`[AUTOMAÇÃO NFSE] Baixando: ${caminhoLimpo}`);

    chrome.downloads.download({
      url: url,
      filename: caminhoLimpo,
      conflictAction: 'overwrite', 
      saveAs: false // Salva silenciosamente na pasta padrão de downloads sem abrir prompt
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error(`[AUTOMAÇÃO NFSE] Falha no download de ${filename}:`, chrome.runtime.lastError.message);
      } else {
        console.log(`[AUTOMAÇÃO NFSE] Download iniciado com sucesso: ID ${downloadId}`);
      }
    });

    sendResponse({ success: true });
    return true; // Mantém o canal de comunicação aberto para o assincronismo da API de Downloads
  }
});