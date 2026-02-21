/**
 * content.js — Automação NFS-e PRO
 **/

// ── EXCEÇÃO PERSONALIZADA ───────────────────────────────────────────────────
class ContentAutomationException extends Error {
    constructor(message, originalError, payload) {
        super(message);
        this.name = 'ContentAutomationException';
        this.originalError = originalError;
        this.payload = payload;
    }
}

function logContentError(fileName, lineStr, exception) {
    let payloadSafe = {};
    if (exception.payload) {
        payloadSafe = JSON.parse(JSON.stringify(exception.payload));
        // Mascaramento de dados sensíveis genéricos
        for (const key in payloadSafe) {
            if (typeof payloadSafe[key] === 'string' && payloadSafe[key].length > 8 && /senha|cpf|cnpj|cartao/i.test(key)) {
                payloadSafe[key] = payloadSafe[key].substring(0, 3) + '***';
            }
        }
    }
    
    console.error(
        `[FATAL ERROR] ${exception.name}: ${exception.message}\n` +
        `[FILE] ${fileName}\n` +
        `[CONTEXT LINE] ${lineStr}\n` +
        `[ORIGINAL MSG] ${exception.originalError ? exception.originalError.message : String(exception.originalError)}\n` +
        `[PAYLOAD] ${JSON.stringify(payloadSafe)}\n` +
        `[STACK TRACE] ${exception.stack}`
    );
}

function isExtValid() {
    try { return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id; }
    catch (e) { return false; }
}

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

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const waitForElement = (selector, timeout = 10000) => {
    return new Promise((resolve, reject) => {
        const interval = 100;
        let elapsed = 0;
        const check = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) { clearInterval(check); resolve(el); }
            elapsed += interval;
            if (elapsed >= timeout) {
                clearInterval(check);
                reject(new Error(`Elemento não encontrado: ${selector}`));
            }
        }, interval);
    });
};

const getEnabledElement = async (idOrName, maxWaitMs = 8000, desiredValue = null) => {
    const interval    = 200;
    const maxAttempts = maxWaitMs / interval;
    let el = null;
    for (let i = 0; i < maxAttempts; i++) {
        el = document.getElementById(idOrName) || document.querySelector(`[name="${idOrName}"]`);
        if (el) {
            if (desiredValue !== null && el.value === String(desiredValue)) return el;
            if (!el.disabled) return el;
        }
        await delay(interval);
    }
    return el;
};

const setNativeValue = (element, value) => {
    if (!element || element.disabled) return;
    try {
        let descriptor = Object.getOwnPropertyDescriptor(element, 'value');
        if (!descriptor) {
            const prototype = Object.getPrototypeOf(element);
            descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
        }
        if (descriptor && descriptor.set) {
            descriptor.set.call(element, value);
        } else {
            element.value = value;
        }
        element.dispatchEvent(new Event('input',  { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur',   { bubbles: true }));
    } catch (e) {
        element.value = value;
    }
};

function sendToBridge(type, data) {
    window.postMessage({ source: 'EXTENSION_ROBO_NFSE', type, ...data }, '*');
}

function waitForBridgeMessage(expectedType, selectSelector, timeoutMs = 10000) {
    return new Promise((resolve) => {
        let timeoutId = null;

        function onMessage(event) {
            if (!event.data || event.data.source !== 'EXTENSION_ROBO_NFSE_BRIDGE') return;
            if (event.data.type !== expectedType) return;
            if (event.data.selector && selectSelector && event.data.selector !== selectSelector) return;
            cleanup();
            resolve('ok');
        }

        function cleanup() {
            window.removeEventListener('message', onMessage);
            if (timeoutId) clearTimeout(timeoutId);
        }

        window.addEventListener('message', onMessage);
        timeoutId = setTimeout(() => { cleanup(); resolve('timeout'); }, timeoutMs);
    });
}

const fillSelect2 = async (selectId, valueToType) => {
    if (!valueToType) return;

    const selectEl    = document.getElementById(selectId);
    const selectorStr = `#${selectId}`;

    if (selectEl && selectEl.options.length > 0 && selectEl.selectedIndex >= 0) {
        const currentText = selectEl.options[selectEl.selectedIndex].text;
        if (currentText && currentText.toUpperCase().includes(String(valueToType).toUpperCase())) {
            console.log(`[AUTOMAÇÃO NFSE] ${selectId} já contém "${currentText}". Pulo executado com sucesso.`);
            return;
        }
    }

    console.log(`[AUTOMAÇÃO NFSE] Preenchendo Select2: ${selectId} com valor: ${valueToType}`);
    updateStatus(`Inserindo dado no Gov.br: ${valueToType}...`);

    if (selectEl) selectEl.focus();
    sendToBridge('OPEN_SELECT2', { selector: selectorStr });
    
    // ATUALIZAÇÃO: Tempo ligeiramente maior para o Gov.br montar a DOM da lista
    await delay(700);

    let searchInput = null;
    for (let i = 0; i < 30; i++) {
        await delay(200);
        // ATUALIZAÇÃO: Seletor abrangente para lidar com variações da estrutura do Gov.br
        const inputs = document.querySelectorAll('.select2-search__field, .select2-container--open input.select2-search__field');
        for (const input of inputs) {
            const rect = input.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) { searchInput = input; break; }
        }
        if (searchInput) break;
    }

    if (!searchInput) {
        console.warn(`[AUTOMAÇÃO NFSE] Dropdown visual não abriu para ${selectId}. Executando fallback integrado com AJAX.`);
        sendToBridge('TRIGGER_SELECT2', { selector: selectorStr, value: valueToType });
        await waitForBridgeMessage('SELECT2_CONFIRMED', selectorStr, 12000);
        await delay(600);
        return;
    }

    searchInput.focus();
    setNativeValue(searchInput, valueToType);
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: valueToType.slice(-1) || 'a' }));

    updateStatus(`Aguardando resultado do servidor para "${valueToType}"...`);
    sendToBridge('SELECT2_WAIT_RESULT', { selector: selectorStr, timeout: 9000 });

    const resultStatus = await waitForBridgeMessage('SELECT2_RESULT_READY', selectorStr, 10000);

    if (resultStatus === 'timeout') {
        console.warn(`[AUTOMAÇÃO NFSE] Timeout aguardando resultado Select2 para ${selectId}. Tentando confirmar mesmo assim...`);
    } else {
        console.log(`[AUTOMAÇÃO NFSE] Resultado Select2 detectado para ${selectId}. Confirmando seleção...`);
    }

    await delay(250);

    updateStatus(`Confirmando seleção de "${valueToType}"...`);
    sendToBridge('SELECT2_CONFIRM', { selector: selectorStr });

    await waitForBridgeMessage('SELECT2_CONFIRMED', selectorStr, 5000);

    await delay(400);
    sendToBridge('CLOSE_SELECT2', { selector: selectorStr });
    if (selectEl) {
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    await delay(700);
};

