/**
* gerador.js
 */

// Injeção de CSS dinâmico para garantir o scroll horizontal e a coluna de ações fixada
const tableStyles = document.createElement('style');
tableStyles.innerHTML = `
    .preview-table-wrap {
        overflow-x: auto;
        max-width: 100%;
        padding-bottom: 8px;
    }
    #preview-table {
        width: max-content;
        min-width: 100%;
    }
    #preview-table th, #preview-table td {
        white-space: nowrap;
    }
    .col-sticky {
        position: sticky;
        left: 0;
        z-index: 3;
        background: var(--surface);
        border-right: 2px solid var(--border-hi) !important;
    }
    #preview-table th.col-sticky {
        background: var(--surface-3);
        z-index: 4;
    }
`;
document.head.appendChild(tableStyles);

// ═══════════════════════════════════════════════════
// MAPEAMENTO COMPLETO DE CAMPOS
// ═══════════════════════════════════════════════════
const FIELD_DEFINITIONS = {
    pessoas: [
        { id: 'DataCompetencia',                      label: 'Data de Competência',                  type: 'date'   },
        { id: 'InformarNumeroDPS',                    label: 'Informar Nº DPS',                      type: 'select' },
        { id: 'DPS_Serie',                            label: 'Série da DPS',                         type: 'text'   },
        { id: 'DPS_Numero',                           label: 'Número da DPS',                        type: 'text'   },
        { id: 'Emitente_Tipo',                        label: 'Tipo de Emitente',                     type: 'select' },
        { id: 'Emitente_SimplesNacional',             label: 'Opção no Simples Nacional',            type: 'select' },
        { id: 'Tomador_LocalDomicilio',               label: 'Localização do Tomador',               type: 'radio'  },
        { id: 'Tomador_Inscricao',                    label: 'CPF/CNPJ do Tomador',                  type: 'text'   },
        { id: 'Tomador_IM',                           label: 'Inscrição Municipal Tomador',          type: 'text'   },
        { id: 'Tomador_Nome',                         label: 'Nome/Razão Social Tomador',            type: 'text'   },
        { id: 'Tomador_Telefone',                     label: 'Telefone Tomador',                     type: 'text'   },
        { id: 'Tomador_Email',                        label: 'E-mail Tomador',                       type: 'text'   },
        { id: 'Tomador_InformarEndereco',             label: 'Informar Endereço Tomador',            type: 'select' },
        { id: 'Tomador_EnderecoNacional_CEP',         label: 'CEP Tomador',                          type: 'text'   },
        { id: 'Tomador_EnderecoNacional_Logradouro',  label: 'Logradouro Tomador',                   type: 'text'   },
        { id: 'Tomador_EnderecoNacional_Numero',      label: 'Número Endereço Tomador',              type: 'text'   },
        { id: 'Tomador_EnderecoNacional_Complemento', label: 'Complemento Tomador',                  type: 'text'   },
        { id: 'Tomador_EnderecoNacional_Bairro',      label: 'Bairro Tomador',                       type: 'text'   },
        { id: 'Tomador_EnderecoNacional_Municipio',   label: 'Município Tomador',                    type: 'text'   },
        { id: 'Tomador_NIFInformado',                 label: 'NIF Informado (Tomador)',              type: 'radio'  },
        { id: 'Tomador_Exterior_NIF',                 label: 'NIF Tomador Exterior',                 type: 'text'   },
        { id: 'Tomador_MotivoNaoNIF',                 label: 'Motivo Não NIF Tomador',               type: 'select' },
        { id: 'Tomador_Exterior_Nome',                label: 'Nome Tomador Exterior',                type: 'text'   },
        { id: 'Tomador_Exterior_Pais',                label: 'País Tomador Exterior',                type: 'text'   },
        { id: 'Tomador_Exterior_CodigoPostal',        label: 'Código Postal Tomador Exterior',       type: 'text'   },
        { id: 'Tomador_Exterior_Estado',              label: 'Estado/Prov Tomador Exterior',         type: 'text'   },
        { id: 'Tomador_Exterior_Cidade',              label: 'Cidade Tomador Exterior',              type: 'text'   },
        { id: 'Tomador_Exterior_Bairro',              label: 'Bairro Tomador Exterior',              type: 'text'   },
        { id: 'Tomador_Exterior_Logradouro',          label: 'Logradouro Tomador Exterior',          type: 'text'   },
        { id: 'Tomador_Exterior_Numero',              label: 'Número Tomador Exterior',              type: 'text'   },
        { id: 'Tomador_Exterior_Complemento',         label: 'Complemento Tomador Exterior',         type: 'text'   },
        
        { id: 'Intermediario_LocalDomicilio',               label: 'Localização Intermediário',                type: 'radio'  },
        { id: 'Intermediario_Inscricao',                    label: 'CPF/CNPJ Intermediário',                   type: 'text'   },
        { id: 'Intermediario_IM',                           label: 'Insc. Municipal Intermediário',            type: 'text'   },
        { id: 'Intermediario_Nome',                         label: 'Nome Intermediário',                       type: 'text'   },
        { id: 'Intermediario_Telefone',                     label: 'Telefone Intermediário',                   type: 'text'   },
        { id: 'Intermediario_Email',                        label: 'E-mail Intermediário',                     type: 'text'   },
        { id: 'Intermediario_InformarEndereco',             label: 'Informar Endereço Intermediário',          type: 'select' },
        { id: 'Intermediario_EnderecoNacional_CEP',         label: 'CEP Intermediário',                        type: 'text'   },
        { id: 'Intermediario_EnderecoNacional_Logradouro',  label: 'Logradouro Intermediário',                 type: 'text'   },
        { id: 'Intermediario_EnderecoNacional_Numero',      label: 'Número Endereço Intermediário',            type: 'text'   },
        { id: 'Intermediario_EnderecoNacional_Complemento', label: 'Complemento Intermediário',                type: 'text'   },
        { id: 'Intermediario_EnderecoNacional_Bairro',      label: 'Bairro Intermediário',                     type: 'text'   },
        { id: 'Intermediario_EnderecoNacional_Municipio',   label: 'Município Intermediário',                  type: 'text'   },
        { id: 'Intermediario_NIFInformado',                 label: 'NIF Informado (Intermediário)',            type: 'radio'  },
        { id: 'Intermediario_Exterior_NIF',                 label: 'NIF Intermediário Exterior',               type: 'text'   },
        { id: 'Intermediario_MotivoNaoNIF',                 label: 'Motivo Não NIF Intermediário',             type: 'select' },
        { id: 'Intermediario_Exterior_Pais',                label: 'País Intermediário Exterior',              type: 'text'   },
        { id: 'Intermediario_Exterior_CodigoPostal',        label: 'Código Postal Intermediário Exterior',     type: 'text'   },
        { id: 'Intermediario_Exterior_Estado',              label: 'Estado/Prov Intermediário Exterior',       type: 'text'   },
        { id: 'Intermediario_Exterior_Cidade',              label: 'Cidade Intermediário Exterior',            type: 'text'   },
        { id: 'Intermediario_Exterior_Bairro',              label: 'Bairro Intermediário Exterior',            type: 'text'   },
        { id: 'Intermediario_Exterior_Logradouro',          label: 'Logradouro Intermediário Exterior',        type: 'text'   },
        { id: 'Intermediario_Exterior_Numero',              label: 'Número Intermediário Exterior',            type: 'text'   },
        { id: 'Intermediario_Exterior_Complemento',         label: 'Complemento Intermediário Exterior',       type: 'text'   }
    ],
    servico: [
        { id: 'LocalPrestacao_Pais',                         label: 'País da Prestação',             type: 'text'     },
        { id: 'LocalPrestacao_Municipio',                    label: 'Município da Prestação',        type: 'text'     },
        { id: 'ServicoPrestado_CodigoTributacaoNacional',    label: 'Código CTISS',                  type: 'text'     },
        { id: 'ServicoPrestado_CodigoComplementarMunicipal', label: 'Código Tributação Municipal',   type: 'text'     },
        { id: 'ServicoPrestado_Descricao',                   label: 'Discriminação dos Serviços',    type: 'textarea' },
        { id: 'ServicoPrestado_CodigoNBS',                   label: 'Código NBS',                    type: 'text'     },
        { id: 'Servico_ImunidadeExportacao',                 label: 'Imunidade / Exportação',        type: 'radio'    },
        { id: 'Servico_MotivoNaoTributacao',                 label: 'Motivo Não Tributação',         type: 'select'   },
        { id: 'Servico_TipoImunidade',                       label: 'Tipo Imunidade',                type: 'select'   },
        { id: 'Servico_PaisResultado',                       label: 'País do Resultado',             type: 'text'     },
        
        { id: 'InformarDadosObra',                           label: 'Informar Dados Obra',           type: 'select'   },
        { id: 'Obra_TipoInformacao',                         label: 'Tipo Identificação Obra',       type: 'radio'    },
        { id: 'Obra_Codigo',                                 label: 'Código Obra / CIB',             type: 'text'     },
        { id: 'Obra_CEP',                                    label: 'CEP da Obra',                   type: 'text'     },
        { id: 'Obra_Estado',                                 label: 'Estado da Obra',                type: 'text'     },
        { id: 'Obra_Cidade',                                 label: 'Cidade da Obra',                type: 'text'     },
        { id: 'Obra_Bairro',                                 label: 'Bairro da Obra',                type: 'text'     },
        { id: 'Obra_Logradouro',                             label: 'Logradouro da Obra',            type: 'text'     },
        { id: 'Obra_Numero',                                 label: 'Número da Obra',                type: 'text'     },
        { id: 'Obra_Complemento',                            label: 'Complemento da Obra',           type: 'text'     },
        { id: 'Obra_InscricaoImobiliaria',                   label: 'Inscrição Imobiliária Obra',    type: 'text'     },
        
        { id: 'InformarDadosEvento',                         label: 'Informar Evento',               type: 'select'   },
        { id: 'Evento_DataInicial',                          label: 'Data Inicial Evento',           type: 'text'     },
        { id: 'Evento_DataFinal',                            label: 'Data Final Evento',             type: 'text'     },
        { id: 'Evento_Descricao',                            label: 'Descrição Evento',              type: 'textarea' },
        { id: 'Evento_TipoInformacao',                       label: 'Tipo Identificação Evento',     type: 'radio'    },
        { id: 'Evento_Identificacao',                        label: 'Identificação Evento',          type: 'text'     },
        { id: 'Evento_CEP',                                  label: 'CEP do Evento',                 type: 'text'     },
        { id: 'Evento_Estado',                               label: 'Estado do Evento',              type: 'text'     },
        { id: 'Evento_Cidade',                               label: 'Cidade do Evento',              type: 'text'     },
        { id: 'Evento_Bairro',                               label: 'Bairro do Evento',              type: 'text'     },
        { id: 'Evento_Logradouro',                           label: 'Logradouro do Evento',          type: 'text'     },
        { id: 'Evento_Numero',                               label: 'Número do Evento',              type: 'text'     },
        { id: 'Evento_Complemento',                          label: 'Complemento do Evento',         type: 'text'     },
        
        { id: 'InformarComercioExterior',                    label: 'Informar Comércio Exterior',    type: 'select'   },
        { id: 'ComercioExterior_ModoPrestacao',              label: 'Modo Prestação COMEX',          type: 'select'   },
        { id: 'ComercioExterior_VinculoPrestacao',           label: 'Vínculo Prestação COMEX',       type: 'select'   },
        { id: 'ComercioExterior_TipoMoeda',                  label: 'Tipo Moeda COMEX',              type: 'text'     },
        { id: 'ComercioExterior_ValorServico',               label: 'Valor Moeda Estrangeira',       type: 'money'    },
        { id: 'ComercioExterior_MecanismoApoioPrestador',    label: 'Mecanismo Apoio Prestador',     type: 'select'   },
        { id: 'ComercioExterior_MecanismoApoioTomador',      label: 'Mecanismo Apoio Tomador',       type: 'text'     },
        { id: 'ComercioExterior_MovimentacaoTempBens',       label: 'Movimentação Temporária COMEX', type: 'select'   },
        { id: 'ComercioExterior_NumeroREDI',                 label: 'Número RE/DI COMEX',            type: 'text'     },
        { id: 'ComercioExterior_CompartilharMDIC',           label: 'Compartilhar MDIC',             type: 'radio'    },

        { id: 'Complemento_NumeroRespTecnica',               label: 'Número ART/RRT',                type: 'text'     },
        { id: 'Complemento_DocumentoReferencia',             label: 'Documento Referência',          type: 'textarea' },
        { id: 'Complemento_Informacoes',                     label: 'Informações Complementares',    type: 'textarea' },
        { id: 'Complemento_Pedido',                          label: 'Número do Pedido B2B',          type: 'text'     }
    ],
    valores: [
        { id: 'Valores_ValorServico',            label: 'Valor do Serviço (Bruto)',        type: 'money'   },
        { id: 'Valores_DescontoIncondicionado',  label: 'Desconto Incondicionado',         type: 'money'   },
        { id: 'Valores_DescontoCondicionado',    label: 'Desconto Condicionado',           type: 'money'   },
        { id: 'ISSQN_Retido',                    label: 'ISSQN Retido',                    type: 'radio'   },
        { id: 'ISSQN_TipoRetencao',              label: 'Quem Reterá ISSQN',               type: 'radio'   },
        { id: 'ISSQN_Aliquota',                  label: 'Alíquota ISSQN (%)',              type: 'percent' },
        { id: 'ISSQN_HaBeneficioMunicipal',      label: 'Tem Benefício Municipal?',        type: 'radio'   },
        { id: 'ISSQN_BeneficioMunicipal',        label: 'ID Benefício Municipal',          type: 'text'    },
        { id: 'ISSQN_HaDeducaoReducao',          label: 'Tem Dedução/Redução?',            type: 'radio'   },
        { id: 'DeducaoReducao_Tipo',             label: 'Tipo de Dedução/Redução',         type: 'radio'   },
        { id: 'DeducaoReducao_ValorMonetario',   label: 'Valor Monetário Dedução (R$)',    type: 'money'   },
        { id: 'DeducaoReducao_ValorPercentual',  label: 'Valor Percentual Dedução (%)',    type: 'percent' },
        { id: 'TribFed_SituacaoTributaria',      label: 'Situação Tributária PIS/COFINS',  type: 'select'  },
        { id: 'TribFed_TipoRetencao',            label: 'Tipo Retenção PIS/COFINS/CSLL',   type: 'select'  },
        { id: 'TribFed_ValorIRRF',               label: 'Valor Retido IRRF',               type: 'money'   },
        { id: 'TribFed_ValorCP',                 label: 'Valor Retido CP',                 type: 'money'   },
        { id: 'TribAprox_Tipo',                  label: 'Tipo Apuração Tributos',          type: 'radio'   },
        { id: 'TribAprox_ValorFederal',          label: 'Valor Aprox. Federal (R$)',       type: 'money'   },
        { id: 'TribAprox_ValorEstadual',         label: 'Valor Aprox. Estadual (R$)',      type: 'money'   },
        { id: 'TribAprox_ValorMunicipal',        label: 'Valor Aprox. Municipal (R$)',     type: 'money'   },
        { id: 'TribAprox_PercentualFederal',     label: 'Percentual Aprox. Federal (%)',   type: 'percent' },
        { id: 'TribAprox_PercentualEstadual',    label: 'Percentual Aprox. Estadual (%)',  type: 'percent' },
        { id: 'TribAprox_PercentualMunicipal',   label: 'Percentual Aprox. Municipal (%)', type: 'percent' },
        { id: 'TribAprox_AliquotaSN',            label: 'Alíquota Simples Nacional (%)',   type: 'percent' }
    ]
};

