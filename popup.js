/**
 * popup.js — Automação NFS-e Nacional Pro
 */

const FIELD_MAPPING = {
    'DataCompetencia': 'Data de Competência',
    'InformarNumeroDPS': 'Informar Nº DPS',
    'DPS_Serie': 'Série da DPS',
    'DPS_Numero': 'Número da DPS',
    'Emitente_Tipo': 'Tipo de Emitente',
    'Emitente_SimplesNacional': 'Opção no Simples Nacional',
    'Tomador_LocalDomicilio': 'Localização do Tomador',
    'Tomador_Inscricao': 'CPF/CNPJ do Tomador',
    'Tomador_IM': 'Inscrição Municipal Tomador',
    'Tomador_Nome': 'Nome/Razão Social Tomador',
    'Tomador_Telefone': 'Telefone Tomador',
    'Tomador_Email': 'E-mail Tomador',
    'Tomador_InformarEndereco': 'Informar Endereço Tomador',
    'Tomador_EnderecoNacional_CEP': 'CEP Tomador',
    'Tomador_EnderecoNacional_Logradouro': 'Logradouro Tomador',
    'Tomador_EnderecoNacional_Numero': 'Número Endereço Tomador',
    'Tomador_EnderecoNacional_Complemento': 'Complemento Tomador',
    'Tomador_EnderecoNacional_Bairro': 'Bairro Tomador',
    'Tomador_EnderecoNacional_Municipio': 'Município Tomador',
    'Tomador_NIFInformado': 'NIF Informado (Tomador)',
    'Tomador_Exterior_NIF': 'NIF Tomador Exterior',
    'Tomador_MotivoNaoNIF': 'Motivo Não NIF Tomador',
    'Tomador_Exterior_Nome': 'Nome Tomador Exterior',
    'Tomador_Exterior_Pais': 'País Tomador Exterior',
    'Tomador_Exterior_CodigoPostal': 'Código Postal Tomador Exterior',
    'Tomador_Exterior_Estado': 'Estado/Prov Tomador Exterior',
    'Tomador_Exterior_Cidade': 'Cidade Tomador Exterior',
    'Tomador_Exterior_Bairro': 'Bairro Tomador Exterior',
    'Tomador_Exterior_Logradouro': 'Logradouro Tomador Exterior',
    'Tomador_Exterior_Numero': 'Número Tomador Exterior',
    'Tomador_Exterior_Complemento': 'Complemento Tomador Exterior',
    'Intermediario_LocalDomicilio': 'Localização Intermediário',
    'Intermediario_Inscricao': 'CPF/CNPJ Intermediário',
    'Intermediario_IM': 'Insc. Municipal Intermediário',
    'Intermediario_Nome': 'Nome Intermediário',
    'Intermediario_Telefone': 'Telefone Intermediário',
    'Intermediario_Email': 'E-mail Intermediário',
    'Intermediario_InformarEndereco': 'Informar Endereço Intermediário',
    'Intermediario_EnderecoNacional_CEP': 'CEP Intermediário',
    'Intermediario_EnderecoNacional_Logradouro': 'Logradouro Intermediário',
    'Intermediario_EnderecoNacional_Numero': 'Número Endereço Intermediário',
    'Intermediario_EnderecoNacional_Complemento': 'Complemento Intermediário',
    'Intermediario_EnderecoNacional_Bairro': 'Bairro Intermediário',
    'Intermediario_EnderecoNacional_Municipio': 'Município Intermediário',
    'Intermediario_NIFInformado': 'NIF Informado (Intermediário)',
    'Intermediario_Exterior_NIF': 'NIF Intermediário Exterior',
    'Intermediario_MotivoNaoNIF': 'Motivo Não NIF Intermediário',
    'Intermediario_Exterior_Pais': 'País Intermediário Exterior',
    'Intermediario_Exterior_CodigoPostal': 'Código Postal Intermediário Exterior',
    'Intermediario_Exterior_Estado': 'Estado/Prov Intermediário Exterior',
    'Intermediario_Exterior_Cidade': 'Cidade Intermediário Exterior',
    'Intermediario_Exterior_Bairro': 'Bairro Intermediário Exterior',
    'Intermediario_Exterior_Logradouro': 'Logradouro Intermediário Exterior',
    'Intermediario_Exterior_Numero': 'Número Intermediário Exterior',
    'Intermediario_Exterior_Complemento': 'Complemento Intermediário Exterior',
    'LocalPrestacao_Pais': 'País da Prestação',
    'LocalPrestacao_Municipio': 'Município da Prestação',
    'ServicoPrestado_CodigoTributacaoNacional': 'Código CTISS',
    'ServicoPrestado_CodigoComplementarMunicipal': 'Código Tributação Municipal',
    'ServicoPrestado_Descricao': 'Discriminação dos Serviços',
    'ServicoPrestado_CodigoNBS': 'Código NBS',
    'Servico_ImunidadeExportacao': 'Imunidade / Exportação',
    'Servico_MotivoNaoTributacao': 'Motivo Não Tributação',
    'Servico_TipoImunidade': 'Tipo Imunidade',
    'Servico_PaisResultado': 'País do Resultado',
    'InformarDadosObra': 'Informar Dados Obra',
    'Obra_TipoInformacao': 'Tipo Identificação Obra',
    'Obra_Codigo': 'Código Obra / CIB',
    'Obra_CEP': 'CEP da Obra',
    'Obra_Estado': 'Estado da Obra',
    'Obra_Cidade': 'Cidade da Obra',
    'Obra_Bairro': 'Bairro da Obra',
    'Obra_Logradouro': 'Logradouro da Obra',
    'Obra_Numero': 'Número da Obra',
    'Obra_Complemento': 'Complemento da Obra',
    'Obra_InscricaoImobiliaria': 'Inscrição Imobiliária Obra',
    'InformarDadosEvento': 'Informar Evento',
    'Evento_DataInicial': 'Data Inicial Evento',
    'Evento_DataFinal': 'Data Final Evento',
    'Evento_Descricao': 'Descrição Evento',
    'Evento_TipoInformacao': 'Tipo Identificação Evento',
    'Evento_Identificacao': 'Identificação Evento',
    'Evento_CEP': 'CEP do Evento',
    'Evento_Estado': 'Estado do Evento',
    'Evento_Cidade': 'Cidade do Evento',
    'Evento_Bairro': 'Bairro do Evento',
    'Evento_Logradouro': 'Logradouro do Evento',
    'Evento_Numero': 'Número do Evento',
    'Evento_Complemento': 'Complemento do Evento',
    'InformarComercioExterior': 'Informar Comércio Exterior',
    'ComercioExterior_ModoPrestacao': 'Modo Prestação COMEX',
    'ComercioExterior_VinculoPrestacao': 'Vínculo Prestação COMEX',
    'ComercioExterior_TipoMoeda': 'Tipo Moeda COMEX',
    'ComercioExterior_ValorServico': 'Valor Moeda Estrangeira',
    'ComercioExterior_MecanismoApoioPrestador': 'Mecanismo Apoio Prestador',
    'ComercioExterior_MecanismoApoioTomador': 'Mecanismo Apoio Tomador',
    'ComercioExterior_MovimentacaoTempBens': 'Movimentação Temporária COMEX',
    'ComercioExterior_NumeroREDI': 'Número RE/DI COMEX',
    'ComercioExterior_CompartilharMDIC': 'Compartilhar MDIC',
    'Complemento_NumeroRespTecnica': 'Número ART/RRT',
    'Complemento_DocumentoReferencia': 'Documento Referência',
    'Complemento_Informacoes': 'Informações Complementares',
    'Complemento_Pedido': 'Número do Pedido B2B',
    'Valores_ValorServico': 'Valor do Serviço (Bruto)',
    'Valores_DescontoIncondicionado': 'Desconto Incondicionado',
    'Valores_DescontoCondicionado': 'Desconto Condicionado',
    'ISSQN_Retido': 'ISSQN Retido',
    'ISSQN_TipoRetencao': 'Quem Reterá ISSQN',
    'ISSQN_Aliquota': 'Alíquota ISSQN (%)',
    'ISSQN_HaBeneficioMunicipal': 'Tem Benefício Municipal?',
    'ISSQN_BeneficioMunicipal': 'ID Benefício Municipal',
    'ISSQN_HaDeducaoReducao': 'Tem Dedução/Redução?',
    'DeducaoReducao_Tipo': 'Tipo de Dedução/Redução',
    'DeducaoReducao_ValorMonetario': 'Valor Monetário Dedução (R$)',
    'DeducaoReducao_ValorPercentual': 'Valor Percentual Dedução (%)',
    'TribFed_SituacaoTributaria': 'Situação Tributária PIS/COFINS',
    'TribFed_TipoRetencao': 'Tipo Retenção PIS/COFINS/CSLL',
    'TribFed_ValorIRRF': 'Valor Retido IRRF',
    'TribFed_ValorCP': 'Valor Retido CP',
    'TribAprox_Tipo': 'Tipo Apuração Tributos',
    'TribAprox_ValorFederal': 'Valor Aprox. Federal (R$)',
    'TribAprox_ValorEstadual': 'Valor Aprox. Estadual (R$)',
    'TribAprox_ValorMunicipal': 'Valor Aprox. Municipal (R$)',
    'TribAprox_PercentualFederal': 'Percentual Aprox. Federal (%)',
    'TribAprox_PercentualEstadual': 'Percentual Aprox. Estadual (%)',
    'TribAprox_PercentualMunicipal': 'Percentual Aprox. Municipal (%)',
    'TribAprox_AliquotaSN': 'Alíquota Simples Nacional (%)'
};