const setInput = async (id, value) => {
    if (value === undefined || value === null || value === '') return false;
    const el = await getEnabledElement(id, 8000, value);
    if (!el || el.disabled) return false;
    if (el.value === String(value)) return true;
    setNativeValue(el, value);
    return true;
};

const setSelect = async (id, value) => {
    if (value === undefined || value === null || value === '') return false;
    const el = await getEnabledElement(id, 8000, value);
    if (!el || el.disabled) return false;
    if (el.value === String(value)) return true;
    setNativeValue(el, value);
    sendToBridge('TRIGGER_FIELD_UPDATE', { selector: `#${id}`, value: String(value) });
    return true;
};

const setMoney = async (id, value) => {
    if (value === undefined || value === null || value === '') return false;
    const clean = String(value).replace(/R\$\s?/g, '').trim();
    if (!clean) return false;
    const el = await getEnabledElement(id, 8000, clean);
    if (!el || el.disabled) return false;
    setNativeValue(el, clean);
    el.dispatchEvent(new Event('keyup',    { bubbles: true }));
    el.dispatchEvent(new Event('focusout', { bubbles: true }));
    return true;
};

const clickRadio = async (name, value, waitMs = 500) => {
    if (value === undefined || value === null || value === '') return false;
    const selector = `input[name="${name}"][value="${value}"]`;
    let radio = null;
    for (let i = 0; i < 40; i++) {
        radio = document.querySelector(selector);
        if (radio && radio.checked) return true;
        if (radio && !radio.disabled) break;
        await delay(200);
    }
    if (radio && !radio.disabled) {
        if (!radio.checked) {
            const lbl = radio.closest('label');
            if (lbl) lbl.click(); else radio.click();
        }
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        await delay(waitMs);
        return true;
    }
    return false;
};

const clickCheckbox = async (id, isSim, waitMs = 500) => {
    if (isSim === undefined || isSim === null || isSim === '') return false;
    const shouldBeChecked = (isSim === 'SIM' || isSim === '1');
    let chk = null;
    for (let i = 0; i < 40; i++) {
        chk = document.getElementById(id);
        if (chk && chk.checked === shouldBeChecked) return true;
        if (chk && !chk.disabled) break;
        await delay(200);
    }
    if (chk && !chk.disabled) {
        if (chk.checked !== shouldBeChecked) {
            const lbl = chk.closest('label');
            if (lbl) lbl.click(); else chk.click();
            chk.dispatchEvent(new Event('change', { bubbles: true }));
            await delay(waitMs);
        }
        return true;
    }
    return false;
};

function resolveCountryCode(nameOrCode) {
    if (!nameOrCode) return '';
    const up = String(nameOrCode).toUpperCase().trim();
    if (up === 'BRASIL' || up === 'BRAZIL') return 'BR';
    if (up === 'ESTADOS UNIDOS' || up === 'EUA' || up === 'USA') return 'US';
    if (up === 'PORTUGAL') return 'PT';
    if (up === 'ARGENTINA') return 'AR';
    return nameOrCode;
}

function checkGovValidationErrors() {
    const errorBoxes    = document.querySelectorAll('.alert-warning.alert, .alert-danger.alert, .validation-summary-errors');
    const errorMessages = [];

    errorBoxes.forEach(box => {
        if (box.offsetParent === null) return;
        const listItems = box.querySelectorAll('li');
        if (listItems.length > 0) {
            listItems.forEach(li => {
                const text = li.innerText.trim();
                if (text && !text.toLowerCase().includes('para avançar')) errorMessages.push(text);
            });
        } else {
            const text = box.innerText.replace('×', '').trim();
            if (text) errorMessages.push(text);
        }
    });

    const jconfirmOpen = document.querySelector('.jconfirm.jconfirm-open');
    if (jconfirmOpen) {
        const msgEl = jconfirmOpen.querySelector('.jconfirm-content');
        if (msgEl && msgEl.innerText.trim() !== '') {
            errorMessages.push('Sistema Gov: ' + msgEl.innerText.trim());
        }
    }

    document.querySelectorAll('.field-validation-error').forEach(err => {
        if (err.offsetParent !== null && err.innerText.trim()) errorMessages.push(err.innerText.trim());
    });

    return errorMessages.length > 0 ? errorMessages.join('<br>• ') : null;
}

async function performSearchWithRetry(inputId, btnSearchIds, value, verifyIds, statusMsg, maxRetries = 6, maxWaitMs = 15000) {
    if (!value) return { success: true };

    for (let i = 1; i <= maxRetries; i++) {
        updateStatus(`${statusMsg} (Tentativa ${i}/${maxRetries})...`);

        const inputEl = await waitForElement(`#${inputId}`);
        setNativeValue(inputEl, '');
        await delay(500);
        setNativeValue(inputEl, value);
        await delay(800);

        let btnSearch = null;
        for (const id of btnSearchIds) {
            btnSearch = document.getElementById(id);
            if (btnSearch) break;
        }

        if (btnSearch) {
            document.querySelectorAll('.alert-warning, .alert-danger, .validation-summary-errors, .field-validation-error').forEach(el => el.remove());
            btnSearch.click();

            let waited = 0;
            let successDetected = false;

            while (waited < maxWaitMs) {
                await delay(500);
                waited += 500;

                let isFilled = false;
                for (const vId of verifyIds) {
                    let el = document.getElementById(vId) || document.querySelector(`[name="${vId}"]`);
                    if (!el && vId.includes('Municipio')) {
                        el = document.querySelector(`[id*="CodigoMunicipio"]`) || document.querySelector(`[id*="${vId}"]`);
                    }
                    if (!el) continue;

                    if (el.tagName === 'SELECT') {
                        if (el.value && el.value.trim() !== '' && el.value !== '0') { isFilled = true; break; }
                        const container = el.nextElementSibling;
                        if (container && container.classList.contains('select2-container')) {
                            const span = container.querySelector('.select2-selection__rendered');
                            if (span && span.innerText.trim() !== '' && !span.innerText.toLowerCase().includes('selecione')) { isFilled = true; break; }
                        }
                    } else {
                        if (el.value && el.value.trim() !== '' && el.value !== '0') { isFilled = true; break; }
                    }
                }

                if (isFilled) {
                    successDetected = true;
                    const jconfirmOpen = document.querySelector('.jconfirm.jconfirm-open');
                    if (jconfirmOpen) {
                        const btnFechar = jconfirmOpen.querySelector('.jconfirm-buttons button');
                        if (btnFechar) btnFechar.click();
                    }
                    break;
                }

                const jconfirmOpen = document.querySelector('.jconfirm.jconfirm-open');
                if (jconfirmOpen) {
                    const btnFechar = jconfirmOpen.querySelector('.jconfirm-buttons button');
                    if (btnFechar) btnFechar.click();
                    await delay(1000);
                    break;
                }

                const govError = checkGovValidationErrors();
                if (govError) {
                    document.querySelectorAll('.alert-warning, .alert-danger').forEach(e => e.remove());
                    return { success: false, error: govError };
                }
            }

            if (successDetected) { await delay(1500); return { success: true }; }
            console.warn(`[AUTOMAÇÃO NFSE] Tentativa ${i} de buscar ${inputId} falhou. Retentando...`);
            if (i < maxRetries) await delay(3000);

        } else {
            inputEl.blur();
            await delay(2000);
            return { success: true };
        }
    }
    return { success: false, error: `Tempo esgotado ao buscar ${inputId}.` };
}