const ALL_FIELDS = [
    ...FIELD_DEFINITIONS.pessoas,
    ...FIELD_DEFINITIONS.servico,
    ...FIELD_DEFINITIONS.valores
];

// Dicionário Reverso Automático (Label -> ID) para Importação CSV
const REVERSE_MAP = {};
ALL_FIELDS.forEach(f => REVERSE_MAP[f.label] = f.id);

// ═══════════════════════════════════════════════════
// ESTADO GLOBAL (STATE)
// ═══════════════════════════════════════════════════
let queue = [];
let dateMode = 'auto'; // 'auto' | 'manual'

const TAB_META = {
    pessoas: { title: 'Passo 1 — Pessoas',  sub: 'DPS: Emitente, Tomador e Intermediário' },
    servico: { title: 'Passo 2 — Serviço',  sub: 'Local de prestação, CTISS, discriminação, obra, evento e COMEX' },
    valores: { title: 'Passo 3 — Valores',  sub: 'ISSQN, tributos federais, impostos e totais' },
};

// ═══════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initDateMode();
    initMasks();
    initConditionalLogic();
    initRadioStyling();
    initEventListeners();
    initTableEvents();
    updateBadges();
});

// ─── ABAS (TABS) ───────────────────────────────────
function initTabs() {
    document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Remove active de todos os botões de aba
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            // Adiciona ativo no botão clicado
            btn.classList.add('active');
            
            // Remove active de todos os painéis
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            // Mostra o painel correto
            const targetPanel = document.getElementById('tab-' + tab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
            
            // Atualiza Títulos
            const titleEl = document.getElementById('current-tab-title');
            const subEl = document.getElementById('current-tab-sub');
            if (titleEl && TAB_META[tab]) titleEl.textContent = TAB_META[tab].title;
            if (subEl && TAB_META[tab]) subEl.textContent = TAB_META[tab].sub;
        });
    });
}