const REVERSE_MAP = Object.fromEntries(Object.entries(FIELD_MAPPING).map(([k, v]) => [v, k]));

document.addEventListener('DOMContentLoaded', () => {
    // Referências DOM
    const viewSetup   = document.getElementById('view-setup');
    const viewRunning = document.getElementById('view-running');
    
    const btnStart    = document.getElementById('btnStart');
    const btnStop     = document.getElementById('btnStop');
    const btnTemplate = document.getElementById('btnTemplate');
    const btnGerador  = document.getElementById('btnGerador');
    const fileInput   = document.getElementById('csvFile');
    const statusMsg   = document.getElementById('status-msg');
    
    // Elementos da Visão Running
    const lblCounter  = document.getElementById('lbl-counter');
    const lblName     = document.getElementById('lbl-name');
    const lblDoc      = document.getElementById('lbl-doc');
    const globalProg  = document.getElementById('global-progress');
    
    let monitorInterval = null;

    // Inicialização do Estado
    chrome.storage.local.get(['isRunning', 'queue', 'currentIndex'], (result) => {
        if (result.isRunning && result.queue) {
            startMonitor(result.currentIndex || 0, result.queue);
        } else {
            showSetupView();
        }
    });

    // ── NAVEGAÇÃO E DOWNLOAD ───────────────
    if (btnGerador) {
        btnGerador.addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('gerador.html') }));
    }

    btnTemplate.addEventListener('click', () => {
        const rawIds = Object.keys(FIELD_MAPPING);
        const friendlyHeaders = rawIds.map(id => FIELD_MAPPING[id] || id).join(';');
        const exampleValues = new Array(rawIds.length).fill('');
        
        exampleValues[rawIds.indexOf('DataCompetencia')] = 'AUTO';
        exampleValues[rawIds.indexOf('Tomador_LocalDomicilio')] = '1';
        exampleValues[rawIds.indexOf('Tomador_Inscricao')] = '00.000.000/0001-00';
        exampleValues[rawIds.indexOf('Tomador_Nome')] = 'Empresa Cliente Ltda';
        exampleValues[rawIds.indexOf('Valores_ValorServico')] = '1500,00';

        const example = exampleValues.join(';');
        const BOM  = '\uFEFF';
        const blob = new Blob([BOM + friendlyHeaders + '\r\n' + example], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'modelo_nfse_nacional.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });

    // ── LEITURA DE CSV (DRAG & DROP E INPUT) ───────────────
    const dropArea = document.getElementById('drop-area');
    const fileLabel = document.getElementById('file-label');

    dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.style.borderColor = "var(--gov-blue)"; });
    dropArea.addEventListener('dragleave', () => { dropArea.style.borderColor = "#B8C5D6"; });
    dropArea.addEventListener('drop', (e) => { e.preventDefault(); dropArea.style.borderColor = "#B8C5D6";
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    
    fileInput.addEventListener('change', (e) => { if(e.target.files.length) handleFile(e.target.files[0]); });

    function handleFile(file) {
        if (!file.name.endsWith('.csv')) { setStatus('❌ Apenas arquivos CSV são aceitos.', 'var(--gov-red)'); return; }
        
        fileLabel.textContent = file.name;
        
        const reader = new FileReader();
        reader.readAsText(file, 'ISO-8859-1'); 
        reader.onload = (ev) => {
            try {
                const data = parseCSV(ev.target.result);
                if (data.length === 0) {
                    setStatus('❌ CSV vazio ou com formato inválido.', 'var(--gov-red)');
                    btnStart.disabled = true;
                    return;
                }
                setStatus(`✅ Lote carregado: ${data.length} notas prontas.`, 'var(--gov-green)');
                fileInput._parsedData = data;
                btnStart.disabled = false;
            } catch (err) {
                setStatus('❌ Erro na leitura do CSV.', 'var(--gov-red)');
                btnStart.disabled = true;
            }
        };
    }

    // ── START / STOP ───────────────
    btnStart.addEventListener('click', () => {
        const data = fileInput._parsedData;
        if (!data || data.length === 0) return;

        chrome.storage.local.set({
            queue: data,
            currentIndex: 0,
            isRunning: true,
            logs: []
        }, () => {
            startMonitor(0, data);
            
            // Redireciona a aba ativa para o painel de Pessoas para começar
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tab = tabs[0];
                const startUrl = 'https://www.nfse.gov.br/EmissorNacional/DPS/Pessoas';
                if (tab && tab.url && tab.url.includes('nfse.gov.br')) {
                    chrome.tabs.update(tab.id, { url: startUrl });
                } else {
                    chrome.tabs.create({ url: startUrl });
                }
            });
        });
    });

    btnStop.addEventListener('click', () => {
        chrome.storage.local.set({ isRunning: false }, () => {
            stopMonitor();
            showSetupView();
            setStatus('🛑 Automação cancelada.', 'var(--gov-red)');
        });
    });

    // ── MONITORA A ABA ATIVA PARA ANIMAR OS PASSOS ───────────────
    function startMonitor(index, queue) {
        showRunningView();
        
        const total = queue.length;
        const item = queue[index];
        
        if (!item) {
            showSetupView();
            return;
        }

        const doc = item['Tomador_Inscricao'] || item['Tomador_Exterior_NIF'] || 'Documento não inf.';
        const nom = item['Tomador_Nome'] || item['Tomador_Exterior_Nome'] || 'Cliente não identificado';
        
        lblCounter.textContent = `PROCESSANDO LOTE: NOTA ${index + 1} DE ${total}`;
        lblName.textContent = nom;
        lblDoc.textContent = `CPF/CNPJ: ${doc}`;
        
        const pct = Math.round((index / total) * 100);
        globalProg.style.width = `${pct}%`;

        if (monitorInterval) clearInterval(monitorInterval);
        
        // Fica checando a cada 500ms onde o robô está
        monitorInterval = setInterval(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs || tabs.length === 0) return;
                const url = tabs[0].url || '';
                
                let step = 0;
                if (url.includes('/DPS/Pessoas')) step = 1;
                else if (url.includes('/DPS/Servico')) step = 2;
                else if (url.includes('/DPS/Tributacao')) step = 3;
                else if (url.includes('/DPS/Emitir') || url.includes('/DPS/Emissao') || url.includes('Resumo')) step = 4;
                else if (url.includes('/DPS/NFSe')) step = 5; // Sucesso
                
                updateStepper(step);
                
                // Se o robô virou a página pro próximo índice, o popup precisa se atualizar sozinho
                chrome.storage.local.get(['currentIndex', 'isRunning'], (res) => {
                    if (!res.isRunning) { stopMonitor(); showSetupView(); return; }
                    if (res.currentIndex > index) {
                        startMonitor(res.currentIndex, queue); // Rekita UI pra próxima nota
                    }
                });

            });
        }, 500);
    }

    function stopMonitor() {
        if (monitorInterval) {
            clearInterval(monitorInterval);
            monitorInterval = null;
        }
    }

    function updateStepper(currentStep) {
        for(let i=1; i<=4; i++) {
            const el = document.getElementById(`step-${i}`);
            if(!el) continue;
            
            el.classList.remove('active', 'completed');
            if (i < currentStep) el.classList.add('completed');
            if (i === currentStep) el.classList.add('active');
        }
    }

    // ── CONTROLE DE INTERFACE ───────────────
    function showSetupView() {
        viewSetup.style.display = 'flex';
        viewRunning.style.display = 'none';
        btnStart.disabled = !fileInput._parsedData;
    }

    function showRunningView() {
        viewSetup.style.display = 'none';
        viewRunning.style.display = 'flex';
    }

    function setStatus(msg, color) {
        statusMsg.innerHTML = msg;
        statusMsg.style.color = color;
    }

    // ── PARSE CSV (Mantém compatibilidade de ID bruto ou Nomes amigáveis) ───────────────
    function parseCSV(str) {
        str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const rows = str.trim().split('\n');
        if (rows.length < 2) return [];

        const delimiter = rows[0].includes(';') ? ';' : ',';
        const rawHeaders = rows[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, '').replace(/^\uFEFF/, ''));
        const internalHeaders = rawHeaders.map(h => REVERSE_MAP[h] || h);

        const result = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (!row) continue;

            const values = splitCSVRow(row, delimiter);
            const obj    = {};
            let hasData  = false;

            internalHeaders.forEach((internalId, idx) => {
                const val = (values[idx] || '').trim().replace(/^"|"$/g, '');
                obj[internalId] = val;
                if (val) hasData = true;
            });

            if (hasData) result.push(obj);
        }
        return result;
    }

    function splitCSVRow(row, delimiter) {
        const result = [];
        let current  = '';
        let inQuotes = false;

        for (let i = 0; i < row.length; i++) {
            const ch = row[i];
            if (ch === '"') {
                if (inQuotes && row[i + 1] === '"') { current += '"'; i++; }
                else { inQuotes = !inQuotes; }
            } else if (ch === delimiter && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
        result.push(current);
        return result;
    }
});