function showErrorInModal(errorMsg) {
    const modalBody = document.querySelector('.nfse-modal-body');
    if (!modalBody) return;

    const statusText = document.getElementById('nfse-step-status-text');
    if (statusText) {
        statusText.innerText = 'Automação Pausada: Revisão Necessária';
        statusText.style.color = '#ef4444';
        statusText.style.fontWeight = 'bold';
    }

    const pulse = document.getElementById('nfse-pulse-indicator');
    if (pulse) {
        pulse.style.background = '#ef4444';
        pulse.style.animation  = 'none';
        pulse.style.boxShadow  = 'none';
    }

    const errorBox = document.createElement('div');
    errorBox.style.background   = '#fef2f2';
    errorBox.style.border       = '1px solid #f87171';
    errorBox.style.padding      = '12px';
    errorBox.style.borderRadius = '6px';
    errorBox.style.marginTop    = '15px';
    errorBox.style.marginBottom = '15px';
    errorBox.style.color        = '#991b1b';
    errorBox.style.fontSize     = '13px';
    errorBox.innerHTML = `
        <strong>⚠️ O Emissor Nacional retornou o seguinte alerta:</strong><br>
        <span style="display:block; margin-top:6px; font-weight:600;">• ${errorMsg}</span>
        <br><span style="font-size: 11.5px; opacity:0.85;">Corrija o campo diretamente na tela do emissor para prosseguir, ou cancele a automação para voltar à planilha.</span>
    `;

    const btnStop = document.getElementById('btnStopBot');
    if (btnStop) {
        modalBody.insertBefore(errorBox, btnStop);
        btnStop.innerText = 'CANCELAR E FECHAR';
    }
}

function parseCSV(str) {
    str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rows = str.trim().split('\n');
    if (rows.length < 2) return [];

    const delimiter       = rows[0].includes(';') ? ';' : ',';
    const rawHeaders      = rows[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, '').replace(/^\uFEFF/, ''));
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

function getTodayISO() {
    const d  = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
}

function toInputDate(val) {
    if (!val || val === 'AUTO') return getTodayISO();
    if (val.includes('-')) {
        const [y, m, d] = val.split('-');
        return `${d}/${m}/${y}`;
    }
    return val;
}