// ─── MODO DA DATA DE COMPETÊNCIA ───────────────────
function initDateMode() {
    document.querySelectorAll('.date-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            dateMode = btn.dataset.mode;
            document.querySelectorAll('.date-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const autoDisplay = document.getElementById('date-auto-display');
            const manualInput = document.getElementById('DataCompetencia');

            if (dateMode === 'auto') {
                if (autoDisplay) autoDisplay.style.display = 'flex';
                if (manualInput) {
                    manualInput.style.display  = 'none';
                    manualInput.value = 'AUTO'; 
                }
            } else {
                if (autoDisplay) autoDisplay.style.display = 'none';
                if (manualInput) {
                    manualInput.style.display  = 'block';
                    if (manualInput.value === 'AUTO' || !manualInput.value) {
                        manualInput.value = '';
                    }
                    manualInput.focus();
                }
            }
            updateBadges();
        });
    });
}

// ─── MÁSCARAS (MONETÁRIO, PERCENTUAL E TEXTO) ──────
function initMasks() {
    document.querySelectorAll('.monetario, .percentual').forEach(input => {
        input.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val === '') { e.target.value = ''; return; }
            val = (parseInt(val, 10) / 100).toFixed(2);
            e.target.value = val.replace('.', ',');
        });
    });

    const applyMask = (input, type) => {
        input.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (!val) {
                e.target.value = '';
                return;
            }
            if (type === 'cpfcnpj') {
                if (val.length <= 11) {
                    val = val.replace(/(\d{3})(\d)/, '$1.$2');
                    val = val.replace(/(\d{3})(\d)/, '$1.$2');
                    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                } else {
                    val = val.replace(/^(\d{2})(\d)/, '$1.$2');
                    val = val.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                    val = val.replace(/\.(\d{3})(\d)/, '.$1/$2');
                    val = val.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
                }
            } else if (type === 'telefone') {
                val = val.replace(/^(\d{2})(\d)/g, '($1) $2');
                val = val.replace(/(\d)(\d{4})$/, '$1-$2');
            } else if (type === 'cep') {
                val = val.replace(/^(\d{5})(\d)/, '$1-$2');
            } else if (type === 'data') {
                val = val.replace(/^(\d{2})(\d)/, '$1/$2');
                val = val.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
            }
            e.target.value = val;
        });
    };

    document.querySelectorAll('.mask-cpf-cnpj').forEach(el => applyMask(el, 'cpfcnpj'));
    document.querySelectorAll('.mask-telefone').forEach(el => applyMask(el, 'telefone'));
    document.querySelectorAll('.mask-cep').forEach(el => applyMask(el, 'cep'));
    document.querySelectorAll('.mask-data').forEach(el => applyMask(el, 'data'));
}

