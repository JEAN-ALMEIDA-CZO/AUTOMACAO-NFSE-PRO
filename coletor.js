if (!window.baixadorXmlV4Iniciado) {
  window.baixadorXmlV4Iniciado = true;

  // --- EXCEÇÕES PERSONALIZADAS & LOGGING ---
  class ColetorNFSeException extends Error {
    constructor(mensagem, payload = {}) {
      super(mensagem);
      this.name = "ColetorNFSeException";
      this.payload = payload;
      this.timestamp = new Date().toISOString();
    }
    
    logarCirurgico() {
      console.error(`[${this.timestamp}] [${this.name}] ${this.message}`);
      console.error("Payload/Contexto:", JSON.stringify(this.payload, null, 2));
      console.error("Stack Trace:", this.stack);
    }
  }

  // --- CONFIGURAÇÕES GERAIS ---
  const CONFIG = {
    seletorTabela: 'tbody > tr',
    seletorHeaderPerfil: 'li.dropdown.perfil .dropdown-header',
    maxTentativas: 30,
    intervaloMs: 500,
    regexIdNota: /\/Visualizar\/Index\/(\d+)/,
    urlBaseXml: 'https://www.nfse.gov.br/EmissorNacional/Notas/Download/NFSe/',
    urlBasePdf: 'https://www.nfse.gov.br/EmissorNacional/Notas/Download/DANFSe/',
    storageKey: 'nfse_coletor_dados_temp',
    storageKeyEstado: 'nfse_coletor_ativo',
    storageKeyPaginaAtual: 'nfse_coletor_pagina_atual',
    storageKeyTotalPaginas: 'nfse_coletor_total_paginas',
    delayEntrePaginas: 2500,
    delayAposClick: 1200
  };

  function main() {
    console.log("[AUTOMAÇÃO NFSE] ========================================");
    console.log("[AUTOMAÇÃO NFSE] Iniciando script de conteúdo...");
    console.log("[AUTOMAÇÃO NFSE] ========================================");

    const estadoColeta = localStorage.getItem(CONFIG.storageKeyEstado);
    
    let tentativas = 0;
    const intervaloVerificacao = setInterval(() => {
      tentativas++;
      
      const linhasTabela = document.querySelectorAll(CONFIG.seletorTabela);
      const headerPerfil = document.querySelector(CONFIG.seletorHeaderPerfil);
      
      if ((linhasTabela.length > 0 && headerPerfil) || tentativas >= CONFIG.maxTentativas) {
        clearInterval(intervaloVerificacao);
        
        if (linhasTabela.length === 0) {
          console.log("[AUTOMAÇÃO NFSE] ⚠️ Tabela não encontrada ou vazia.");
          if (estadoColeta === 'ativo') {
            console.log("[AUTOMAÇÃO NFSE] Estado de coleta ativo, mas sem dados. Finalizando...");
            finalizarColetaAutomatica();
          }
          // Se não estiver ativo, mas for a página correta, renderiza a barra mesmo vazia para permitir a busca
          rotearEstrategia(headerPerfil, false, true);
          return;
        }

        console.log(`[AUTOMAÇÃO NFSE] ✅ Dados carregados. Total de linhas na página: ${linhasTabela.length}`);
        
        if (estadoColeta === 'ativo') {
          const paginaAtual = parseInt(localStorage.getItem(CONFIG.storageKeyPaginaAtual) || '1', 10);
          console.log(`[AUTOMAÇÃO NFSE] 🔄 Continuando coleta automática - Página ${paginaAtual}`);
          continuarColetaAutomatica(headerPerfil);
        } else {
          console.log("[AUTOMAÇÃO NFSE] 📋 Modo manual - mostrando interface para página atual");
          rotearEstrategia(headerPerfil, false, false);
        }
      }
    }, CONFIG.intervaloMs);
  }

  // --- COMPONENTES DE INTERFACE (MODAL E TOAST) ---

  function mostrarToast(mensagem, tipo = 'success', tempo = 3000) {
    const toastsAntigos = document.querySelectorAll('.nfse-modern-toast');
    toastsAntigos.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'nfse-modern-toast';
    
    let corBorda = '#10b981'; // Sucesso (Verde)
    let icone = '✅';
    if (tipo === 'info') { corBorda = '#3b82f6'; icone = 'ℹ️'; }
    if (tipo === 'error') { corBorda = '#ef4444'; icone = '❌'; }

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      backgroundColor: '#ffffff',
      color: '#334155',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      borderLeft: `5px solid ${corBorda}`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      fontSize: '14px',
      fontWeight: '600',
      zIndex: '2147483647',
      transform: 'translateX(150%)',
      transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });

    toast.innerHTML = `<span style="font-size: 20px;">${icone}</span> <span>${mensagem}</span>`;
    document.body.appendChild(toast);

    // Trigger de reflow forçado para garantir a transição via CSS
    void toast.offsetWidth;
    toast.style.transform = 'translateX(0)';

    setTimeout(() => {
      toast.style.transform = 'translateX(150%)';
      setTimeout(() => {
          if (toast.parentNode) toast.remove();
      }, 400); // Exclui do DOM após término da animação
    }, tempo);
  }

  function mostrarModalCustomizado(titulo, mensagem, tipo = 'alert', isDestrutivo = false) {
    return new Promise((resolve) => {
        const modalExistente = document.getElementById('nfse-modal-beautiful');
        if (modalExistente) modalExistente.remove();

        const overlay = document.createElement('div');
        overlay.id = 'nfse-modal-beautiful';
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            zIndex: '2147483647', display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            opacity: '0', transition: 'opacity 0.2s ease-in-out'
        });

        const corBotaoConfirma = isDestrutivo ? '#E52207' : '#1351B4';
        const corBotaoConfirmaHover = isDestrutivo ? '#C51C05' : '#0C326F';
        
        const conteudoFormatado = mensagem.replace(/\n/g, '<br>');
        const isConfirm = tipo === 'confirm';

        overlay.innerHTML = `
            <div style="background: #ffffff; border-radius: 16px; width: 90%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; transform: scale(0.95); transition: transform 0.2s ease-in-out;">
                <div style="padding: 24px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a;">${titulo}</h3>
                    <div style="font-size: 15px; color: #475569; line-height: 1.6;">${conteudoFormatado}</div>
                </div>
                <div style="background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
                    ${isConfirm ? `<button id="nfse-modal-btn-cancel" style="background: #e2e8f0; color: #475569; border: none; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;">Cancelar</button>` : ''}
                    <button id="nfse-modal-btn-ok" style="background: ${corBotaoConfirma}; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;">${isConfirm ? 'Confirmar' : 'Entendi'}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Dispara animação de entrada
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.firstElementChild.style.transform = 'scale(1)';
        }, 10);

        const fecharModal = (resultado) => {
            overlay.style.opacity = '0';
            overlay.firstElementChild.style.transform = 'scale(0.95)';
            setTimeout(() => {
                overlay.remove();
                resolve(resultado);
            }, 200);
        };

        const btnOk = document.getElementById('nfse-modal-btn-ok');
        btnOk.onmouseover = () => btnOk.style.background = corBotaoConfirmaHover;
        btnOk.onmouseout = () => btnOk.style.background = corBotaoConfirma;
        btnOk.onclick = () => fecharModal(true);

        if (isConfirm) {
            const btnCancel = document.getElementById('nfse-modal-btn-cancel');
            btnCancel.onmouseover = () => btnCancel.style.background = '#cbd5e1';
            btnCancel.onmouseout = () => btnCancel.style.background = '#e2e8f0';
            btnCancel.onclick = () => fecharModal(false);
        }
    });
  }

  // --- LÓGICA DE COLETA AUTOMÁTICA (PAGINAÇÃO) ---

  async function iniciarColetaGlobal(headerElement) {
    const totalRegistros = obterTotalRegistros();
    const totalPaginas = obterTotalPaginasReal();
    
    let mensagemConfirmacao = "⚠️ <strong>COLETA AUTOMÁTICA DE TODAS AS PÁGINAS</strong>\n\n";
    
    if (totalRegistros > 0) {
      mensagemConfirmacao += `📊 Total de registros detectados: <strong>${totalRegistros}</strong>\n`;
      mensagemConfirmacao += `📄 Total de páginas a percorrer: <strong>${totalPaginas}</strong>\n`;
      mensagemConfirmacao += `⏱️ Tempo estimado: <strong>${Math.ceil(totalPaginas * 2.5)} segundos</strong>\n\n`;
    }
    
    mensagemConfirmacao += "<strong>IMPORTANTE:</strong>\n";
    mensagemConfirmacao += "✓ NÃO feche esta aba/janela\n";
    mensagemConfirmacao += "✓ NÃO navegue para outras páginas\n";
    mensagemConfirmacao += "✓ Aguarde até a conclusão total\n\n";
    mensagemConfirmacao += "Deseja iniciar a varredura completa?";
    
    const confirmacao = await mostrarModalCustomizado("Varredura Automática", mensagemConfirmacao, 'confirm');
    
    if (!confirmacao) {
      console.log("[AUTOMAÇÃO NFSE] ❌ Varredura cancelada pelo usuário");
      return;
    }

    localStorage.setItem(CONFIG.storageKey, JSON.stringify([]));
    localStorage.setItem(CONFIG.storageKeyEstado, 'ativo');
    localStorage.setItem(CONFIG.storageKeyPaginaAtual, '1');
    localStorage.setItem(CONFIG.storageKeyTotalPaginas, String(totalPaginas));

    console.log("[AUTOMAÇÃO NFSE] ========================================");
    console.log("[AUTOMAÇÃO NFSE] 🚀 INICIANDO VARREDURA GLOBAL");
    console.log(`[AUTOMAÇÃO NFSE] 📊 Total de registros: ${totalRegistros}`);
    console.log(`[AUTOMAÇÃO NFSE] 📄 Total de páginas: ${totalPaginas}`);
    console.log("[AUTOMAÇÃO NFSE] ========================================");
    
    continuarColetaAutomatica(headerElement);
  }

  function obterTotalRegistros() {
    const descricaoPaginacao = document.querySelector('.paginacao .descricao');
    if (descricaoPaginacao) {
      const textoTotal = descricaoPaginacao.innerText;
      const match = textoTotal.match(/Total de (\d+) registros?/i);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    const elementoTotal = document.querySelector('.pagination-info');
    if (elementoTotal) {
      const textoTotal = elementoTotal.innerText;
      const match = textoTotal.match(/Total de (\d+) registros?/i);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    const rodape = document.querySelector('.dataTables_info');
    if (rodape) {
      const texto = rodape.innerText;
      const match = texto.match(/de (\d+) registros?/i) || texto.match(/of (\d+) entries/i);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    return 0;
  }

  function obterTotalPaginasReal() {
    const paginacao = document.querySelector('ul.pagination');
    if (!paginacao) return 1;

    const linkUltima = paginacao.querySelector('a[data-original-title="Última"]');
    if (linkUltima) {
      const href = linkUltima.getAttribute('href');
      const match = href.match(/pg=(\d+)/);
      if (match && match[1]) return parseInt(match[1], 10);
    }

    const totalRegistros = obterTotalRegistros();
    if (totalRegistros > 0) {
      return Math.ceil(totalRegistros / 15);
    }
    
    const itens = paginacao.querySelectorAll('li a');
    let maiorPagina = 1;
    itens.forEach(item => {
      const texto = item.innerText.trim();
      if (/^\d+$/.test(texto)) {
        const num = parseInt(texto, 10);
        if (num > maiorPagina) maiorPagina = num;
      }
    });
    
    if (maiorPagina > 1) return maiorPagina * 4;
    return 1;
  }

  function continuarColetaAutomatica(headerElement) {
    const paginaAtual = parseInt(localStorage.getItem(CONFIG.storageKeyPaginaAtual) || '1', 10);
    const totalPaginas = parseInt(localStorage.getItem(CONFIG.storageKeyTotalPaginas) || '1', 10);
    
    const novasNotas = extrairNotasDaPagina(headerElement);
    let acumulado = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "[]");
    
    novasNotas.forEach(nota => {
      if (!acumulado.find(n => n.id === nota.id)) {
        acumulado.push(nota);
      }
    });
    
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(acumulado));

    const botaoProxima = encontrarBotaoProxima();
    
    if (botaoProxima && paginaAtual < totalPaginas) {
      mostrarOverlayCarregando(acumulado.length, paginaAtual, totalPaginas);
      localStorage.setItem(CONFIG.storageKeyPaginaAtual, String(paginaAtual + 1));
      setTimeout(() => {
        botaoProxima.click();
      }, CONFIG.delayAposClick);
    } else {
      finalizarColetaAutomatica();
    }
  }

  function encontrarBotaoProxima() {
    const paginacao = document.querySelector('ul.pagination');
    if (!paginacao) return null;

    const todosItens = paginacao.querySelectorAll('li');

    for (let i = 0; i < todosItens.length; i++) {
      const item = todosItens[i];
      const link = item.querySelector('a');
      
      if (!link) continue;
      
      const titulo = link.getAttribute('data-original-title') || link.getAttribute('title') || '';
      const icone = link.querySelector('i');
      const classesIcone = icone ? icone.className : '';
      const href = link.getAttribute('href');
      
      if (titulo.toLowerCase().includes('próxima') || titulo.toLowerCase().includes('next')) {
        const estaDesabilitado = item.classList.contains('disabled') || 
                                 link.classList.contains('disabled') ||
                                 link.hasAttribute('disabled') ||
                                 href === 'javascript:' || href === '#';
        if (!estaDesabilitado) return link;
      }
      
      if (classesIcone.includes('fa-angle-right') && !classesIcone.includes('fa-angle-double-right')) {
        const estaDesabilitado = item.classList.contains('disabled') || 
                                 link.classList.contains('disabled') ||
                                 link.hasAttribute('disabled') ||
                                 href === 'javascript:' || href === '#';
        if (!estaDesabilitado) return link;
      }
    }
    return null;
  }

  async function finalizarColetaAutomatica() {
    localStorage.removeItem(CONFIG.storageKeyEstado);
    localStorage.removeItem(CONFIG.storageKeyPaginaAtual);
    localStorage.removeItem(CONFIG.storageKeyTotalPaginas);
    
    const todasNotas = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "[]");
    removerOverlayCarregando();
    
    if (todasNotas.length > 0) {
      let somaTotal = 0;
      todasNotas.forEach(n => somaTotal += n.valorFloat);
      const totalFormatado = somaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      let mensagem = "✅ VARREDURA CONCLUÍDA COM SUCESSO!\n\n";
      mensagem += `📊 Total de notas processadas: <strong>${todasNotas.length}</strong>\n`;
      mensagem += `💰 Valor total (Válidas): <strong>R$ ${totalFormatado}</strong>\n\n`;
      
      await mostrarModalCustomizado("Varredura Concluída", mensagem, 'alert');
      
      criarInterfaceFlutuante(todasNotas, true);
    } else {
      await mostrarModalCustomizado("Aviso", "⚠️ Nenhuma nota foi encontrada durante a varredura.", 'alert');
    }
  }

  function mostrarOverlayCarregando(qtdNotas, paginaAtual, totalPaginas) {
    let overlay = document.getElementById('nfse-overlay-loading');
    const percentual = totalPaginas > 0 ? Math.round((paginaAtual / totalPaginas) * 100) : 0;

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'nfse-overlay-loading';
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(248, 250, 252, 0.85)', backdropFilter: 'blur(10px)',
            zIndex: '2147483647', display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: '#1e293b', transition: 'opacity 0.4s ease'
        });
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div style="text-align: center; max-width: 580px; width: 90%; padding: 40px; background: rgba(255, 255, 255, 0.9); border-radius: 28px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);">
        <div style="display: flex; justify-content: center; margin-bottom: 30px;">
          <div class="nfse-modern-loader-light"></div>
        </div>
        <h2 style="font-size: 26px; font-weight: 800; margin: 0 0 8px 0; color: #0f172a;">Coletando Notas Fiscais</h2>
        <p style="font-size: 15px; margin-bottom: 35px; color: #64748b;">Aguarde o processamento...</p>
        <div style="background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="text-align: center; border-right: 1px solid #e2e8f0;">
              <div style="font-size: 11px; font-weight: 700;">Progresso</div>
              <div style="font-size: 24px; font-weight: 800; color: #0ea5e9;">${paginaAtual} / ${totalPaginas}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 11px; font-weight: 700;">Acumuladas</div>
              <div style="font-size: 24px; font-weight: 800; color: #10b981;">${qtdNotas}</div>
            </div>
          </div>
          <div style="width: 100%; height: 10px; background: #e2e8f0; border-radius: 10px; overflow: hidden;">
            <div style="width: ${percentual}%; height: 100%; background: #0ea5e9; transition: width 1s;"></div>
          </div>
        </div>
      </div>
      <style>
        .nfse-modern-loader-light {
          width: 50px; height: 50px; border-radius: 50%;
          background: conic-gradient(#0000 10%, #0ea5e9);
          -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 7px), #000 0);
          animation: nfse-spin 1s infinite linear;
        }
        @keyframes nfse-spin { to { transform: rotate(1turn); } }
      </style>
    `;
  }

  function removerOverlayCarregando() {
    const overlay = document.getElementById('nfse-overlay-loading');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 400);
    }
  }

  function rotearEstrategia(headerElement, autoMode, isTabelaVazia = false) {
    const notasPaginaAtual = isTabelaVazia ? [] : extrairNotasDaPagina(headerElement);
    // Sempre renderiza a barra se estiver na tela correta, mesmo sem notas, para permitir o uso do filtro
    criarInterfaceFlutuante(notasPaginaAtual, false, headerElement);
  }

  function extrairNotasDaPagina(headerElement) {
    const urlAtual = window.location.href.toLowerCase();
    const dadosPerfil = extrairDadosPerfil(headerElement);

    if (urlAtual.includes('/notas/emitidas')) {
      return processarNotasEmitidas(dadosPerfil);
    } else if (urlAtual.includes('/notas/recebidas')) {
      return processarNotasRecebidas(dadosPerfil);
    } else {
      return processarNotasEmitidas(dadosPerfil);
    }
  }

  function extrairDadosPerfil(headerElement) {
    let nomeTitular = "Empresa_Desconhecida";
    let docTitular = "";
    try {
      if (headerElement) {
        const textoBruto = headerElement.innerText;
        const matchDoc = textoBruto.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})|(\d{3}\.\d{3}\.\d{3}-\d{2})/);
        if (matchDoc) {
          docTitular = matchDoc[0].replace(/\D/g, '');
          const partes = textoBruto.split(matchDoc[0]);
          if (partes[0]) nomeTitular = partes[0].replace(/CNPJ/i, '').replace(/CPF/i, '').replace(/\s+/g, ' ').trim();
        }
      }
    } catch (e) {
        const exception = new ColetorNFSeException("Erro ao extrair dados do perfil", { elemento: headerElement?.innerHTML });
        exception.logarCirurgico();
    }
    return { nomeTitular, docTitular };
  }

  function obterCompetenciaAtual() {
    // Fonte da Verdade: O campo de data exibido no formulário do Governo
    const inputInicio = document.getElementById('datainicio');
    if (inputInicio && inputInicio.value) { // Ex: "01/02/2026"
      const partes = inputInicio.value.split('/');
      if (partes.length === 3) {
        return `${partes[1]}-${partes[2]}`; // Ex: "02-2026"
      }
    }
    // Fallback caso não encontre (nunca deve ocorrer em fluxo normal)
    const hoje = new Date();
    return `${String(hoje.getMonth() + 1).padStart(2, '0')}-${hoje.getFullYear()}`;
  }

  function encontrarIdNotaNaLinha(elementoLinha) {
    const html = elementoLinha.innerHTML;
    let match = html.match(CONFIG.regexIdNota);
    if (match && match[1]) return match[1];
    
    const linkXml = elementoLinha.querySelector('a[href*="/Notas/Download/NFSe/"]');
    if (linkXml) return linkXml.href.split('/').pop();
    
    return null;
  }
  
  function extrairNumeroNota(chave) {
    if (!chave) return "N/A";
    try {
      // Remove caracteres não numéricos para garantir uma análise segura
      const limpa = chave.replace(/\D/g, '');
      
      // Padrão Nacional NFS-e: A chave de acesso oficial possui exatas 50 posições.
      // O número da nota fiscal está fixado entre as posições 23 e 36 (índices 23 a 36)
      if (limpa.length === 50) {
        const numCortado = limpa.substring(23, 36);
        return parseInt(numCortado, 10).toString();
      }
      
      // Fallback Estrutural para chaves de outros tamanhos (se for o caso em sistemas híbridos):
      // Busca o preenchimento de zeros e extrai os dígitos estritamente antes dos últimos 14 caracteres de verificação
      const matchRegex = limpa.match(/0{3,}(\d+?)(?=\d{14}$)/);
      if (matchRegex && matchRegex[1]) {
        return parseInt(matchRegex[1], 10).toString();
      }
      
      return limpa;
    } catch (e) {
      const exception = new ColetorNFSeException("Erro na extração dinâmica do número da nota pela Chave.", { chaveFornecida: chave });
      exception.logarCirurgico();
      return chave;
    }
  }

  function limparValorMonetario(texto) {
    if (!texto) return 0.0;
    const limpo = texto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    const valor = parseFloat(limpo);
    return isNaN(valor) ? 0.0 : valor;
  }

  function sanitizarNomeArquivo(nome) {
    if (!nome) return 'SemNome';
    return nome.replace(/[:*?"<>|\\/]/g, '').replace(/\s+/g, ' ').trim();
  }

  function extrairTomadorDaLinha(linha) {
    let nomeTomador = "Tomador Nao Identificado";
    let docTomador = "";
    try {
      const celulaTomador = linha.querySelector('td.td-texto-grande');
      if (celulaTomador) {
        const divConteudo = celulaTomador.querySelector('div');
        if (divConteudo) {
          const textoCompleto = divConteudo.innerText.trim();
          const spanCnpj = divConteudo.querySelector('span.cnpj') || divConteudo.querySelector('span.cpf') || divConteudo.querySelector('span.nif');
          if (spanCnpj) {
            docTomador = spanCnpj.innerText.trim();
            const partes = textoCompleto.split(docTomador);
            if (partes.length >= 2) nomeTomador = partes[1].replace(/^[\s\-]+/, '').trim();
          } else {
            const matchDoc = textoCompleto.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})|(\d{3}\.\d{3}\.\d{3}-\d{2})/);
            if (matchDoc) {
              docTomador = matchDoc[0];
              const partes = textoCompleto.split(docTomador);
              if (partes.length >= 2) nomeTomador = partes[1].replace(/^[\s\-]+/, '').trim();
            } else {
              nomeTomador = textoCompleto.replace(/Tomador/i, '').trim();
            }
          }
        }
      }
    } catch (e) {
        const exception = new ColetorNFSeException("Erro ao extrair dados do Tomador.", { htmlLinha: linha.innerHTML });
        exception.logarCirurgico();
    }
    if (!nomeTomador || nomeTomador === "") nomeTomador = "Tomador Nao Identificado";
    return { nomeTomador, docTomador };
  }

  function processarNotasEmitidas(perfil) {
    const dataCompetencia = obterCompetenciaAtual();
    const pastaRaiz = `${perfil.nomeTitular} - ${perfil.docTitular} - ${dataCompetencia}`;
    const linhas = document.querySelectorAll(CONFIG.seletorTabela);
    const notas = [];

    linhas.forEach((linha) => {
      try {
        let idNota = encontrarIdNotaNaLinha(linha);
        if (idNota) {
          idNota = idNota.trim();
          let dataEmissao = "N/A";
          const celulaData = linha.querySelector('td.td-data');
          if (celulaData) dataEmissao = celulaData.innerText.trim().split('\n')[0];

          // Lendo da Fonte da Verdade (Data Attributes) para identificar o Status
          const sitDataAtrib = linha.getAttribute('data-situacao') || '';
          let statusNota = "Emitida";
          
          if (sitDataAtrib.includes('CANCELADA')) {
              statusNota = "NFS-e Cancelada";
          } else if (sitDataAtrib.includes('SUBSTITUIDA')) {
              statusNota = "NFS-e Substituída";
          } else {
              // Fallback visual
              const celulaSituacao = linha.querySelector('td.td-situacao');
              if (celulaSituacao) {
                const imgStatus = celulaSituacao.querySelector('img');
                if (imgStatus) {
                    statusNota = imgStatus.getAttribute('data-original-title') || imgStatus.getAttribute('title') || "Emitida";
                } else {
                    statusNota = celulaSituacao.innerText.trim() || "Emitida";
                }
              }
          }

          let valorTexto = "0,00";
          let valorOriginalFloat = 0.0;
          let valorFloat = 0.0;
          
          // Pegando o Valor cru nativo do Governo para garantir cálculo limpo
          const valDataAtrib = linha.getAttribute('data-valor');
          if (valDataAtrib) {
              valorOriginalFloat = parseFloat(valDataAtrib.replace(',', '.'));
              valorTexto = valorOriginalFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          } else {
              // Fallback visual
              const celulaValor = linha.querySelector('td.td-valor');
              if (celulaValor) {
                valorTexto = celulaValor.innerText.trim();
                valorOriginalFloat = limparValorMonetario(valorTexto);
              }
          }

          valorFloat = valorOriginalFloat;
          const statusLower = statusNota.toLowerCase();
          // Condição Crítica de Negócio: Zera o montante válido se a nota estiver morta contabilmente
          if (statusLower.includes('cancelada') || statusLower.includes('substituida') || statusLower.includes('substituída') || statusLower.includes('rejeitada')) {
              valorFloat = 0.0;
          }

          const dadosTomador = extrairTomadorDaLinha(linha);
          const numeroNotaReal = extrairNumeroNota(idNota);

          notas.push({
            id: idNota,
            numeroNota: numeroNotaReal,
            urlXml: `${CONFIG.urlBaseXml}${idNota}`,
            urlPdf: `${CONFIG.urlBasePdf}${idNota}`,
            pastaRaiz: pastaRaiz,
            dataEvento: dataEmissao,
            valorTexto: valorTexto,
            valorOriginalFloat: valorOriginalFloat, // Mantém o backup para relatório discriminado
            valorFloat: valorFloat, // Usado no cálculo Válido
            parteNome: dadosTomador.nomeTomador,
            parteDoc: dadosTomador.docTomador,
            status: statusNota,
            tipo: 'EMITIDA'
          });
        }
      } catch (e) {
        const exception = new ColetorNFSeException("Falha crítica no processamento de uma linha de Nota Emitida.", { htmlLinha: linha.innerHTML });
        exception.logarCirurgico();
      }
    });
    return notas;
  }

  function processarNotasRecebidas(perfil) {
    const dataCompetencia = obterCompetenciaAtual();
    const nomePerfilLimpo = sanitizarNomeArquivo(perfil.nomeTitular);
    const pastaRaiz = `${nomePerfilLimpo} - Recebidas - ${dataCompetencia}`;
    const linhas = document.querySelectorAll(CONFIG.seletorTabela);
    const notas = [];

    linhas.forEach((linha) => {
      try {
        const cols = linha.querySelectorAll('td');
        if (cols.length < 5) return;

        const idNotaRaw = encontrarIdNotaNaLinha(linha);
        if (!idNotaRaw) return;
        const idNota = idNotaRaw.trim();

        let nomePrestador = "Desconhecido";
        let docPrestador = "";
        const textoPrestador = cols[1].innerText.trim();
        
        const matchCnpj = textoPrestador.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})|(\d{3}\.\d{3}\.\d{3}-\d{2})/);
        if (matchCnpj) {
          docPrestador = matchCnpj[0];
          nomePrestador = textoPrestador.replace(docPrestador, '').replace(/^[P\-\s]+/, '').trim();
        } else {
          nomePrestador = textoPrestador;
        }

        const dataGeracao = cols[0].innerText.trim().split(' ')[0];
        
        // Validação segura da Situação
        const sitDataAtrib = linha.getAttribute('data-situacao') || '';
        let statusNota = "Recebida";
        
        if (sitDataAtrib.includes('CANCELADA')) {
            statusNota = "NFS-e Cancelada";
        } else if (sitDataAtrib.includes('SUBSTITUIDA')) {
            statusNota = "NFS-e Substituída";
        } else if (sitDataAtrib.includes('REJEITADA')) {
            statusNota = "NFS-e Rejeitada";
        } else {
            const imgStatus = cols[4] ? cols[4].querySelector('img') : null;
            if (imgStatus) {
                statusNota = imgStatus.getAttribute('data-original-title') || imgStatus.getAttribute('title') || "Recebida";
            }
        }

        // Extração rigorosa de valor Double-Tracking
        let valorTexto = "0,00";
        let valorOriginalFloat = 0.0;
        let valorFloat = 0.0;
        const valDataAtrib = linha.getAttribute('data-valor');
        
        if (valDataAtrib) {
            valorOriginalFloat = parseFloat(valDataAtrib.replace(',', '.'));
            valorTexto = valorOriginalFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            valorTexto = cols[3] ? cols[3].innerText.trim() : "0,00";
            valorOriginalFloat = limparValorMonetario(valorTexto);
        }

        valorFloat = valorOriginalFloat;
        const statusLower = statusNota.toLowerCase();
        
        // Zero Notas Recebidas e Canceladas na Origem
        if (statusLower.includes('cancelada') || statusLower.includes('substituida') || statusLower.includes('substituída') || statusLower.includes('rejeitada')) {
            valorFloat = 0.0;
        }
        
        const numeroNotaReal = extrairNumeroNota(idNota);

        notas.push({
          id: idNota,
          numeroNota: numeroNotaReal,
          urlXml: `${CONFIG.urlBaseXml}${idNota}`,
          urlPdf: `${CONFIG.urlBasePdf}${idNota}`,
          pastaRaiz: pastaRaiz,
          dataEvento: dataGeracao,
          valorTexto: valorTexto,
          valorOriginalFloat: valorOriginalFloat, // Histórico de Canceladas
          valorFloat: valorFloat, // Processado Válido
          parteNome: nomePrestador,
          parteDoc: docPrestador,
          status: statusNota,
          tipo: 'RECEBIDA'
        });
      } catch (e) {
        const exception = new ColetorNFSeException("Falha crítica no processamento de uma linha de Nota Recebida.", { htmlLinha: linha.innerHTML });
        exception.logarCirurgico();
      }
    });
    return notas;
  }

  // --- INTERFACE TIPO SUB-NAVBAR ---
  function criarInterfaceFlutuante(listaNotas, isModoGlobal = false, headerElement = null) {
    const containerAntigo = document.getElementById('container-baixador-nfse');
    if (containerAntigo) containerAntigo.remove();

    const container = document.createElement('div');
    container.id = 'container-baixador-nfse';
    
    // Sub Navbar perfeitamente estilizada para mesclar com o tema
    Object.assign(container.style, {
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      gap: '15px', 
      backgroundColor: '#f8fafc', // Fundo clean
      padding: '12px 20px', 
      borderBottom: '2px solid #cbd5e1', 
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      width: '100%',
      position: 'relative',
      zIndex: '9998',
      flexWrap: 'wrap' // Permite quebra se a tela for pequena
    });

    // ==========================================
    // 1. BLOCO DE FILTRO POR COMPETÊNCIA
    // ==========================================
    const divFiltro = document.createElement('div');
    Object.assign(divFiltro.style, { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        borderRight: '2px solid #cbd5e1', 
        paddingRight: '15px' 
    });

    const tituloFiltro = document.createElement('strong');
    tituloFiltro.style.color = '#0C326F';
    tituloFiltro.style.fontSize = '13px';
    tituloFiltro.innerHTML = '📅 Consultar Competência:';

    const selectMes = document.createElement('select');
    estilizarSelect(selectMes);
    
    const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    // Leitura Dinâmica do DOM para manter o select fiel ao que o usuário buscou
    let mesVisualizado = new Date().getMonth() + 1;
    let anoVisualizado = new Date().getFullYear();
    
    const inputInicioDOM = document.getElementById('datainicio');
    if (inputInicioDOM && inputInicioDOM.value) {
        const partes = inputInicioDOM.value.split('/');
        if (partes.length === 3) {
            mesVisualizado = parseInt(partes[1], 10);
            anoVisualizado = parseInt(partes[2], 10);
        }
    }
    
    const nomeMesAtualDisplay = mesesNomes[mesVisualizado - 1] || "Competência";

    mesesNomes.forEach((nome, i) => {
        adicionarOpcao(selectMes, i + 1, `${nome}/${anoVisualizado}`);
    });
    
    // Trava o select na competência lida do DOM
    selectMes.value = mesVisualizado;

    const btnConsultar = document.createElement('button');
    btnConsultar.innerHTML = '🔍 Buscar';
    estilizarBotao(btnConsultar);
    btnConsultar.style.backgroundColor = '#1351B4'; // Azul (difere do verde do download)
    
    btnConsultar.onmouseover = () => btnConsultar.style.backgroundColor = '#0C326F';
    btnConsultar.onmouseout = () => btnConsultar.style.backgroundColor = '#1351B4';

    btnConsultar.addEventListener('click', async () => {
        const mes = parseInt(selectMes.value, 10);
        // Calcula dinamicamente o último dia do mês selecionado
        const ultimoDia = new Date(anoVisualizado, mes, 0).getDate();
        const mesFormatado = String(mes).padStart(2, '0');
        
        const inputInicio = document.getElementById('datainicio');
        const inputFim = document.getElementById('datafim');
        // Busca o botão nativo do sistema do Governo
        const btnSubmit = document.querySelector('button[type="submit"].btn-primary');
        
        if (inputInicio && inputFim && btnSubmit) {
            // Preenche e dispara eventos para ativar a detecção de mudança do site Gov
            inputInicio.value = `01/${mesFormatado}/${anoVisualizado}`;
            inputInicio.dispatchEvent(new Event('input', { bubbles: true }));
            inputInicio.dispatchEvent(new Event('change', { bubbles: true }));
            
            inputFim.value = `${ultimoDia}/${mesFormatado}/${anoVisualizado}`;
            inputFim.dispatchEvent(new Event('input', { bubbles: true }));
            inputFim.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Pausa sutil antes de clicar para renderização do DOM
            setTimeout(() => btnSubmit.click(), 200);
        } else {
            await mostrarModalCustomizado("Erro de Interface", "⚠️ Campos de data ou botão de busca não encontrados nesta tela.", 'alert');
        }
    });

    divFiltro.appendChild(tituloFiltro);
    divFiltro.appendChild(selectMes);
    divFiltro.appendChild(btnConsultar);
    container.appendChild(divFiltro);


    // ==========================================
    // 2. BLOCO DE EXPORTAÇÃO
    // ==========================================
    const tituloBarra = document.createElement('div');
    tituloBarra.innerHTML = `<span style="font-size: 16px; margin-right: 8px;">📥</span><strong style="color: #0C326F; font-size: 13px;">Exportar:</strong>`;
    
    const selectTipo = document.createElement('select');
    estilizarSelect(selectTipo);
    adicionarOpcao(selectTipo, 'xml', 'Formato XML');
    adicionarOpcao(selectTipo, 'pdf', 'Formato PDF');
    adicionarOpcao(selectTipo, 'txt', 'Relatório TXT');

    const btnBaixar = document.createElement('button');
    const spanTexto = document.createElement('span');
    btnBaixar.appendChild(spanTexto);
    estilizarBotao(btnBaixar);

    function atualizarTextoBotao() {
        if (btnBaixar.disabled) return;
        const tipo = selectTipo.value;
        let acao = "Baixar XMLs";
        if (tipo === 'pdf') acao = "Baixar PDFs";
        if (tipo === 'txt') acao = "Gerar Relatório";
        
        if (listaNotas.length === 0) {
            spanTexto.textContent = "Nenhuma Nota Encontrada";
            btnBaixar.disabled = true;
            btnBaixar.style.backgroundColor = '#94a3b8';
            btnBaixar.style.cursor = 'not-allowed';
        } else {
            let somaTotalValida = 0;
            listaNotas.forEach(n => somaTotalValida += n.valorFloat);
            
            // Injeção do Nome do Mês dinâmico no Botão de Download para comprovar a visualização
            spanTexto.textContent = isModoGlobal 
                ? `${acao} de ${nomeMesAtualDisplay} (${listaNotas.length} Notas)` 
                : `${acao} de ${nomeMesAtualDisplay} (${listaNotas.length} | Válido R$ ${somaTotalValida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
            
            btnBaixar.disabled = false;
            btnBaixar.style.backgroundColor = '#138E2C';
            btnBaixar.style.cursor = 'pointer';
        }
    }

    selectTipo.addEventListener('change', atualizarTextoBotao);
    atualizarTextoBotao();

    btnBaixar.addEventListener('click', () => {
      if (listaNotas.length === 0) return;
      const tipo = selectTipo.value;
      
      if (tipo === 'txt') {
        gerarRelatorioTxt(listaNotas);
        marcarOpcaoComoConcluida(selectTipo, 'txt');
        selectTipo.value = Array.from(selectTipo.options).find(o => !o.disabled)?.value || 'xml';
        atualizarTextoBotao();
        return;
      }
      iniciarDownloadEmMassa(listaNotas, tipo, btnBaixar, spanTexto, selectTipo, isModoGlobal, atualizarTextoBotao);
    });

    container.appendChild(tituloBarra);
    container.appendChild(selectTipo);
    container.appendChild(btnBaixar);

    // ==========================================
    // 3. AÇÕES GLOBAIS E FECHAMENTO
    // ==========================================
    if (!isModoGlobal && headerElement) {
      const divisor = document.createElement('div');
      Object.assign(divisor.style, { width: '1px', height: '24px', backgroundColor: '#cbd5e1', margin: '0 8px' });
      
      const btnVarredura = document.createElement('button');
      btnVarredura.innerHTML = 'Reprocessar Todas as Páginas';
      Object.assign(btnVarredura.style, {
        backgroundColor: '#1351B4', color: 'white', border: 'none', borderRadius: '6px',
        padding: '9px 18px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
      });
      btnVarredura.onmouseover = () => btnVarredura.style.backgroundColor = '#0C326F';
      btnVarredura.onmouseout = () => btnVarredura.style.backgroundColor = '#1351B4';
      btnVarredura.onclick = () => iniciarColetaGlobal(headerElement);
      
      container.appendChild(divisor);
      container.appendChild(btnVarredura);
    }

    if (isModoGlobal) {
      const divisor = document.createElement('div');
      Object.assign(divisor.style, { width: '1px', height: '24px', backgroundColor: '#cbd5e1', margin: '0 8px' });
      
      const btnFechar = document.createElement('button');
      btnFechar.innerHTML = '✖ Fechar Lote';
      Object.assign(btnFechar.style, { 
          background: 'transparent', border: '1px solid #E52207', color: '#E52207', borderRadius: '6px',
          padding: '8px 15px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s'
      });
      btnFechar.onmouseover = () => { btnFechar.style.background = '#E52207'; btnFechar.style.color = '#fff'; };
      btnFechar.onmouseout = () => { btnFechar.style.background = 'transparent'; btnFechar.style.color = '#E52207'; };
      btnFechar.onclick = async () => {
        const confirmou = await mostrarModalCustomizado(
            "Encerrar Varredura", 
            "Deseja realmente fechar a interface global e limpar os dados coletados temporariamente?", 
            'confirm', 
            true // isDestrutivo = true (Botão Vermelho)
        );
        if (confirmou) {
          container.remove();
          localStorage.removeItem(CONFIG.storageKey);
        }
      };
      
      container.appendChild(divisor);
      container.appendChild(btnFechar);
    }

    // Injeção Inteligente: Cola a sub-navbar logo abaixo do banner principal
    const bannerPrincipal = document.getElementById('nfse-pro-setup-banner');
    if (bannerPrincipal) {
        bannerPrincipal.insertAdjacentElement('afterend', container);
    } else {
        document.body.insertBefore(container, document.body.firstChild);
    }
  }

  function estilizarSelect(el) {
    Object.assign(el.style, { 
        padding: '8px 12px', borderRadius: '6px', border: '1px solid #1351B4', 
        cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#1351B4',
        backgroundColor: '#fff', outline: 'none'
    });
  }

  function estilizarBotao(el) {
    Object.assign(el.style, { 
        backgroundColor: '#138E2C', color: 'white', border: 'none', borderRadius: '6px', 
        padding: '9px 18px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', 
        boxShadow: '0 2px 6px rgba(19, 142, 44, 0.2)', transition: 'all 0.2s'
    });
    // Limpa a cor no mouseout se o hover for nativo e não for o botão de consultar
    el.onmouseover = () => { if(!el.disabled && el.style.backgroundColor !== 'rgb(19, 81, 180)') el.style.backgroundColor = '#0F6A21'; };
    el.onmouseout = () => { if(!el.disabled && el.style.backgroundColor !== 'rgb(12, 50, 111)') el.style.backgroundColor = '#138E2C'; };
  }

  function adicionarOpcao(select, valor, texto) {
    const opt = document.createElement('option');
    opt.value = valor; opt.text = texto;
    select.appendChild(opt);
  }

  function marcarOpcaoComoConcluida(select, valor) {
    const opt = select.querySelector(`option[value="${valor}"]`);
    if (opt) { opt.text += ` (Baixado)`; opt.disabled = true; }
  }

  function iniciarDownloadEmMassa(listaNotas, tipoArquivo, btn, spanTexto, select, isModoGlobal, callbackTexto) {
    const fila = listaNotas.map(nota => {
      const ext = tipoArquivo === 'xml' ? '.xml' : '.pdf';
      const url = tipoArquivo === 'xml' ? nota.urlXml : nota.urlPdf;
      
      // Nova formatação do nome do arquivo padronizado (Snake Case Uppercase)
      // Ex: ARTCON EMPREENDIMENTOS LTDA. -> ARTCON_EMPREENDIMENTOS_LTDA
      let nomeFormatado = sanitizarNomeArquivo(nota.parteNome)
        .replace(/\./g, '')          // Remove pontos para evitar extensão .ltda.xml
        .trim()                      // Limpa as bordas
        .replace(/\s+/g, '_')        // Substitui espaços vazios por underscore
        .toUpperCase()               // Mantém padronizado em CAIXA ALTA
        .substring(0, 50)            // Limita a 50 caracteres para segurança do FileSystem
        .replace(/_+$/, '');         // Garante que o corte não deixe um underscore inútil no final da string

      // Injeção de status condicional: Se a nota foi invalidada, sufixa no nome do arquivo
      let sufixoStatus = '';
      const statusNormalizado = nota.status.toLowerCase();
      
      if (statusNormalizado.includes('cancelada')) {
          sufixoStatus = '_CANCELADA';
      } else if (statusNormalizado.includes('substituida') || statusNormalizado.includes('substituída')) {
          sufixoStatus = '_SUBSTITUIDA';
      } else if (statusNormalizado.includes('rejeitada')) {
          sufixoStatus = '_REJEITADA';
      }

      return { 
        url: url, 
        folderName: `${nota.pastaRaiz}/${tipoArquivo}`, 
        filename: `NFSE_${nota.numeroNota}_${nomeFormatado}${sufixoStatus}${ext}` 
      };
    });

    if (fila.length === 0) return;

    select.disabled = true; 
    btn.disabled = true; 
    btn.style.opacity = '0.7'; 
    btn.style.cursor = 'wait';
    spanTexto.textContent = 'Baixando...';

    const onComplete = () => {
      marcarOpcaoComoConcluida(select, tipoArquivo);
      const temOpcao = Array.from(select.options).some(o => !o.disabled);
      
      setTimeout(() => {
        if (!temOpcao) {
          btn.style.backgroundColor = '#94a3b8'; 
          btn.style.boxShadow = 'none';
          spanTexto.textContent = 'Tudo baixado ✓';
          mostrarToast("Todos os formatos foram exportados com sucesso!", "success");
        } else {
          btn.style.backgroundColor = '#138E2C';
          btn.disabled = false; 
          btn.style.opacity = '1'; 
          btn.style.cursor = 'pointer'; 
          select.disabled = false;
          
          const proxima = Array.from(select.options).find(o => !o.disabled);
          if (proxima) select.value = proxima.value;
          
          if(callbackTexto) callbackTexto(); 
          mostrarToast(`Lote de ${tipoArquivo.toUpperCase()} baixado com sucesso!`, "success");
        }
      }, 1500);
    };

    processarFilaSequencial(fila, 0, spanTexto, btn, onComplete);
  }

  function processarFilaSequencial(lista, indice, elTexto, elBtn, callback) {
    if (indice >= lista.length) {
      elTexto.textContent = 'Concluído!'; 
      elBtn.style.backgroundColor = '#0f9e31';
      setTimeout(() => { if (callback) callback(); }, 500);
      return;
    }
    const item = lista[indice];
    const percentual = Math.round(((indice + 1) / lista.length) * 100);
    elTexto.textContent = `${indice + 1}/${lista.length} (${percentual}%)`;
    chrome.runtime.sendMessage({ type: 'downloadXmlSeguro', payload: item });
    setTimeout(() => { processarFilaSequencial(lista, indice + 1, elTexto, elBtn, callback); }, 800);
  }

  function gerarRelatorioTxt(listaNotas) {
    if (!listaNotas || listaNotas.length === 0) return;
    
    try {
      const pasta = listaNotas[0].pastaRaiz;
      const isRecebida = listaNotas[0].tipo === 'RECEBIDA';
      const tipoRelatorio = isRecebida ? "NOTAS RECEBIDAS (TOMADAS)" : "NOTAS EMITIDAS (PRESTADAS)";

      let conteudo = `RELATÓRIO DE NOTAS FISCAIS - ${tipoRelatorio}\n${'='.repeat(150)}\nPASTA: ${pasta}\nGerado em: ${new Date().toLocaleString('pt-BR')}\nTotal de Notas Processadas: ${listaNotas.length}\n${'='.repeat(150)}\n\n`;
      
      conteudo += `DATA        | NÚMERO DA NOTA       |      VALOR (R$) | SITUAÇÃO          | ${isRecebida ? "PRESTADOR" : "TOMADOR"}\n${'-'.repeat(150)}\n`;
      
      let totalEmitidasValidas = 0.0;
      let totalCanceladasSubstituidas = 0.0;
      let qtdValidas = 0;
      let qtdCanceladas = 0;

      listaNotas.forEach(nota => {
        const isCancelada = nota.status.toLowerCase().includes('cancelada') || 
                            nota.status.toLowerCase().includes('rejeitada') || 
                            nota.status.toLowerCase().includes('substituída') || 
                            nota.status.toLowerCase().includes('substituida');
        
        // Exibimos o valor original na linha para manter o histórico, mas o somatório é segregado
        const valorVisualRow = nota.valorOriginalFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const numNotaLimpo = nota.numeroNota.padEnd(20);

        conteudo += `${nota.dataEvento.padEnd(12)}| ${numNotaLimpo} | ${valorVisualRow.padStart(15)} | ${nota.status.substring(0, 18).padEnd(18)}| ${nota.parteNome.substring(0, 50)}\n`;
        
        if (isCancelada) {
            totalCanceladasSubstituidas += nota.valorOriginalFloat;
            qtdCanceladas++;
        } else {
            totalEmitidasValidas += nota.valorOriginalFloat;
            qtdValidas++;
        }
      });

      conteudo += `${'-'.repeat(150)}\n\nRESUMO FINANCEIRO (DISCRIMINADO):\n${'-'.repeat(150)}\n`;
      conteudo += `-> TOTAL VALOR EMITIDAS/VÁLIDAS: R$ ${totalEmitidasValidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${qtdValidas} notas)\n`;
      conteudo += `-> TOTAL VALOR CANCELADAS/SUBSTITUÍDAS: R$ ${totalCanceladasSubstituidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${qtdCanceladas} notas)\n\n`;
      conteudo += `* Regra de Negócio: O valor das notas canceladas/substituídas é zerado contabilmente, não integrando o montante das válidas.\n`;

      // Converte o texto para Base64 (Lidando com acentuação via encodeURIComponent para evitar quebra de caracteres)
      const base64Content = btoa(unescape(encodeURIComponent(conteudo)));
      const dataUrl = 'data:text/plain;charset=utf-8;base64,' + base64Content;
      
      const nomeArquivo = `Relatorio-NFSe-${sanitizarNomeArquivo(pasta)}-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.txt`;

      // Aciona a mesma API do Chrome via background.js enviando a String Base64 como URL
      chrome.runtime.sendMessage({ 
          type: 'downloadXmlSeguro', 
          payload: {
              url: dataUrl,
              folderName: pasta, // Passamos a pasta raiz exata para alinhar com os PDFs/XMLs
              filename: nomeArquivo
          } 
      });
      
      mostrarToast("Relatório de conferência gerado com sucesso!", "info");
      
    } catch (e) {
      const exception = new ColetorNFSeException("Falha crítica ao gerar o Relatório TXT Finalizado.", { qtdeNotas: listaNotas.length });
      exception.logarCirurgico();
      mostrarToast("Erro ao tentar gerar o relatório TXT.", "error");
    }
  }

  main();
}