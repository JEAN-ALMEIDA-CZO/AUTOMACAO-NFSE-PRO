/**
* bridge.js
 */
(function () {
    if (window.__nfseBridgeLoaded) return;
    window.__nfseBridgeLoaded = true;

    console.log('[AUTOMAÇÃO NFSE] Bridge carregada no contexto MAIN da página.');

    window.addEventListener('message', function (event) {
        if (!event.data || event.data.source !== 'EXTENSION_ROBO_NFSE') return;

        const { type, selector, value, fieldType } = event.data;

        // ── INTEGRAÇÃO COM A VERSÃO ATUALIZADA DO CONTENT.JS ──────────
        if (type === 'TRIGGER_CHOSEN') {
            const jQ = getjQ();
            if (jQ) {
                try {
                    const el = jQ(selector);
                    if (el.length) {
                        el.val(value);
                        el.trigger('change');
                        el.trigger('chosen:updated'); // Comando específico do plugin Chosen
                        el.trigger('select2:select'); // Comando específico do Select2 (se houver)
                        console.log(`[AUTOMAÇÃO NFSE] jQuery disparado em ${selector} com valor ${value}`);
                    }
                } catch (err) {
                    console.error("[AUTOMAÇÃO NFSE] Erro ao executar TRIGGER_CHOSEN:", err);
                }
            } else {
                console.warn("[AUTOMAÇÃO NFSE] jQuery não encontrado na página para TRIGGER_CHOSEN.");
            }
        }

        // ── Atualiza campo comum (input, select, textarea) ────────────
        if (type === 'TRIGGER_FIELD_UPDATE') {
            updateField(selector, value, fieldType);
        }

        // Abre o menu Dropdown do Select2 nativamente
        if (type === 'OPEN_SELECT2') {
            const jQ = getjQ();
            if (jQ) {
                try { jQ(selector).select2('open'); } catch(e) { console.warn('Falha ao abrir Select2 via jQuery:', e); }
            }
        }

        // Fecha o menu Dropdown do Select2 nativamente
        if (type === 'CLOSE_SELECT2') {
            const jQ = getjQ();
            if (jQ) {
                try { jQ(selector).select2('close'); } catch(e) {}
            }
        }

        // CONFIRMAÇÃO ORGÂNICA VIA DUPLO TAB (A solução definitiva)
        if (type === 'SELECT2_CONFIRM') {
            const jQ = getjQ();
            if (jQ) {
                // Encontra a barra de busca ativa do Select2
                const searchField = jQ('.select2-container--open .select2-search__field');
                if (searchField.length) {
                    // O pulo do gato: No ecossistema Select2 do Governo, a tecla TAB (keyCode 9) 
                    // no campo de busca seleciona a opção atual (ajax) e fecha o dropdown.
                    searchField.trigger(jQ.Event('keydown', { keyCode: 9, which: 9, key: 'Tab', bubbles: true }));
                    searchField.trigger(jQ.Event('keyup',   { keyCode: 9, which: 9, key: 'Tab', bubbles: true }));

                    // Aguarda a interface se estabilizar e força o segundo "TAB" humano (ir para o próximo campo)
                    setTimeout(function() {
                         if (selector) {
                             const el = jQ(selector);
                             
                             // Garante que os validadores (Intelephense/ASP.NET MVC) saibam da mudança
                             el.trigger('change.select2');
                             el.trigger('change');
                             el.removeClass('input-validation-error');
                             
                             const formGroup = el.closest('.form-group');
                             if (formGroup.length) {
                                 formGroup.removeClass('erro');
                                 formGroup.find('.field-validation-error').empty().removeClass('text-danger');
                             }
                             
                             // Move fisicamente o foco para o próximo campo visível iterável do formulário
                             const container = el.next('.select2-container');
                             const allFocusables = jQ('input:not([type="hidden"]), select:not(.select2-hidden-accessible), .select2-selection, textarea, button').filter(':visible:not([disabled]):not([tabindex="-1"])');
                             
                             let currentIdx = -1;
                             if (container.length) {
                                 currentIdx = allFocusables.index(container.find('.select2-selection'));
                             } else {
                                 currentIdx = allFocusables.index(el);
                             }

                             if (currentIdx > -1 && currentIdx < allFocusables.length - 1) {
                                 allFocusables.eq(currentIdx + 1).focus();
                             }
                         }
                    }, 350);
                }
            }
        }

        // Dispara seleção Select2 (Fallback extremo bruto)
        if (type === 'TRIGGER_SELECT2') {
            triggerSelect2BySearch(selector, value);
        }

        // Clique nativo via jQuery
        if (type === 'TRIGGER_CLICK_NATIVE') {
            triggerClick(selector);
        }
    });

    // ── HELPERS ───────────────────────────────────────────────────

    function getjQ() {
        return window.jQuery || window.$;
    }

    // ── ATUALIZAÇÃO DE CAMPO GENÉRICO ─────────────────────────────

    function updateField(selector, value, fieldType) {
        const jQ = getjQ();

        if (!jQ) {
            console.warn('[AUTOMAÇÃO NFSE] jQuery não encontrado. Usando Fallback nativo.');
            nativeFallback(selector, value);
            return;
        }

        try {
            const el = jQ(selector);
            if (!el.length) return;

            if (String(el.val()) === String(value)) return;

            el.val(value);

            if (el.hasClass('select2-hidden-accessible')) {
                el.trigger('change.select2');
                el.trigger('change');
            } else if (el.hasClass('form-chosen') || el.next('.chosen-container').length) {
                el.trigger('chosen:updated');
                el.trigger('change');
            } else {
                el.trigger('input');
                el.trigger('change');
                if (fieldType === 'money') {
                    el.trigger('keyup');
                    el.trigger('focusout');
                } else {
                    el.trigger('blur');
                }
            }

        } catch (err) {
            nativeFallback(selector, value);
        }
    }

    // ── SELECT2 VIA JQUERY (FALLBACK EXTREMO) ─────────────────────

    function triggerSelect2BySearch(selector, value) {
        const jQ = getjQ();
        if (!jQ) {
            nativeFallback(selector, value);
            return;
        }

        try {
            const el = jQ(selector);
            if (!el.length) return;

            const hasSelect2 = el.hasClass('select2-hidden-accessible') || typeof el.select2 === 'function';

            if (!hasSelect2) {
                updateField(selector, value);
                return;
            }

            if (el.find(`option[value="${value}"]`).length === 0) {
                const optTemp = new Option(value, value, true, true);
                el.append(optTemp);
            }

            el.val(value);
            el.trigger({
                type: 'select2:select',
                params: { data: { id: value, text: value } }
            });

            el.trigger('change.select2');
            el.trigger('change');
            
            try { el.select2('close'); } catch(e) {}

        } catch (err) {
            nativeFallback(selector, value);
        }
    }

    // ── FALLBACK NATIVO ───────────────────────────────────────────

    function nativeFallback(selector, value) {
        const el = document.querySelector(selector);
        if (!el) return;

        if (el.value === String(value)) return;

        try {
            const proto = Object.getPrototypeOf(el);
            const desc  = Object.getOwnPropertyDescriptor(proto, 'value');
            if (desc && desc.set) {
                desc.set.call(el, value);
            } else {
                el.value = value;
            }
        } catch (e) {
            el.value = value;
        }

        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur',   { bubbles: true }));
    }

    // ── CLIQUE NATIVO ─────────────────────────────────────────────

    function triggerClick(selector) {
        const jQ = getjQ();
        if (jQ) {
            jQ(selector).trigger('click');
        } else {
            const el = document.querySelector(selector);
            if (el) el.click();
        }
    }

})();