// ─── LÓGICAS CONDICIONAIS DE EXIBIÇÃO ──────────────
function initConditionalLogic() {
    const initTriggerSelect = (id) => {
        const el = document.getElementById(id);
        if (el) el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const initTriggerRadio = (name) => {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        if (checked) checked.dispatchEvent(new Event('change', { bubbles: true }));
    };

    // --- PESSOAS ---
    const dpsSelect = document.getElementById('InformarNumeroDPS');
    if (dpsSelect) {
        dpsSelect.addEventListener('change', (e) => {
            const isSim = e.target.value === '1';
            document.querySelectorAll('.dep[data-dep="InformarNumeroDPS"]').forEach(el => {
                el.style.display = isSim ? 'block' : 'none';
            });
        });
        initTriggerSelect('InformarNumeroDPS');
    }

    document.querySelectorAll('input[name="Tomador_LocalDomicilio"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('Tomador_LocalDomicilio');
            const pnlBrasil = document.getElementById('sec-tomador-brasil');
            const pnlExterior = document.getElementById('sec-tomador-exterior');
            if (pnlBrasil) pnlBrasil.style.display = val === '1' ? 'block' : 'none';
            if (pnlExterior) pnlExterior.style.display = val === '2' ? 'block' : 'none';
        });
    });
    initTriggerRadio('Tomador_LocalDomicilio');

    const tomadorEndSelect = document.getElementById('Tomador_InformarEndereco');
    if (tomadorEndSelect) {
        tomadorEndSelect.addEventListener('change', (e) => {
            const pnl = document.getElementById('Tomador_EnderecoBrasil_Panel');
            if (pnl) pnl.style.display = e.target.value === 'SIM' ? 'grid' : 'none';
        });
        initTriggerSelect('Tomador_InformarEndereco');
    }

    document.querySelectorAll('input[name="Tomador_NIFInformado"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('Tomador_NIFInformado');
            const pnlNIF = document.getElementById('Tomador_NIF_Panel');
            const pnlMotivo = document.getElementById('Tomador_MotivoNaoNIF_Panel');
            if (pnlNIF) pnlNIF.style.display = val === '1' ? 'block' : 'none';
            if (pnlMotivo) pnlMotivo.style.display = val === '0' ? 'block' : 'none';
        });
    });
    initTriggerRadio('Tomador_NIFInformado');

    document.querySelectorAll('input[name="Intermediario_LocalDomicilio"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('Intermediario_LocalDomicilio');
            const pnlBrasil = document.getElementById('sec-inter-brasil');
            const pnlExterior = document.getElementById('sec-inter-exterior');
            const pnlComum = document.getElementById('sec-inter-comum');

            if (pnlBrasil) pnlBrasil.style.display = val === '1' ? 'block' : 'none';
            if (pnlExterior) pnlExterior.style.display = val === '2' ? 'block' : 'none';
            if (pnlComum) pnlComum.style.display = (val === '1' || val === '2') ? 'block' : 'none';
            
            const endSelect = document.getElementById('Intermediario_InformarEndereco');
            if (endSelect) endSelect.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
    initTriggerRadio('Intermediario_LocalDomicilio');

    const interEndSelect = document.getElementById('Intermediario_InformarEndereco');
    if (interEndSelect) {
        interEndSelect.addEventListener('change', (e) => {
            const valLocal = getRadioValue('Intermediario_LocalDomicilio');
            const show = e.target.value === 'SIM';
            const pnlEndBrasil = document.getElementById('sec-inter-end-brasil');
            const pnlEndExterior = document.getElementById('sec-inter-end-exterior');

            if (pnlEndBrasil) pnlEndBrasil.style.display = (show && valLocal === '1') ? 'block' : 'none';
            if (pnlEndExterior) pnlEndExterior.style.display = (show && valLocal === '2') ? 'block' : 'none';
        });
        initTriggerSelect('Intermediario_InformarEndereco');
    }

    document.querySelectorAll('input[name="Intermediario_NIFInformado"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('Intermediario_NIFInformado');
            const pnlNIF = document.getElementById('Intermediario_NIF_Panel');
            const pnlMotivo = document.getElementById('Intermediario_MotivoNaoNIF_Panel');
            if (pnlNIF) pnlNIF.style.display = val === '1' ? 'block' : 'none';
            if (pnlMotivo) pnlMotivo.style.display = val === '0' ? 'block' : 'none';
        });
    });
    initTriggerRadio('Intermediario_NIFInformado');

    const tomadorInscricao = document.getElementById('Tomador_Inscricao');
    if (tomadorInscricao) {
        tomadorInscricao.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            const isCPF = val.length > 0 && val.length <= 11;
            
            const radioTomador = document.querySelector('input[name="ISSQN_TipoRetencao"][value="2"]');
            const radioInter = document.querySelector('input[name="ISSQN_TipoRetencao"][value="3"]');
            const hintCpf = document.getElementById('hint-retencao-cpf');
            
            if (radioTomador) {
                const labelTomador = radioTomador.closest('.radio-opt');
                if (isCPF) {
                    radioTomador.disabled = true;
                    if (labelTomador) {
                        labelTomador.style.opacity = '0.5';
                        labelTomador.style.cursor = 'not-allowed';
                    }
                    if (hintCpf) hintCpf.style.display = 'block';
                    
                    if (radioTomador.checked && radioInter) {
                        radioInter.checked = true;
                        radioInter.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else {
                    radioTomador.disabled = false;
                    if (labelTomador) {
                        labelTomador.style.opacity = '1';
                        labelTomador.style.cursor = 'pointer';
                    }
                    if (hintCpf) hintCpf.style.display = 'none';
                }
            }
        });
        tomadorInscricao.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // --- SERVIÇO ---
    document.querySelectorAll('input[name="Servico_ImunidadeExportacao"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('Servico_ImunidadeExportacao');
            const pnl = document.getElementById('Panel_ImunidadeExportacao');
            if (pnl) pnl.style.display = val === '1' ? 'grid' : 'none';
        });
    });
    initTriggerRadio('Servico_ImunidadeExportacao');

    const motivoSelect = document.getElementById('Servico_MotivoNaoTributacao');
    if (motivoSelect) {
        motivoSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            const pnlTipo = document.getElementById('Panel_TipoImunidade');
            const pnlPais = document.getElementById('Panel_PaisResultado');
            if (pnlTipo) pnlTipo.style.display = val === '2' ? 'block' : 'none';
            if (pnlPais) pnlPais.style.display = val === '3' ? 'block' : 'none';
        });
        initTriggerSelect('Servico_MotivoNaoTributacao');
    }

    const obraSelect = document.getElementById('InformarDadosObra');
    if (obraSelect) {
        obraSelect.addEventListener('change', (e) => {
            const pnl = document.getElementById('Panel_DadosObra');
            if (pnl) pnl.style.display = e.target.value === 'SIM' ? 'grid' : 'none';
        });
        initTriggerSelect('InformarDadosObra');
    }

    document.querySelectorAll('input[name="Obra_TipoInformacao"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('Obra_TipoInformacao');
            const pnlCodigo = document.getElementById('pnlObraCodigoBase');
            const pnlEnderecos = document.getElementById('pnlObraEnderecos');
            if (pnlCodigo) pnlCodigo.style.display = (val === '1' || val === '5') ? 'block' : 'none';
            if (pnlEnderecos) pnlEnderecos.style.display = (val === '3' || val === '4') ? 'block' : 'none';
        });
    });
    initTriggerRadio('Obra_TipoInformacao');

    const eventoSelect = document.getElementById('InformarDadosEvento');
    if (eventoSelect) {
        eventoSelect.addEventListener('change', (e) => {
            const pnl = document.getElementById('Panel_DadosEvento');
            if (pnl) pnl.style.display = e.target.value === 'SIM' ? 'grid' : 'none';
        });
        initTriggerSelect('InformarDadosEvento');
    }

    document.querySelectorAll('input[name="Evento_TipoInformacao"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('Evento_TipoInformacao');
            const pnlId = document.getElementById('pnlEventoIdentificadorBase');
            const pnlEnderecos = document.getElementById('pnlEventoEnderecos');
            if (pnlId) pnlId.style.display = val === '1' ? 'block' : 'none';
            if (pnlEnderecos) pnlEnderecos.style.display = (val === '3' || val === '4') ? 'block' : 'none';
        });
    });
    initTriggerRadio('Evento_TipoInformacao');

    const comexSelect = document.getElementById('InformarComercioExterior');
    if (comexSelect) {
        comexSelect.addEventListener('change', (e) => {
            const pnl = document.getElementById('Panel_ComercioExterior');
            if (pnl) pnl.style.display = e.target.value === 'SIM' ? 'grid' : 'none';
        });
        initTriggerSelect('InformarComercioExterior');
    }

    const comexRediSelect = document.getElementById('ComercioExterior_MovimentacaoTempBens');
    if (comexRediSelect) {
        comexRediSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            const pnlREDI = document.getElementById('pnlComexREDI');
            if (pnlREDI) pnlREDI.style.display = (val === '2' || val === '3') ? 'block' : 'none';
        });
        initTriggerSelect('ComercioExterior_MovimentacaoTempBens');
    }

    // --- VALORES ---
    document.querySelectorAll('input[name="ISSQN_Retido"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('ISSQN_Retido');
            const pnlRetencao = document.getElementById('Panel_ISSQN_TipoRetencao');
            if (pnlRetencao) pnlRetencao.style.display = val === '1' ? 'flex' : 'none';
        });
    });
    initTriggerRadio('ISSQN_Retido');

    document.querySelectorAll('input[name="ISSQN_HaBeneficioMunicipal"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('ISSQN_HaBeneficioMunicipal');
            const pnl = document.getElementById('Panel_BeneficioMunicipal');
            if (pnl) pnl.style.display = val === '1' ? 'block' : 'none';
        });
    });
    initTriggerRadio('ISSQN_HaBeneficioMunicipal');

    document.querySelectorAll('input[name="ISSQN_HaDeducaoReducao"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('ISSQN_HaDeducaoReducao');
            const pnl = document.getElementById('Panel_DeducaoReducao');
            if (pnl) pnl.style.display = val === '1' ? 'grid' : 'none';
        });
    });
    initTriggerRadio('ISSQN_HaDeducaoReducao');

    document.querySelectorAll('input[name="DeducaoReducao_Tipo"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('DeducaoReducao_Tipo');
            const pnlValor = document.getElementById('Panel_DeducaoValor');
            const pnlPerc = document.getElementById('Panel_DeducaoPercentual');
            if (pnlValor) pnlValor.style.display = val === '1' ? 'block' : 'none';
            if (pnlPerc) pnlPerc.style.display = val === '2' ? 'block' : 'none';
        });
    });
    initTriggerRadio('DeducaoReducao_Tipo');

    document.querySelectorAll('input[name="TribAprox_Tipo"]').forEach(r => {
        r.addEventListener('change', () => {
            const val = getRadioValue('TribAprox_Tipo');
            const pnlMonetario = document.getElementById('Panel_TribAprox_ValoresMonetarios');
            const pnlPercentual = document.getElementById('Panel_TribAprox_ValoresPercentuais');
            const pnlAliquota = document.getElementById('Panel_TribAprox_AliquotaSN');
            
            if (pnlMonetario) pnlMonetario.style.display = val === '1' ? 'grid' : 'none';
            if (pnlPercentual) pnlPercentual.style.display = val === '2' ? 'grid' : 'none';
            if (pnlAliquota) pnlAliquota.style.display = val === '4' ? 'block' : 'none';
        });
    });
    initTriggerRadio('TribAprox_Tipo');
}