function generateAndDownloadReport(logs) {
    let content  = '=== RELATÓRIO DE EMISSÃO NFSE ===\n';
    content     += `Data do processamento: ${new Date().toLocaleString('pt-BR')}\n\n`;
    let totalValue = 0;
    let count = 0;
    content += '--- DETALHES DAS NOTAS ---\n';
    logs.forEach((log, index) => {
        content += `#${index + 1} | Cliente: ${log.nome} | Documento: ${log.cpf} | Valor: R$ ${log.valor} | Status: ${log.status}\n`;
        const valClean = String(log.valor || '0').replace(/\./g, '').replace(',', '.');
        totalValue += parseFloat(valClean) || 0;
        count++;
    });
    content += '\n=================================\n';
    content += `TOTAL DE NOTAS: ${count}\n`;
    content += `VALOR TOTAL EMITIDO: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    content += '=================================\n';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    link.download = `Relatorio_NFSE_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function injectSetupBanner() {
    if (document.getElementById('nfse-pro-setup-banner')) return;
    const navbar = document.querySelector('nav.navbar');
    if (!navbar) return;

    let iconUrl = '';
    if (isExtValid()) iconUrl = chrome.runtime.getURL('icons/icon48.png');

    const banner = document.createElement('div');
    banner.id = 'nfse-pro-setup-banner';
    banner.innerHTML = `
        <div class="nfse-banner-container">
            <div class="nfse-banner-left">
                <img src="${iconUrl}" alt="Logo Automação">
                <div class="nfse-banner-text">
                    <strong>AUTOMAÇÃO NFSE PRO</strong>
                    <span>Emissão de NFS-e Automatizada</span>
                </div>
            </div>
            <div class="nfse-banner-center">
                <button id="nfse-btn-gerador" class="nfse-btn nfse-btn-outline">🛠 Gerar Planilha</button>
                <button id="nfse-btn-template" class="nfse-btn nfse-btn-outline">📥 Baixar Modelo</button>
                <div class="nfse-file-wrapper">
                    <label for="nfse-csv-input" id="nfse-file-label">📄 Selecionar Planilha de Notas</label>
                    <input type="file" id="nfse-csv-input" accept=".csv" style="display:none;">
                </div>
                <button id="nfse-btn-start" class="nfse-btn nfse-btn-solid" disabled>▶ Iniciar Emissão Automática</button>
            </div>
            <div class="nfse-banner-right">
                 <a href="https://portifolio.athos.app.br" target="_blank" class="nfse-social-link" title="Portfólio">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                 </a>
                 <a href="https://www.linkedin.com/in/jeanc-almeida" target="_blank" class="nfse-social-link" title="LinkedIn">
                    <svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.16-3.8c-1.08 0-1.8.57-2.14 1.16v-1h-2.39v8.94h2.4v-4.88c0-.25.02-.5.1-.68.22-.49.69-1 1.5-1 .85 0 1.2.65 1.2 1.58v4.98h2.49M7.12 8.56a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8m-1.2 9.94h2.4V9.56H5.92v8.94z"/></svg>
                 </a>
                 <a href="https://github.com/JEAN-ALMEIDA-CZO" target="_blank" class="nfse-social-link" title="GitHub">
                    <svg viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.45-1.16-1.1-1.47-1.1-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
                 </a>
            </div>
        </div>
    `;
    document.body.insertBefore(banner, document.body.firstChild);

    document.getElementById('nfse-btn-gerador').addEventListener('click', () => {
        if (!isExtValid()) {
            alert('⚠️ A extensão foi atualizada em segundo plano. A página será recarregada para aplicar as alterações.');
            return window.location.reload();
        }
        chrome.runtime.sendMessage({ type: 'openGerador' });
    });

    document.getElementById('nfse-btn-template').addEventListener('click', () => {
        const rawIds          = Object.keys(FIELD_MAPPING);
        const friendlyHeaders = rawIds.map(id => FIELD_MAPPING[id] || id).join(';');
        const exampleValues   = new Array(rawIds.length).fill('');

        exampleValues[rawIds.indexOf('DataCompetencia')]          = 'AUTO';
        exampleValues[rawIds.indexOf('Emitente_Tipo')]            = '1';
        exampleValues[rawIds.indexOf('Emitente_SimplesNacional')] = '1';
        exampleValues[rawIds.indexOf('Tomador_LocalDomicilio')]   = '1';
        exampleValues[rawIds.indexOf('Tomador_Inscricao')]        = '00.000.000/0001-00';
        exampleValues[rawIds.indexOf('Tomador_Nome')]             = 'Empresa Cliente Ltda';
        exampleValues[rawIds.indexOf('LocalPrestacao_Pais')]      = 'BR';
        exampleValues[rawIds.indexOf('Valores_ValorServico')]     = '1500,00';
        exampleValues[rawIds.indexOf('TribAprox_Tipo')]           = '4';

        const BOM  = '\uFEFF';
        const blob = new Blob([BOM + friendlyHeaders + '\r\n' + exampleValues.join(';')], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'modelo_nfse_nacional.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });

    document.getElementById('nfse-csv-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsText(file, 'ISO-8859-1');
        reader.onload = (ev) => {
            const data     = parseCSV(ev.target.result);
            const lbl      = document.getElementById('nfse-file-label');
            const btnStart = document.getElementById('nfse-btn-start');
            if (data.length > 0) {
                lbl.innerHTML         = `✅ ${data.length} Notas Carregadas`;
                lbl.style.borderColor = '#138E2C';
                lbl.style.color       = '#138E2C';
                window._nfseQueueData = data;
                btnStart.disabled     = false;
            } else {
                lbl.innerHTML         = '❌ CSV Inválido';
                lbl.style.borderColor = '#ef4444';
                lbl.style.color       = '#ef4444';
                btnStart.disabled     = true;
            }
        };
    });

    document.getElementById('nfse-btn-start').addEventListener('click', () => {
        if (!window._nfseQueueData) return;
        if (!isExtValid()) {
            alert('A extensão foi atualizada. Por favor, recarregue a página (F5) para iniciar.');
            return window.location.reload();
        }
        chrome.storage.local.set({
            queue: window._nfseQueueData,
            currentIndex: 0,
            isRunning: true,
            logs: []
        }, () => {
            window.location.href = 'https://www.nfse.gov.br/EmissorNacional/DPS/Pessoas';
        });
    });
}

function injectRunningModal(index, queue) {
    if (document.getElementById('nfse-bot-overlay-fullscreen')) return;

    const total = queue.length;
    const item  = queue[index] || {};
    const doc   = item['Tomador_Inscricao'] || item['Tomador_Exterior_NIF'] || '00.000.000/0001-00';
    const nome  = item['Tomador_Nome'] || item['Tomador_Exterior_Nome'] || 'Cliente não identificado';

    const div = document.createElement('div');
    div.id = 'nfse-bot-overlay-fullscreen';
    div.innerHTML = `
        <div class="nfse-modal-card">
            <div class="nfse-modal-header">
                <span>AUTOMAÇÃO NFSE</span>
                <span class="nfse-modal-badge">${index + 1}/${total}</span>
            </div>
            <div class="nfse-modal-body">
                <div class="nfse-input-group">
                    <span class="nfse-input-label">PROCESSANDO CLIENTE</span>
                    <div class="nfse-fake-input">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#64748b"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        <span>${doc} - ${nome}</span>
                    </div>
                </div>
                <div class="nfse-stepper">
                    <div class="nfse-step" id="nfse-step-1"><div class="nfse-step-circle">1</div><span>Pessoas</span></div>
                    <div class="nfse-step" id="nfse-step-2"><div class="nfse-step-circle">2</div><span>Serviço</span></div>
                    <div class="nfse-step" id="nfse-step-3"><div class="nfse-step-circle">3</div><span>Valores</span></div>
                    <div class="nfse-step" id="nfse-step-4"><div class="nfse-step-circle">4</div><span>Emissão</span></div>
                </div>
                <div class="nfse-input-group">
                    <span class="nfse-input-label">STATUS DA AÇÃO</span>
                    <div class="nfse-fake-input" style="border: 1px solid var(--border-color, #e2e8f0);">
                        <div class="nfse-pulse-dot" id="nfse-pulse-indicator"></div>
                        <span id="nfse-step-status-text">Analisando página...</span>
                    </div>
                </div>
                <button class="nfse-btn-parar" id="btnStopBot">PARAR AUTOMAÇÃO</button>
            </div>
        </div>
    `;
    document.body.appendChild(div);

    document.getElementById('btnStopBot').addEventListener('click', () => {
        if (!isExtValid()) return window.location.reload();
        chrome.storage.local.set({ isRunning: false }, () => {
            alert('Automação cancelada pelo usuário.');
            window.location.reload();
        });
    });

    setInterval(() => {
        const url = window.location.href;
        let step = 0;
        if (url.includes('/DPS/Pessoas'))                                                   step = 1;
        else if (url.includes('/DPS/Servico'))                                              step = 2;
        else if (url.includes('/DPS/Tributacao'))                                           step = 3;
        else if (url.includes('/DPS/Emitir') || url.includes('/DPS/Emissao') || url.includes('Resumo')) step = 4;

        [1, 2, 3, 4].forEach(i => {
            const el = document.getElementById(`nfse-step-${i}`);
            if (!el) return;
            el.classList.remove('active', 'completed');
            if (i < step) el.classList.add('completed');
            else if (i === step) el.classList.add('active');
        });
    }, 500);
}

function updateStatus(msg) {
    const el = document.getElementById('nfse-step-status-text');
    if (el) el.innerText = msg;
    console.log(`[AUTOMAÇÃO NFSE] ${msg}`);
}

async function clickAvancar() {
    updateStatus('Avançando para a próxima etapa...');
    await delay(1000);
    let btn = document.getElementById('btnAvancar')
           || document.querySelector('button[type="submit"].btn-primary')
           || document.querySelector('.comandos button.btn-primary');

    if (!btn) {
        const todos = document.querySelectorAll('button');
        for (const b of todos) {
            if (b.textContent.trim().includes('Avançar') || b.textContent.trim().includes('Prosseguir')) { btn = b; break; }
        }
    }
    if (btn && !btn.disabled) btn.click();
}

async function startEngine() {
    if (!isExtValid()) {
        console.warn('[AUTOMAÇÃO NFSE] Contexto invalidado. Aguardando recarregamento.');
        return;
    }

    const data = await chrome.storage.local.get(['isRunning', 'queue', 'currentIndex', 'logs']);

    if (!data.isRunning || !data.queue) {
        injectSetupBanner();
        return;
    }

    const index = data.currentIndex || 0;
    const queue = data.queue;
    let logs    = data.logs || [];

    if (index >= queue.length) {
        injectRunningModal(index - 1, queue);
        updateStatus('Lote finalizado com sucesso!');
        generateAndDownloadReport(logs);
        alert('✅ Processo concluído! O relatório de emissão foi baixado.');
        if (isExtValid()) await chrome.storage.local.set({ isRunning: false });
        window.location.href = 'https://www.nfse.gov.br/EmissorNacional/DPS/Pessoas';
        return;
    }

    const item              = queue[index];
    const docIdentificacao  = item.Tomador_Inscricao || item.Tomador_Exterior_NIF || 'S/N';
    const nomeIdentificacao = item.Tomador_Nome || item.Tomador_Exterior_Nome || 'Nome não informado';

    injectRunningModal(index, queue);

    const govErrorFound = checkGovValidationErrors();
    if (govErrorFound) {
        console.warn('[AUTOMAÇÃO NFSE] Erro de validação detectado na tela.', govErrorFound);
        showErrorInModal(govErrorFound);
        if (isExtValid()) await chrome.storage.local.set({ isRunning: false });
        return;
    }

    const url = window.location.href;

    try {

        if (url.includes('/DPS/Pessoas')) {
            updateStatus('Preenchendo aba Pessoas...');

            const dataVal   = toInputDate(item.DataCompetencia);
            const inputData = await waitForElement('#DataCompetencia');
            setNativeValue(inputData, dataVal);
            await delay(1000);

            await clickCheckbox('InformarSerieNumeroDPS', item.InformarNumeroDPS, 400);
            if (item.InformarNumeroDPS === '1' || item.InformarNumeroDPS === 'SIM') {
                await setInput('SerieDPS',  item.DPS_Serie);
                await setInput('NumeroDPS', item.DPS_Numero);
            }

            if (item.Emitente_Tipo) await clickRadio('TipoEmitente', item.Emitente_Tipo, 500);

            const regApuracao = item.Emitente_RegimeApuracao || item.Emitente_SimplesNacional || '';
            if (regApuracao) {
                await setSelect('SimplesNacional_RegimeApuracaoTributosSN', regApuracao);
                await delay(500);
            }

            if (item.Tomador_LocalDomicilio) await clickRadio('Tomador.LocalDomicilio', item.Tomador_LocalDomicilio, 700);

            if (item.Tomador_LocalDomicilio === '1') {
                if (item.Tomador_Inscricao) {
                    const resDoc = await performSearchWithRetry(
                        'Tomador_Inscricao',
                        ['btn_Tomador_Inscricao_pesquisar', 'btn_Tomador_Inscricao'],
                        item.Tomador_Inscricao,
                        ['Tomador_Nome', 'Tomador_RazaoSocial'],
                        'Pesquisando CNPJ/CPF do Tomador'
                    );
                    if (!resDoc.success) console.warn('[AUTOMAÇÃO NFSE] Busca de CNPJ falhou. Usando dados manuais...');
                }

                if (item.Tomador_IM)       await setInput('Tomador_InscricaoMunicipal', item.Tomador_IM);
                if (item.Tomador_Nome)     await setInput('Tomador_Nome', item.Tomador_Nome);
                if (item.Tomador_Telefone) await setInput('Tomador_Telefone', item.Tomador_Telefone);
                if (item.Tomador_Email)    await setInput('Tomador_Email', item.Tomador_Email);

                const infoEnd = item.Tomador_InformarEndereco || '';
                await clickCheckbox('Tomador_InformarEndereco', infoEnd, 500);

                if (infoEnd === 'SIM' || infoEnd === '1') {
                    if (item.Tomador_EnderecoNacional_CEP) {
                        updateStatus('Buscando endereço via CEP...');
                        const cepEl = await getEnabledElement('Tomador_EnderecoNacional_CEP');
                        if (cepEl) {
                            setNativeValue(cepEl, item.Tomador_EnderecoNacional_CEP);
                            await delay(800);
                            const btnCep = document.getElementById('btn_Tomador_EnderecoNacional_CEP');
                            if (btnCep) {
                                btnCep.click();
                                let cepEncontrado = false;
                                for (let i = 0; i < 20; i++) {
                                    await delay(500);
                                    const codMun = document.getElementById('Tomador_EnderecoNacional_CodigoMunicipio');
                                    const bairro = document.getElementById('Tomador_EnderecoNacional_Bairro');
                                    if ((codMun && codMun.value && codMun.value !== '0' && codMun.value !== '') ||
                                        (bairro  && bairro.value  && bairro.value  !== '')) {
                                        cepEncontrado = true; break;
                                    }
                                    const jconfirm = document.querySelector('.jconfirm.jconfirm-open');
                                    if (jconfirm) {
                                        const btnFechar = jconfirm.querySelector('.jconfirm-buttons button');
                                        if (btnFechar) btnFechar.click();
                                        break;
                                    }
                                }
                                if (cepEncontrado) {
                                    console.log('[AUTOMAÇÃO NFSE] Dados de endereço retornados pelo Governo com sucesso.');
                                    await delay(1000);
                                }
                            }
                        }
                    }

                    updateStatus('Preenchendo Número e Complemento...');
                    if (item.Tomador_EnderecoNacional_Logradouro) {
                        const logEl = document.getElementById('Tomador_EnderecoNacional_Logradouro');
                        if (logEl && !logEl.value) await setInput('Tomador_EnderecoNacional_Logradouro', item.Tomador_EnderecoNacional_Logradouro);
                    }
                    if (item.Tomador_EnderecoNacional_Bairro) {
                        const baiEl = document.getElementById('Tomador_EnderecoNacional_Bairro');
                        if (baiEl && !baiEl.value) await setInput('Tomador_EnderecoNacional_Bairro', item.Tomador_EnderecoNacional_Bairro);
                    }
                    if (item.Tomador_EnderecoNacional_Numero)      await setInput('Tomador_EnderecoNacional_Numero', item.Tomador_EnderecoNacional_Numero);
                    if (item.Tomador_EnderecoNacional_Complemento) await setInput('Tomador_EnderecoNacional_Complemento', item.Tomador_EnderecoNacional_Complemento);

                    if (item.Tomador_EnderecoNacional_Municipio) {
                        const codMun = document.getElementById('Tomador_EnderecoNacional_CodigoMunicipio');
                        if (!codMun || !codMun.value) {
                            await fillSelect2('Tomador_EnderecoNacional_Municipio', item.Tomador_EnderecoNacional_Municipio);
                        }
                    }
                }
            }
            else if (item.Tomador_LocalDomicilio === '2') {
                const isNIF = (item.Tomador_NIFInformado === '1' || item.Tomador_NIFInformado === 'SIM') ? '1' : '0';
                await clickRadio('Tomador.NIFInformado', isNIF, 400);
                if (isNIF === '1') await setInput('Tomador_NIF', item.Tomador_Exterior_NIF);
                else await setSelect('Tomador_MotivoNaoInformacaoNIF', item.Tomador_MotivoNaoNIF);

                await setInput('Tomador_Nome',                                           item.Tomador_Exterior_Nome);
                await setInput('Tomador_Telefone',                                       item.Tomador_Exterior_Telefone);
                await setInput('Tomador_Email',                                          item.Tomador_Exterior_Email);
                await setInput('Tomador_EnderecoExterior_Logradouro',                    item.Tomador_Exterior_Logradouro);
                await setInput('Tomador_EnderecoExterior_Numero',                        item.Tomador_Exterior_Numero);
                await setInput('Tomador_EnderecoExterior_Complemento',                   item.Tomador_Exterior_Complemento);
                await setInput('Tomador_EnderecoExterior_Bairro',                        item.Tomador_Exterior_Bairro);
                await setInput('Tomador_EnderecoExterior_Cidade',                        item.Tomador_Exterior_Cidade);
                await setInput('Tomador_EnderecoExterior_EstadoProvinciaRegiao',         item.Tomador_Exterior_Estado);
                await setInput('Tomador_EnderecoExterior_CodigoEnderecamentoPostal',     item.Tomador_Exterior_CodigoPostal);
                if (item.Tomador_Exterior_Pais) {
                    await setSelect('Tomador_EnderecoExterior_CodigoPais', resolveCountryCode(item.Tomador_Exterior_Pais));
                }
            }

            if (item.Intermediario_LocalDomicilio && item.Intermediario_LocalDomicilio !== '0') {
                await clickRadio('Intermediario.LocalDomicilio', item.Intermediario_LocalDomicilio, 600);

                if (item.Intermediario_LocalDomicilio === '1') {
                    if (item.Intermediario_Inscricao) {
                        const resIntDoc = await performSearchWithRetry(
                            'Intermediario_Inscricao',
                            ['btn_Intermediario_Inscricao_pesquisar', 'btn_Intermediario_Inscricao'],
                            item.Intermediario_Inscricao,
                            ['Intermediario_Nome', 'Intermediario_RazaoSocial'],
                            'Pesquisando CNPJ/CPF do Intermediário'
                        );
                        if (!resIntDoc.success) console.warn('[AUTOMAÇÃO NFSE] Busca de CNPJ Intermediário falhou. Usando dados manuais...');
                    }
                    if (item.Intermediario_IM)       await setInput('Intermediario_InscricaoMunicipal', item.Intermediario_IM);
                    if (item.Intermediario_Nome)     await setInput('Intermediario_Nome', item.Intermediario_Nome);
                    if (item.Intermediario_Telefone) await setInput('Intermediario_Telefone', item.Intermediario_Telefone);
                    if (item.Intermediario_Email)    await setInput('Intermediario_Email', item.Intermediario_Email);

                    const infoEndInt = item.Intermediario_InformarEndereco || '';
                    await clickCheckbox('Intermediario_InformarEndereco', infoEndInt, 500);

                    if (infoEndInt === 'SIM' || infoEndInt === '1') {
                        if (item.Intermediario_EnderecoNacional_CEP) {
                            updateStatus('Buscando CEP Intermediário...');
                            const cepIntEl = await getEnabledElement('Intermediario_EnderecoNacional_CEP');
                            if (cepIntEl) {
                                setNativeValue(cepIntEl, item.Intermediario_EnderecoNacional_CEP);
                                await delay(800);
                                const btnCepInt = document.getElementById('btn_Intermediario_EnderecoNacional_CEP');
                                if (btnCepInt) {
                                    btnCepInt.click();
                                    let cepIntEncontrado = false;
                                    for (let i = 0; i < 20; i++) {
                                        await delay(500);
                                        const codMunInt = document.getElementById('Intermediario_EnderecoNacional_CodigoMunicipio');
                                        const bairroInt = document.getElementById('Intermediario_EnderecoNacional_Bairro');
                                        if ((codMunInt && codMunInt.value && codMunInt.value !== '0' && codMunInt.value !== '') ||
                                            (bairroInt  && bairroInt.value  && bairroInt.value  !== '')) {
                                            cepIntEncontrado = true; break;
                                        }
                                        const jconfirmInt = document.querySelector('.jconfirm.jconfirm-open');
                                        if (jconfirmInt) {
                                            const btnFechar = jconfirmInt.querySelector('.jconfirm-buttons button');
                                            if (btnFechar) btnFechar.click();
                                            break;
                                        }
                                    }
                                    if (cepIntEncontrado) await delay(1000);
                                }
                            }
                        }

                        updateStatus('Preenchendo Dados Endereço Intermediário...');
                        if (item.Intermediario_EnderecoNacional_Logradouro) {
                            const logIntEl = document.getElementById('Intermediario_EnderecoNacional_Logradouro');
                            if (logIntEl && !logIntEl.value) await setInput('Intermediario_EnderecoNacional_Logradouro', item.Intermediario_EnderecoNacional_Logradouro);
                        }
                        if (item.Intermediario_EnderecoNacional_Bairro) {
                            const baiIntEl = document.getElementById('Intermediario_EnderecoNacional_Bairro');
                            if (baiIntEl && !baiIntEl.value) await setInput('Intermediario_EnderecoNacional_Bairro', item.Intermediario_EnderecoNacional_Bairro);
                        }
                        if (item.Intermediario_EnderecoNacional_Numero)      await setInput('Intermediario_EnderecoNacional_Numero', item.Intermediario_EnderecoNacional_Numero);
                        if (item.Intermediario_EnderecoNacional_Complemento) await setInput('Intermediario_EnderecoNacional_Complemento', item.Intermediario_EnderecoNacional_Complemento);

                        if (item.Intermediario_EnderecoNacional_Municipio) {
                            const codMunInt = document.getElementById('Intermediario_EnderecoNacional_CodigoMunicipio');
                            if (!codMunInt || !codMunInt.value) {
                                await fillSelect2('Intermediario_EnderecoNacional_Municipio', item.Intermediario_EnderecoNacional_Municipio);
                            }
                        }
                    }
                }
                else if (item.Intermediario_LocalDomicilio === '2') {
                    const isNIF = (item.Intermediario_NIFInformado === '1' || item.Intermediario_NIFInformado === 'SIM') ? '1' : '0';
                    await clickRadio('Intermediario.NIFInformado', isNIF, 400);
                    if (isNIF === '1') await setInput('Intermediario_NIF', item.Intermediario_Exterior_NIF);
                    else await setSelect('Intermediario_MotivoNaoInformacaoNIF', item.Intermediario_MotivoNaoNIF);

                    await setInput('Intermediario_Nome',     item.Intermediario_Exterior_Nome);
                    await setInput('Intermediario_Telefone', item.Intermediario_Telefone);
                    await setInput('Intermediario_Email',    item.Intermediario_Email);

                    const infoEndExtInt = item.Intermediario_InformarEndereco || '';
                    await clickCheckbox('Intermediario_InformarEndereco', infoEndExtInt, 500);
                    if (infoEndExtInt === 'SIM' || infoEndExtInt === '1') {
                        await setInput('Intermediario_EnderecoExterior_Logradouro',                item.Intermediario_Exterior_Logradouro);
                        await setInput('Intermediario_EnderecoExterior_Numero',                    item.Intermediario_Exterior_Numero);
                        await setInput('Intermediario_EnderecoExterior_Complemento',               item.Intermediario_Exterior_Complemento);
                        await setInput('Intermediario_EnderecoExterior_Bairro',                    item.Intermediario_Exterior_Bairro);
                        await setInput('Intermediario_EnderecoExterior_Cidade',                    item.Intermediario_Exterior_Cidade);
                        await setInput('Intermediario_EnderecoExterior_CodigoEnderecamentoPostal', item.Intermediario_Exterior_CodigoPostal);
                        await setInput('Intermediario_EnderecoExterior_EstadoProvinciaRegiao',     item.Intermediario_Exterior_Estado);
                        if (item.Intermediario_Exterior_Pais) {
                            await setSelect('Intermediario_EnderecoExterior_CodigoPais', resolveCountryCode(item.Intermediario_Exterior_Pais));
                        }
                    }
                }
            }

            await clickAvancar();
        }

        else if (url.includes('/DPS/Servico')) {
            updateStatus('Preenchendo aba Serviço...');
            await delay(1500);

            const siglaPais = resolveCountryCode(item.LocalPrestacao_Pais || 'BR');
            await setSelect('LocalPrestacao_CodigoPaisPrestacao', siglaPais);
            await delay(500);

            const municipio = item.LocalPrestacao_Municipio || item.Servico_MunicipioPrestacao || '';
            if (municipio) await fillSelect2('LocalPrestacao_CodigoMunicipioPrestacao', municipio);

            const ctiss = item.ServicoPrestado_CodigoTributacaoNacional || '';
            if (ctiss) await fillSelect2('ServicoPrestado_CodigoTributacaoNacional', ctiss);

            if (item.ServicoPrestado_CodigoComplementarMunicipal) await setSelect('ServicoPrestado_CodigoComplementarMunicipal', item.ServicoPrestado_CodigoComplementarMunicipal);
            if (item.ServicoPrestado_CodigoNBS)                   await setSelect('ServicoPrestado_CodigoNBS', item.ServicoPrestado_CodigoNBS);

            if (item.ServicoPrestado_Descricao) {
                const txtDesc = await waitForElement('#ServicoPrestado_Descricao');
                setNativeValue(txtDesc, item.ServicoPrestado_Descricao);
            }

            let imunidadeRaw = String(item.Servico_ImunidadeExportacao || '0').trim().toUpperCase();
            let valorClique  = (imunidadeRaw === '1' || imunidadeRaw === 'SIM') ? '1' : '0';
            await clickRadio('ServicoPrestado.HaExportacaoImunidadeNaoIncidencia', valorClique, 1000);
            if (valorClique === '1') {
                await setSelect('ServicoPrestado_MotivoNaoTributacao', item.Servico_MotivoNaoTributacao);
                await delay(500);
                await setSelect('ServicoPrestado_TipoImunidade', item.Servico_TipoImunidade);
                await delay(500);
                await setSelect('ServicoPrestado_CodigoPaisResultado', item.Servico_PaisResultado);
            }

            const infoObra = item.InformarDadosObra || '';
            await clickCheckbox('InformarDadosObra', infoObra, 500);
            if (infoObra === 'SIM' || infoObra === '1') {
                await clickRadio('Obra.TipoInformacao', item.Obra_TipoInformacao, 400);
                if (item.Obra_TipoInformacao === '1') await setInput('Obra_CodigoObra', item.Obra_Codigo);
                if (item.Obra_TipoInformacao === '5') await setInput('Obra_CodigoCIB',  item.Obra_Codigo);
                if (item.Obra_TipoInformacao === '3' || item.Obra_TipoInformacao === '4') {
                    await setInput('Obra_CEP',                   item.Obra_CEP);
                    await setInput('Obra_EstadoProvinciaRegiao', item.Obra_Estado);
                    await setInput('Obra_Cidade',                item.Obra_Cidade);
                    await setInput('Obra_Bairro',                item.Obra_Bairro);
                    await setInput('Obra_Logradouro',            item.Obra_Logradouro);
                    await setInput('Obra_Numero',                item.Obra_Numero);
                    await setInput('Obra_Complemento',           item.Obra_Complemento);
                    if (item.Obra_TipoInformacao === '4') await setInput('Obra_CodigoEnderecamentoPostal', item.Obra_CEP);
                }
                if (item.Obra_InscricaoImobiliaria) await setInput('Obra_InscricaoImobiliaria', item.Obra_InscricaoImobiliaria);
            }

            const infoEvento = item.InformarDadosEvento || '';
            await clickCheckbox('InformarDadosEvento', infoEvento, 500);
            if (infoEvento === 'SIM' || infoEvento === '1') {
                await setInput('Evento_DataInicial', item.Evento_DataInicial);
                await setInput('Evento_DataFinal',   item.Evento_DataFinal);
                await setInput('Evento_Descricao',   item.Evento_Descricao);
                await clickRadio('Evento.TipoInformacao', item.Evento_TipoInformacao, 400);
                if (item.Evento_TipoInformacao === '1') await setInput('Evento_Identificacao', item.Evento_Identificacao);
                if (item.Evento_TipoInformacao === '3' || item.Evento_TipoInformacao === '4') {
                    await setInput('Evento_CEP',                    item.Evento_CEP);
                    await setInput('Evento_EstadoProvinciaRegiao',  item.Evento_Estado);
                    await setInput('Evento_Cidade',                 item.Evento_Cidade);
                    await setInput('Evento_Bairro',                 item.Evento_Bairro);
                    await setInput('Evento_Logradouro',             item.Evento_Logradouro);
                    await setInput('Evento_Numero',                 item.Evento_Numero);
                    await setInput('Evento_Complemento',            item.Evento_Complemento);
                    if (item.Evento_TipoInformacao === '4') await setInput('Evento_CodigoEnderecamentoPostal', item.Evento_CEP);
                }
            }

            if (item.InformarComercioExterior === 'SIM' || item.InformarComercioExterior === '1') {
                await setSelect('ComercioExterior_ModoPrestacao',           item.ComercioExterior_ModoPrestacao);
                await setSelect('ComercioExterior_VinculoPrestacao',        item.ComercioExterior_VinculoPrestacao);
                await setInput('ComercioExterior_TipoMoeda',                item.ComercioExterior_TipoMoeda);
                await setMoney('ComercioExterior_ValorServicoMoedaEstrangeira', item.ComercioExterior_ValorServico);
                await setSelect('ComercioExterior_MecanismoApoioPrestador', item.ComercioExterior_MecanismoApoioPrestador);
                await setSelect('ComercioExterior_MecanismoApoioTomador',   item.ComercioExterior_MecanismoApoioTomador);
                await setSelect('ComercioExterior_MovimentacaoTempBens',    item.ComercioExterior_MovimentacaoTempBens);
                await delay(400);
                if (item.ComercioExterior_MovimentacaoTempBens === '2') await setInput('ComercioExterior_NumeroDI', item.ComercioExterior_NumeroREDI);
                else if (item.ComercioExterior_MovimentacaoTempBens === '3') await setInput('ComercioExterior_NumeroRE', item.ComercioExterior_NumeroREDI);
                await clickRadio('ComercioExterior.CompartilharComMDIC', item.ComercioExterior_CompartilharMDIC, 200);
            }

            if (item.Complemento_NumeroRespTecnica)   await setInput('Complemento_NumeroRespTecnica',        item.Complemento_NumeroRespTecnica);
            if (item.Complemento_DocumentoReferencia) await setInput('Complemento_DocumentoReferencia',       item.Complemento_DocumentoReferencia);
            if (item.Complemento_Informacoes)         await setInput('Complemento_InformacoesComplementares', item.Complemento_Informacoes);
            if (item.Complemento_Pedido)              await setInput('Complemento_Pedido_NumeroPedido',        item.Complemento_Pedido);

            await clickAvancar();
        }

        else if (url.includes('/DPS/Tributacao')) {
            updateStatus('Preenchendo aba Valores...');
            await delay(1500);

            const inputValor = await waitForElement('#Valores_ValorServico');
            setNativeValue(inputValor, item.Valores_ValorServico);
            inputValor.blur();
            await delay(1000);

            if (item.Valores_DescontoIncondicionado) await setMoney('Valores_ValorDescontoIncondicionado', item.Valores_DescontoIncondicionado);
            if (item.Valores_DescontoCondicionado)   await setMoney('Valores_ValorDescontoCondicionado',   item.Valores_DescontoCondicionado);

            let retencao  = String(item.ISSQN_Retido || '0').toUpperCase();
            let vRetencao = (retencao === '1' || retencao === 'SIM') ? '1' : '0';
            await clickRadio('ISSQN.HaRetencao', vRetencao, 1000);
            if (vRetencao === '1') await clickRadio('ISSQN.TipoRetencao', item.ISSQN_TipoRetencao, 500);

            if (item.ISSQN_Aliquota) await setInput('ISSQN_AliquotaInformada', item.ISSQN_Aliquota);

            let hasBen = String(item.ISSQN_HaBeneficioMunicipal || '0').toUpperCase();
            let vBen   = (hasBen === '1' || hasBen === 'SIM') ? '1' : '0';
            await clickRadio('ISSQN.HaBeneficioMunicipal', vBen, 1000);
            if (vBen === '1') await setSelect('ISSQN_IdBM', item.ISSQN_BeneficioMunicipal);

            let hasDed = String(item.ISSQN_HaDeducaoReducao || '0').toUpperCase();
            let vDed   = (hasDed === '1' || hasDed === 'SIM') ? '1' : '0';
            await clickRadio('ISSQN.HaDeducaoReducao', vDed, 1000);
            if (vDed === '1') {
                await clickRadio('DeducaoReducao.TipoDeducaoReducao', item.DeducaoReducao_Tipo, 500);
                if (item.DeducaoReducao_Tipo === '1') await setMoney('DeducaoReducao_ValorMonetario',  item.DeducaoReducao_ValorMonetario);
                else                                  await setInput('DeducaoReducao_ValorPercentual', item.DeducaoReducao_ValorPercentual);
            }

            if (item.TribFed_SituacaoTributaria) {
                const sitTrib = parseInt(String(item.TribFed_SituacaoTributaria).trim(), 10).toString();
                await setSelect('TributacaoFederal_PISCofins_SituacaoTributaria', sitTrib);
                await delay(500);
            }

            if (item.TribFed_TipoRetencao) await setSelect('TributacaoFederal_PISCofins_TipoRetencao', item.TribFed_TipoRetencao);
            if (item.TribFed_ValorIRRF)    await setMoney('TributacaoFederal_ValorIRRF', item.TribFed_ValorIRRF);
            if (item.TribFed_ValorCP)      await setMoney('TributacaoFederal_ValorCP',   item.TribFed_ValorCP);

            await clickRadio('ValorTributos.TipoValorTributos', item.TribAprox_Tipo || '4', 1000);
            if (item.TribAprox_Tipo === '1') {
                if (item.TribAprox_ValorFederal)   await setMoney('ValorTributos_ValorTotalFederal',   item.TribAprox_ValorFederal);
                if (item.TribAprox_ValorEstadual)  await setMoney('ValorTributos_ValorTotalEstadual',  item.TribAprox_ValorEstadual);
                if (item.TribAprox_ValorMunicipal) await setMoney('ValorTributos_ValorTotalMunicipal', item.TribAprox_ValorMunicipal);
            } else if (item.TribAprox_Tipo === '2') {
                if (item.TribAprox_PercentualFederal)   await setInput('ValorTributos_PercentualTotalFederal',   item.TribAprox_PercentualFederal);
                if (item.TribAprox_PercentualEstadual)  await setInput('ValorTributos_PercentualTotalEstadual',  item.TribAprox_PercentualEstadual);
                if (item.TribAprox_PercentualMunicipal) await setInput('ValorTributos_PercentualTotalMunicipal', item.TribAprox_PercentualMunicipal);
            } else if (item.TribAprox_Tipo === '4') {
                if (item.TribAprox_AliquotaSN) await setInput('ValorTributos_AliquotaSN', item.TribAprox_AliquotaSN);
            }

            await clickAvancar();
        }

        else if (url.includes('/DPS/EmitirNFSe') || url.includes('/DPS/Emissao') || url.includes('Resumo')) {
            updateStatus('Conferindo Resumo e Emitindo...');
            await delay(2000);

            let btnEmitir = document.getElementById('btnProsseguir') || document.getElementById('btnEmitir');
            if (!btnEmitir) {
                const todos = document.querySelectorAll('button');
                for (const b of todos) {
                    if (b.textContent.includes('Emitir') || b.textContent.includes('Prosseguir')) { btnEmitir = b; break; }
                }
            }

            if (btnEmitir && !btnEmitir.disabled) {
                btnEmitir.click();
                updateStatus('Aguardando confirmação do Governo...');
                let success = false;
                for (let i = 0; i < 60; i++) {
                    await delay(1000);
                    if (document.body.innerText.includes('emitida com sucesso') || document.querySelector('.alert-success')) {
                        success = true; break;
                    }
                    const erroEmissao = checkGovValidationErrors();
                    if (erroEmissao) {
                        console.warn('[AUTOMAÇÃO NFSE] Erro retornado ao Emitir:', erroEmissao);
                        showErrorInModal(erroEmissao);
                        if (isExtValid()) await chrome.storage.local.set({ isRunning: false });
                        return;
                    }
                }
            }
        }

        else if (url.includes('/DPS/NFSe') && !url.includes('Emitir')) {
            updateStatus('Nota emitida com sucesso!');
            logs.push({
                nome:   nomeIdentificacao,
                cpf:    docIdentificacao,
                valor:  item.Valores_ValorServico || '0,00',
                status: 'Emitido'
            });
            await delay(1500);
            if (isExtValid()) await chrome.storage.local.set({ currentIndex: index + 1, logs: logs });
            window.location.href = 'https://www.nfse.gov.br/EmissorNacional/DPS/Pessoas';
        }

    } catch (error) {
        logContentError('content.js', 'startEngine - Try/Catch Principal', new ContentAutomationException('Erro Crítico durante automação', error, queue[index] || {}));
        updateStatus(`❌ Falha interna: ${error.message || error}`);
        if (isExtValid()) await chrome.storage.local.set({ isRunning: false });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startEngine);
} else {
    startEngine();
}