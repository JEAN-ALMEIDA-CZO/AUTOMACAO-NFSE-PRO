if (!window.baixadorXmlV4Iniciado) {
  window.baixadorXmlV4Iniciado = true;

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
          const paginaAtual = parseInt(localStorage.getItem(CONFIG.storageKeyPaginaAtual) || '1');
          console.log(`[AUTOMAÇÃO NFSE] 🔄 Continuando coleta automática - Página ${paginaAtual}`);
          continuarColetaAutomatica(headerPerfil);
        } else {
          console.log("[AUTOMAÇÃO NFSE] 📋 Modo manual - mostrando interface para página atual");
          rotearEstrategia(headerPerfil, false, false);
        }
      }
    }, CONFIG.intervaloMs);
  }

  // --- LÓGICA DE COLETA AUTOMÁTICA (PAGINAÇÃO) ---

  function iniciarColetaGlobal(headerElement) {
    const totalRegistros = obterTotalRegistros();
    const totalPaginas = obterTotalPaginasReal();
    
    let mensagemConfirmacao = "⚠️ COLETA AUTOMÁTICA DE TODAS AS PÁGINAS\n\n";
    
    if (totalRegistros > 0) {
      mensagemConfirmacao += `📊 Total de registros detectados: ${totalRegistros}\n`;
      mensagemConfirmacao += `📄 Total de páginas a percorrer: ${totalPaginas}\n`;
      mensagemConfirmacao += `⏱️ Tempo estimado: ${Math.ceil(totalPaginas * 2.5)} segundos\n\n`;
    }
    
    mensagemConfirmacao += "IMPORTANTE:\n";
    mensagemConfirmacao += "✓ NÃO feche esta aba/janela\n";
    mensagemConfirmacao += "✓ NÃO navegue para outras páginas\n";
    mensagemConfirmacao += "✓ Aguarde até a conclusão total\n\n";
    mensagemConfirmacao += "Deseja iniciar a varredura completa?";
    
    const confirmacao = confirm(mensagemConfirmacao);
    
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
        return parseInt(match[1]);
      }
    }
    
    const elementoTotal = document.querySelector('.pagination-info');
    if (elementoTotal) {
      const textoTotal = elementoTotal.innerText;
      const match = textoTotal.match(/Total de (\d+) registros?/i);
      if (match && match[1]) {
        return parseInt(match[1]);
      }
    }
    
    const rodape = document.querySelector('.dataTables_info');
    if (rodape) {
      const texto = rodape.innerText;
      const match = texto.match(/de (\d+) registros?/i) || texto.match(/of (\d+) entries/i);
      if (match && match[1]) {
        return parseInt(match[1]);
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
      if (match && match[1]) return parseInt(match[1]);
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
        const num = parseInt(texto);
        if (num > maiorPagina) maiorPagina = num;
      }
    });
    
    if (maiorPagina > 1) return maiorPagina * 4;
    return 1;
  }

  function continuarColetaAutomatica(headerElement) {
    const paginaAtual = parseInt(localStorage.getItem(CONFIG.storageKeyPaginaAtual) || '1');
    const totalPaginas = parseInt(localStorage.getItem(CONFIG.storageKeyTotalPaginas) || '1');
    
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

  function finalizarColetaAutomatica() {
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
      mensagem += `📊 Total de notas encontradas: ${todasNotas.length}\n`;
      mensagem += `💰 Valor total válido: R$ ${totalFormatado}\n\n`;
      alert(mensagem);
      
      criarInterfaceFlutuante(todasNotas, true);
    } else {
      alert("⚠️ Nenhuma nota foi encontrada durante a varredura.");
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
    } catch (e) {}
    return { nomeTitular, docTitular };
  }

  function obterDataMesAnterior() {
    const hoje = new Date();
    const dataPassada = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const mes = String(dataPassada.getMonth() + 1).padStart(2, '0');
    return `${mes}-${dataPassada.getFullYear()}`;
  }

  function encontrarIdNotaNaLinha(elementoLinha) {
    const html = elementoLinha.innerHTML;
    let match = html.match(CONFIG.regexIdNota);
    if (match && match[1]) return match[1];
    
    const linkXml = elementoLinha.querySelector('a[href*="/Notas/Download/NFSe/"]');
    if (linkXml) return linkXml.href.split('/').pop();
    
    return null;
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
          const spanCnpj = divConteudo.querySelector('span.cnpj');
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
    } catch (e) {}
    if (!nomeTomador || nomeTomador === "") nomeTomador = "Tomador Nao Identificado";
    return { nomeTomador, docTomador };
  }

  function processarNotasEmitidas(perfil) {
    const dataMesAnterior = obterDataMesAnterior();
    const pastaRaiz = `${perfil.nomeTitular} - ${perfil.docTitular} - ${dataMesAnterior}`;
    const linhas = document.querySelectorAll(CONFIG.seletorTabela);
    const notas = [];

    linhas.forEach((linha, i) => {
      let idNota = encontrarIdNotaNaLinha(linha);
      if (idNota) {
        idNota = idNota.trim();
        let dataEmissao = "N/A";
        const celulaData = linha.querySelector('td.td-data');
        if (celulaData) dataEmissao = celulaData.innerText.trim().split('\n')[0];

        // 1. Tenta recuperar visualmente (resolvendo problema do tooltip vazio)
        let statusNota = "Emitida";
        const celulaSituacao = linha.querySelector('td.td-situacao');
        if (celulaSituacao) {
          const imgStatus = celulaSituacao.querySelector('img');
          if (imgStatus) {
             statusNota = imgStatus.getAttribute('data-original-title') || imgStatus.getAttribute('title') || "Emitida";
          } else {
             statusNota = celulaSituacao.innerText.trim() || "Emitida";
          }
        }

        // 2. Fallback de Segurança Robusto (Lendo atributo nativo da linha do sistema)
        const dataSituacao = linha.getAttribute('data-situacao') || '';
        if (dataSituacao.includes('CANCELADA')) {
            statusNota = "NFS-e cancelada";
        } else if (dataSituacao.includes('SUBSTITUIDA')) {
            statusNota = "NFS-e substituída";
        }

        let valorTexto = "0,00";
        let valorFloat = 0.0;
        const celulaValor = linha.querySelector('td.td-valor');
        if (celulaValor) {
          valorTexto = celulaValor.innerText.trim();
          valorFloat = limparValorMonetario(valorTexto);
        }

        const statusLower = statusNota.toLowerCase();
        if (statusLower.includes('cancelada') || statusLower.includes('substituida') || statusLower.includes('substituída')) {
            valorFloat = 0.0;
        }

        const dadosTomador = extrairTomadorDaLinha(linha);

        notas.push({
          id: idNota,
          urlXml: `${CONFIG.urlBaseXml}${idNota}`,
          urlPdf: `${CONFIG.urlBasePdf}${idNota}`,
          pastaRaiz: pastaRaiz,
          dataEvento: dataEmissao,
          valorTexto: valorTexto,
          valorFloat: valorFloat,
          parteNome: dadosTomador.nomeTomador,
          parteDoc: dadosTomador.docTomador,
          status: statusNota,
          tipo: 'EMITIDA'
        });
      }
    });
    return notas;
  }

  function processarNotasRecebidas(perfil) {
    const dataMesAnterior = obterDataMesAnterior();
    const nomePerfilLimpo = sanitizarNomeArquivo(perfil.nomeTitular);
    const pastaRaiz = `${nomePerfilLimpo} - Recebidas - ${dataMesAnterior}`;
    const linhas = document.querySelectorAll(CONFIG.seletorTabela);
    const notas = [];

    linhas.forEach((linha, i) => {
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
      let valorTexto = cols[3].innerText.trim();
      let valorFloat = limparValorMonetario(valorTexto);
      
      // 1. Tenta recuperar visualmente (resolvendo problema do tooltip vazio)
      let statusNota = "Recebida";
      const imgStatus = cols[4].querySelector('img');
      if (imgStatus) {
          statusNota = imgStatus.getAttribute('data-original-title') || imgStatus.getAttribute('title') || "Recebida";
      } else {
          statusNota = cols[4].innerText.trim() || "Recebida";
      }

      // 2. Fallback de Segurança Robusto (Lendo atributo nativo da linha do sistema)
      const dataSituacao = linha.getAttribute('data-situacao') || '';
      if (dataSituacao.includes('CANCELADA')) {
          statusNota = "NFS-e cancelada";
      } else if (dataSituacao.includes('REJEITADA')) {
          statusNota = "NFS-e rejeitada";
      } else if (dataSituacao.includes('SUBSTITUIDA')) {
          statusNota = "NFS-e substituída";
      }

      const statusLower = statusNota.toLowerCase();
      if (statusLower.includes('cancelada') || statusLower.includes('rejeitada') || statusLower.includes('substituida') || statusLower.includes('substituída')) {
        valorFloat = 0.0;
      }

      notas.push({
        id: idNota,
        urlXml: `${CONFIG.urlBaseXml}${idNota}`,
        urlPdf: `${CONFIG.urlBasePdf}${idNota}`,
        pastaRaiz: pastaRaiz,
        dataEvento: dataGeracao,
        valorTexto: valorTexto,
        valorFloat: valorFloat,
        parteNome: nomePrestador,
        parteDoc: docPrestador,
        status: statusNota,
        tipo: 'RECEBIDA'
      });
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
    
    const anoAtual = new Date().getFullYear();
    const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    mesesNomes.forEach((nome, i) => {
        adicionarOpcao(selectMes, i + 1, `${nome}/${anoAtual}`);
    });
    
    // Pre-seleciona o mês atual
    selectMes.value = new Date().getMonth() + 1;

    const btnConsultar = document.createElement('button');
    btnConsultar.innerHTML = '🔍 Buscar';
    estilizarBotao(btnConsultar);
    btnConsultar.style.backgroundColor = '#1351B4'; // Azul (difere do verde do download)
    
    btnConsultar.onmouseover = () => btnConsultar.style.backgroundColor = '#0C326F';
    btnConsultar.onmouseout = () => btnConsultar.style.backgroundColor = '#1351B4';

    btnConsultar.addEventListener('click', () => {
        const mes = parseInt(selectMes.value);
        // Calcula dinamicamente o último dia do mês selecionado
        const ultimoDia = new Date(anoAtual, mes, 0).getDate();
        const mesFormatado = String(mes).padStart(2, '0');
        
        const inputInicio = document.getElementById('datainicio');
        const inputFim = document.getElementById('datafim');
        // Busca o botão nativo do sistema do Governo
        const btnSubmit = document.querySelector('button[type="submit"].btn-primary');
        
        if (inputInicio && inputFim && btnSubmit) {
            // Preenche e dispara eventos para ativar a detecção de mudança do site Gov
            inputInicio.value = `01/${mesFormatado}/${anoAtual}`;
            inputInicio.dispatchEvent(new Event('input', { bubbles: true }));
            inputInicio.dispatchEvent(new Event('change', { bubbles: true }));
            
            inputFim.value = `${ultimoDia}/${mesFormatado}/${anoAtual}`;
            inputFim.dispatchEvent(new Event('input', { bubbles: true }));
            inputFim.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Pausa sutil antes de clicar para renderização do DOM
            setTimeout(() => btnSubmit.click(), 200);
        } else {
            alert('⚠️ Campos de data ou botão de busca não encontrados nesta tela.');
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
            spanTexto.textContent = isModoGlobal ? `${acao} (${listaNotas.length} Notas)` : `${acao} da Página (${listaNotas.length})`;
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
      btnFechar.onclick = () => {
        if (confirm("Deseja realmente fechar e limpar os dados coletados?")) {
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
      const nomeParteSeguro = sanitizarNomeArquivo(nota.parteNome).substring(0, 30);
      return { url: url, folderName: `${nota.pastaRaiz}/${tipoArquivo}`, filename: `NFSe-${nota.id}-${nomeParteSeguro}${ext}` };
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
        } else {
          btn.style.backgroundColor = '#138E2C';
          btn.disabled = false; 
          btn.style.opacity = '1'; 
          btn.style.cursor = 'pointer'; 
          select.disabled = false;
          
          const proxima = Array.from(select.options).find(o => !o.disabled);
          if (proxima) select.value = proxima.value;
          
          if(callbackTexto) callbackTexto(); 
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
    const pasta = listaNotas[0].pastaRaiz;
    const isRecebida = listaNotas[0].tipo === 'RECEBIDA';
    const tipoRelatorio = isRecebida ? "NOTAS RECEBIDAS (TOMADAS)" : "NOTAS EMITIDAS (PRESTADAS)";

    let conteudo = `RELATÓRIO DE NOTAS FISCAIS - ${tipoRelatorio}\n${'='.repeat(150)}\nPASTA: ${pasta}\nGerado em: ${new Date().toLocaleString('pt-BR')}\nTotal Geral de Notas: ${listaNotas.length}\n${'='.repeat(150)}\n\n`;
    
    const labelParte = isRecebida ? "PRESTADOR" : "TOMADOR";
    const headerTabela = `DATA        | ID NOTA             |      VALOR (R$) | SITUAÇÃO          | ${labelParte}\n${'-'.repeat(150)}\n`;

    const notasValidas = [];
    const notasCanceladas = [];
    let totalValido = 0.0;
    let totalCancelado = 0.0;

    listaNotas.forEach(nota => {
      const statusLower = nota.status.toLowerCase();
      // Checa os status comuns de invalidação (ajustado para incluir "substituída" com acento por garantia)
      if (statusLower.includes('cancelada') || statusLower.includes('rejeitada') || statusLower.includes('substituida') || statusLower.includes('substituída')) {
        notasCanceladas.push(nota);
        // Calcula o valor original pelo texto, já que valorFloat é 0 nessas notas
        totalCancelado += limparValorMonetario(nota.valorTexto);
      } else {
        notasValidas.push(nota);
        totalValido += nota.valorFloat;
      }
    });

    // --- BLOCO: NOTAS VÁLIDAS ---
    conteudo += `>>> NOTAS VÁLIDAS (${notasValidas.length})\n\n`;
    conteudo += headerTabela;
    
    if (notasValidas.length === 0) {
      conteudo += `Nenhuma nota válida encontrada.\n`;
    } else {
      notasValidas.forEach(nota => {
        const idVisual = nota.id.substring(Math.max(0, nota.id.length - 18)).padEnd(20, ' ');
        const valorVisual = nota.valorTexto.padStart(15, ' ');
        const situacaoVisual = nota.status.substring(0, 18).padEnd(18, ' ');
        const parteVisual = nota.parteNome.substring(0, 80);

        conteudo += `${nota.dataEvento.padEnd(12)}| ${idVisual}| ${valorVisual} | ${situacaoVisual}| ${parteVisual}\n`;
      });
    }
    conteudo += `${'-'.repeat(150)}\n\n`;

    // --- BLOCO: NOTAS CANCELADAS / REJEITADAS ---
    if (notasCanceladas.length > 0) {
      conteudo += `>>> NOTAS CANCELADAS / REJEITADAS / SUBSTITUÍDAS (${notasCanceladas.length})\n\n`;
      conteudo += headerTabela;
      
      notasCanceladas.forEach(nota => {
        const idVisual = nota.id.substring(Math.max(0, nota.id.length - 18)).padEnd(20, ' ');
        const valorVisual = nota.valorTexto.padStart(15, ' ');
        const situacaoVisual = nota.status.substring(0, 18).padEnd(18, ' ');
        const parteVisual = nota.parteNome.substring(0, 80);

        conteudo += `${nota.dataEvento.padEnd(12)}| ${idVisual}| ${valorVisual} | ${situacaoVisual}| ${parteVisual}\n`;
      });
      conteudo += `${'-'.repeat(150)}\n\n`;
    }

    // --- RESUMO FINANCEIRO ---
    conteudo += `RESUMO FINANCEIRO:\n${'-'.repeat(150)}\n`;
    conteudo += `Total Geral de Notas: ${listaNotas.length}\n`;
    conteudo += `Notas Válidas: ${notasValidas.length}\n`;
    conteudo += `Notas Canceladas/Rejeitadas: ${notasCanceladas.length}\n\n`;
    
    conteudo += `SOMA DAS NOTAS VÁLIDAS: R$ ${totalValido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    if (notasCanceladas.length > 0) {
      conteudo += `SOMA DAS NOTAS CANCELADAS: R$ ${totalCancelado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    }

    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `Relatorio-NFSe-${sanitizarNomeArquivo(pasta)}-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  main();
}