// ─── ESTILIZAÇÃO VISUAL DOS RADIOS (RADIO-GROUP) ───
function initRadioStyling() {
    document.querySelectorAll('.radio-group').forEach(group => {
        const updateStyle = () => {
            group.querySelectorAll('.radio-opt').forEach(opt => {
                const radio = opt.querySelector('input[type=radio]');
                if(radio) {
                    opt.classList.toggle('checked', radio.checked);
                }
            });
        };

        group.querySelectorAll('input[type=radio]').forEach(r => {
            r.addEventListener('change', () => {
                updateStyle();
                updateBadges();
            });
        });

        updateStyle();
    });
}

// ─── EVENTOS DE BOTÕES E ATUALIZAÇÃO ───────────────
function initEventListeners() {
    const btnAdd = document.getElementById('btn-add');
    const btnClearForm = document.getElementById('btn-clear-form');
    const btnClearQueue = document.getElementById('btn-clear-queue');
    const btnDownload = document.getElementById('btn-download');
    const btnImportCSV = document.getElementById('btn-import-csv');

    if (btnAdd) btnAdd.addEventListener('click', addToQueue);
    if (btnClearForm) btnClearForm.addEventListener('click', clearForm);
    if (btnClearQueue) btnClearQueue.addEventListener('click', clearQueue);
    if (btnDownload) btnDownload.addEventListener('click', downloadCSV);
    
    if (btnImportCSV) {
        btnImportCSV.addEventListener('change', handleCSVImport);
    }

    document.querySelectorAll('input:not([type=radio]), select, textarea').forEach(el => {
        el.addEventListener('change', updateBadges);
        el.addEventListener('input', updateBadges);
    });
}

// ─── EVENT DELEGATION PARA BOTÕES DA TABELA ────────
function initTableEvents() {
    const tbody = document.getElementById('table-body');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const btnEdit = e.target.closest('.btn-edit-item');
            const btnDelete = e.target.closest('.btn-delete-item');

            if (btnEdit) {
                const idx = parseInt(btnEdit.getAttribute('data-index'), 10);
                if (!isNaN(idx)) editQueueItem(idx);
            } else if (btnDelete) {
                const idx = parseInt(btnDelete.getAttribute('data-index'), 10);
                if (!isNaN(idx)) deleteQueueItem(idx);
            }
        });
    }
}

// ─── FUNÇÕES AUXILIARES DE LEITURA DE DADOS ────────
function getRadioValue(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
}

function getFieldValue(def) {
    if (def.id === 'DataCompetencia') {
        if (dateMode === 'auto') return 'AUTO';
        const el = document.getElementById('DataCompetencia');
        if (!el || !el.value || el.value === 'AUTO') return '';
        
        if (el.value.includes('-')) {
            const [y, m, d] = el.value.split('-');
            return `${d}/${m}/${y}`;
        }
        return el.value;
    }
    
    if (def.type === 'radio') {
        return getRadioValue(def.id);
    }
    
    const el = document.getElementById(def.id);
    return el ? (el.value || '').trim() : '';
}

// ─── ATUALIZAÇÃO DOS BADGES LATERAIS ───────────────
function updateBadges() {
    ['pessoas', 'servico', 'valores'].forEach(tab => {
        let count = 0;
        FIELD_DEFINITIONS[tab].forEach(def => {
            const v = getFieldValue(def);
            if (v && v !== '' && v !== '0' && v !== 'NAO') {
                count++;
            }
        });
        
        if (tab === 'pessoas' && dateMode === 'auto') {
            count++;
        }
        
        const badge = document.getElementById('badge-' + tab);
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
    });
}

// ─── VALIDAÇÃO DINÂMICA DE CAMPOS OBRIGATÓRIOS ─────
function findLabelForField(el) {
    if (!el) return null;
    
    let prev = el.previousElementSibling;
    while (prev) {
        if (prev.tagName === 'LABEL') return prev;
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(prev.tagName)) break;
        prev = prev.previousElementSibling;
    }
    
    const group = el.closest('.field-group');
    if (group) return group.querySelector('label');
    
    return null;
}

function validateRequiredFields() {
    for (const def of ALL_FIELDS) {
        let el;
        if (def.type === 'radio') {
            el = document.querySelector(`input[name="${def.id}"]`);
        } else {
            el = document.getElementById(def.id);
        }

        if (!el) continue;

        const group = el.closest('.field-group');
        if (!group) continue;

        // Se o container pai está oculto, ignora validação
        if (group.offsetParent === null) continue;

        // Ignora se oculto diretamente, exceto para modo automático da data
        if (el.style.display === 'none' && def.id !== 'DataCompetencia') continue;

        const lbl = findLabelForField(el);
        const isRequired = lbl && lbl.querySelector('.req') !== null;

        if (isRequired) {
            const val = getFieldValue(def);
            if (!val || val.trim() === '') {
                const labelText = lbl.innerText.replace(/\*/g, '').trim();
                const tabPanel = group.closest('.tab-panel');
                let tabName = 'Desconhecida';
                
                if (tabPanel) {
                    const tabId = tabPanel.id.replace('tab-', '');
                    const tabBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
                    if (tabBtn) tabName = tabBtn.querySelector('.nav-label').innerText;
                }

                alert(`⚠️ Preencha o campo obrigatório: ${labelText}\n(Aba: ${tabName})`);
                
                // UX: Troca para a aba correta e foca
                if (tabPanel) {
                    const tabId = tabPanel.id.replace('tab-', '');
                    const tabBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
                    if (tabBtn && !tabBtn.classList.contains('active')) {
                        tabBtn.click();
                    }
                }

                if (el.focus && el.offsetParent !== null && el.style.display !== 'none') {
                    el.focus();
                }

                return false;
            }
        }
    }
    return true; 
}

// ─── LÓGICA DE IMPORTAÇÃO DE CSV NO GERADOR ────────
function handleCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsText(file, 'ISO-8859-1');
    
    reader.onload = (ev) => {
        try {
            const parsedData = parseCSV(ev.target.result);
            if (parsedData.length > 0) {
                queue.push(...parsedData);
                renderQueue();
                alert(`✅ Foram importados ${parsedData.length} registros com sucesso! A fila foi atualizada.`);
            } else {
                alert('❌ O CSV selecionado está vazio ou tem um formato inválido.');
            }
        } catch (error) {
            console.error('Erro ao ler CSV', error);
            alert('❌ Erro inesperado ao tentar ler o arquivo CSV.');
        }
        event.target.value = ''; // Reseta input para permitir importar de novo o mesmo arquivo
    };
    
    reader.onerror = () => {
        alert('❌ Erro de permissão ou falha ao acessar o arquivo no sistema.');
        event.target.value = '';
    };
}

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

// ─── ADICIONAR ITEM À FILA (MEMÓRIA E TABELA) ──────
function addToQueue() {
    
    // Validação Dinâmica Inteligente
    if (!validateRequiredFields()) {
        return; // Alerta e redirecionamento de aba ocorrem dentro da validação
    }

    const data = {};
    ALL_FIELDS.forEach(def => {
        const val = getFieldValue(def);
        if (val && val !== '') {
            data[def.id] = val;
        }
    });

    if (!data['DataCompetencia']) {
        data['DataCompetencia'] = 'AUTO';
    }

    queue.push(data);
    renderQueue();

    const btn = document.getElementById('btn-add');
    if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Adicionado à Fila!';
        btn.style.background = 'var(--success)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--success)';
        
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
            
            const limpaId = ['Tomador_Inscricao', 'Tomador_Nome', 'Intermediario_Inscricao', 'Intermediario_Nome', 'ServicoPrestado_Descricao', 'Valores_ValorServico'];
            limpaId.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.value = '';
            });
            
            updateBadges();
            
            const tabPessoas = document.querySelector('.nav-item[data-tab="pessoas"]');
            if (tabPessoas) tabPessoas.click();
            
        }, 1200);
    }
}

// ─── LIMPEZA E REDEFINIÇÃO DE FORMULÁRIO ───────────
function resetFormFields() {
    document.querySelectorAll('input:not([type=radio]):not([type=checkbox]), textarea').forEach(el => {
        el.value = '';
    });

    document.querySelectorAll('select').forEach(sel => {
        sel.selectedIndex = 0;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
    });

    document.querySelectorAll('.radio-group').forEach(group => {
        const radios = group.querySelectorAll('input[type=radio]');
        if (radios.length) {
            radios[0].checked = true;
            radios[0].dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    const btnAuto = document.getElementById('dmode-auto');
    if (btnAuto) btnAuto.click();
}

function clearForm() {
    if (!confirm('Deseja realmente limpar todos os campos digitados?')) return;
    
    resetFormFields();
    
    const tomadorInscricao = document.getElementById('Tomador_Inscricao');
    if (tomadorInscricao) tomadorInscricao.dispatchEvent(new Event('input', { bubbles: true }));
    
    updateBadges();
}

function clearQueue() {
    if (queue.length === 0) return;
    if (!confirm(`Tem certeza que deseja remover todos os ${queue.length} registros da fila?`)) return;
    queue = [];
    renderQueue();
}

function deleteQueueItem(idx) {
    queue.splice(idx, 1);
    renderQueue();
}

// ─── EDIÇÃO DE REGISTRO (REIDRATAÇÃO) ──────────────
function editQueueItem(idx) {
    const item = queue[idx];
    
    resetFormFields();

    ALL_FIELDS.forEach(def => {
        const val = item[def.id];
        if (val !== undefined && val !== '') {
            if (def.type === 'radio') {
                const radio = document.querySelector(`input[name="${def.id}"][value="${val}"]`);
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else if (def.id === 'DataCompetencia') {
                if (val === 'AUTO') {
                    document.getElementById('dmode-auto').click();
                } else {
                    document.getElementById('dmode-manual').click();
                    const el = document.getElementById('DataCompetencia');
                    if (el) {
                        el.value = val;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            } else {
                const el = document.getElementById(def.id);
                if (el) {
                    el.value = val;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }
    });

    queue.splice(idx, 1);
    renderQueue();
    updateBadges();

    const tabPessoas = document.querySelector('.nav-item[data-tab="pessoas"]');
    if (tabPessoas) tabPessoas.click();

    const tomadorInscricao = document.getElementById('Tomador_Inscricao');
    if (tomadorInscricao) tomadorInscricao.dispatchEvent(new Event('input', { bubbles: true }));

    document.querySelectorAll('select, input[type="radio"]:checked').forEach(el => {
        el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    alert('✏️ Registro carregado no formulário para edição. Faça as alterações e clique em "Adicionar à Fila" novamente para devolvê-lo à lista.');
}

// ─── RENDERIZAÇÃO DA TABELA DINÂMICA ───────────────
function renderQueue() {
    const count      = queue.length;
    const totalEl    = document.getElementById('total-count');
    const countEl    = document.getElementById('preview-count');
    const emptyState = document.getElementById('empty-state');
    const thead      = document.getElementById('table-head');
    const tbody      = document.getElementById('table-body');

    if (totalEl) totalEl.textContent = count;
    if (countEl) countEl.textContent = count + (count === 1 ? ' registro' : ' registros');

    if (count === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        if (thead) thead.innerHTML = `<th>Fila Vazia</th>`;
        if (tbody) tbody.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const colSet = new Set();
    queue.forEach(row => Object.keys(row).forEach(k => colSet.add(k)));
    const cols = Array.from(colSet);

    const mapIdToLabel = {};
    ALL_FIELDS.forEach(f => mapIdToLabel[f.id] = f.label);

    if (thead) {
        let thHTML = `<th class="col-sticky" style="width: 80px; text-align:center;">Ações</th>`;
        thHTML += `<th style="width: 40px; text-align:center;">#</th>`;
        
        cols.forEach(col => {
            thHTML += `<th>${mapIdToLabel[col] || col}</th>`;
        });
        thead.innerHTML = thHTML;
    }

    if (tbody) {
        tbody.innerHTML = queue.map((row, i) => {
            let trHTML = `<tr>`;
            
            trHTML += `
            <td class="col-sticky" style="text-align:center;">
                <div style="display: flex; gap: 6px; justify-content: center;">
                    <button class="btn-ghost btn-edit-item" data-index="${i}" title="Editar registro" style="padding: 4px; font-size: 14px; min-width: 28px; border: 1px solid var(--border); cursor: pointer; border-radius: 4px;">✏️</button>
                    <button class="btn-danger-sm btn-delete-item" data-index="${i}" title="Remover da fila" style="padding: 4px; font-size: 14px; min-width: 28px; cursor: pointer;">🗑️</button>
                </div>
            </td>`;

            trHTML += `<td style="color:var(--text-3); font-weight:700; text-align:center;">${i + 1}</td>`;

            cols.forEach(col => {
                let val = row[col] !== undefined ? row[col] : '-';
                if (col === 'Valores_ValorServico') val = `R$ ${val}`;
                trHTML += `<td>${escHtml(val)}</td>`;
            });

            trHTML += `</tr>`;
            return trHTML;
        }).join('');
    }

    updateBadges();
}

// ─── EXPORTAÇÃO PARA CSV COM HEADERS AMIGÁVEIS ─────
function downloadCSV() {
    if (queue.length === 0) {
        alert('⚠️ A fila está vazia. Adicione pelo menos uma nota antes de exportar o CSV.');
        return;
    }

    const mapIdToLabel = {};
    ALL_FIELDS.forEach(f => mapIdToLabel[f.id] = f.label);

    const colSet = new Set();
    queue.forEach(row => {
        Object.keys(row).forEach(k => colSet.add(k));
    });
    
    const cols = Array.from(colSet);
    const BOM  = '\uFEFF';
    
    const headerRow = cols.map(col => mapIdToLabel[col] || col);
    const rows = [headerRow.join(';')];

    queue.forEach(row => {
        const values = cols.map(colName => {
            let v = row[colName] !== undefined ? String(row[colName]) : '';
            if (v.includes(';') || v.includes('"') || v.includes('\n') || v.includes('\r')) {
                v = `"${v.replace(/"/g, '""')}"`;
            }
            return v;
        });
        rows.push(values.join(';'));
    });

    const csvContent = BOM + rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Planilha_NFS-e_Nacional_${dateStamp()}.csv`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// ─── UTILITÁRIOS ───────────────────────────────────
function dateStamp() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}${mm}${dd}_${hh}${min}`;
}

function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}