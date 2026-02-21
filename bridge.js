/**
 * bridge.js — Automação NFS-e PRO
 */
(function () {
    'use strict';

    // ── EXCEÇÃO PERSONALIZADA ────────────────────────────────────────────────
    class BridgeIntegrationException extends Error {
        constructor(message, originalError, payload) {
            super(message);
            this.name = 'BridgeIntegrationException';
            this.originalError = originalError;
            this.payload = payload;
        }
    }

    function logSurgicalError(fileName, lineStr, exception) {
        let payloadSafe = {};
        if (exception.payload) {
            payloadSafe = JSON.parse(JSON.stringify(exception.payload));
            if (payloadSafe.value && typeof payloadSafe.value === 'string' && payloadSafe.value.length > 10) {
                payloadSafe.value = payloadSafe.value.substring(0, 4) + '***'; // Mascaramento básico
            }
        }
        
        console.error(
            `[FATAL ERROR] ${exception.name}: ${exception.message}\n` +
            `[FILE] ${fileName}\n` +
            `[CONTEXT LINE] ${lineStr}\n` +
            `[ORIGINAL MSG] ${exception.originalError ? exception.originalError.message : 'N/A'}\n` +
            `[PAYLOAD] ${JSON.stringify(payloadSafe)}\n` +
            `[STACK TRACE] ${exception.stack}`
        );
    }

    // ── GUARD: evita dupla injeção ───────────────────────────────────────────
    if (window.__nfseBridgeLoaded) return;
    window.__nfseBridgeLoaded = true;

    console.log('[AUTOMAÇÃO NFSE] Bridge v4 carregada no contexto MAIN da página.');

    // ── CONSTANTES ───────────────────────────────────────────────────────────
    var SELECT2_RESULT_TIMEOUT_MS = 9000;

    // ── LISTENER PRINCIPAL ───────────────────────────────────────────────────
    window.addEventListener('message', function (event) {
        if (!event.data || event.data.source !== 'EXTENSION_ROBO_NFSE') return;

        var type     = event.data.type;
        var selector = event.data.selector;
        var value    = event.data.value;
        var fieldType = event.data.fieldType;

        if (type === 'TRIGGER_FIELD_UPDATE') {
            updateField(selector, value, fieldType);
            return;
        }

        if (type === 'OPEN_SELECT2') {
            var jQ = getjQ();
            if (jQ) {
                try { 
                    var el = jQ(selector);
                    if (el.length) el.select2('open'); 
                }
                catch (e) { 
                    logSurgicalError('bridge.js', 'Listener OPEN_SELECT2', new BridgeIntegrationException('Falha ao abrir componente Select2 nativo', e, { selector: selector }));
                }
            }
            return;
        }

        if (type === 'CLOSE_SELECT2') {
            var jQc = getjQ();
            if (jQc) {
                try { 
                    var elC = jQc(selector);
                    if (elC.length) elC.select2('close'); 
                } catch (e) { /* silencioso no fechamento */ }
            }
            return;
        }

        if (type === 'SELECT2_WAIT_RESULT') {
            var waitTimeout = event.data.timeout || SELECT2_RESULT_TIMEOUT_MS;
            startResultObserver(selector, waitTimeout);
            return;
        }

        if (type === 'SELECT2_CONFIRM') {
            confirmAfterResultVisible(selector);
            return;
        }

        if (type === 'TRIGGER_SELECT2') {
            triggerSelect2BySearch(selector, value);
            return;
        }

        if (type === 'TRIGGER_CLICK_NATIVE') {
            triggerClick(selector);
            return;
        }
    });

    // =========================================================================
    // FUNÇÕES PRIVADAS
    // =========================================================================

    function getjQ() {
        return window.jQuery || window.$ || null;
    }

    function findResultsList(selectSelector) {
        var rawId = selectSelector ? selectSelector.replace(/^#/, '') : '';
        if (rawId) {
            var byId = document.getElementById('select2-' + rawId + '-results');
            if (byId) return byId;
        }
        var allLists = document.querySelectorAll('ul.select2-results__options');
        for (var i = allLists.length - 1; i >= 0; i--) {
            var rect = allLists[i].getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) return allLists[i];
        }
        return null;
    }

    function hasRealResult(list) {
        if (!list) return false;
        var items = list.querySelectorAll('li.select2-results__option');
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.getAttribute('aria-disabled') === 'true') continue;
            if (/loading-results|select2-results__message/.test(item.className)) continue;
            var text = item.innerText || item.textContent || '';
            if (text.trim().length > 0) return true;
        }
        return false;
    }

    function findSearchInput() {
        var jQ = getjQ();
        if (jQ) {
            var vis = jQ('input.select2-search__field:visible').last();
            if (vis.length) return vis[0];
        }
        var inputs = document.querySelectorAll('input.select2-search__field');
        for (var i = inputs.length - 1; i >= 0; i--) {
            var r = inputs[i].getBoundingClientRect();
            if (r.width > 0 && r.height > 0) return inputs[i];
        }
        return null;
    }

    function startResultObserver(selectSelector, timeoutMs) {
        var resolved  = false;
        var observer  = null;
        var timeoutId = null;

        function resolve(status) {
            if (resolved) return;
            resolved = true;
            if (observer)  { observer.disconnect();  observer  = null; }
            if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }

            window.postMessage({
                source:   'EXTENSION_ROBO_NFSE_BRIDGE',
                type:     status === 'ok' ? 'SELECT2_RESULT_READY' : 'SELECT2_RESULT_TIMEOUT',
                selector: selectSelector
            }, '*');
        }

        var listNow = findResultsList(selectSelector);
        if (listNow && hasRealResult(listNow)) {
            resolve('ok');
            return;
        }

        observer = new MutationObserver(function () {
            var l = findResultsList(selectSelector);
            if (l && hasRealResult(l)) resolve('ok');
        });
        observer.observe(document.body, { childList: true, subtree: true });

        timeoutId = setTimeout(function () { resolve('timeout'); }, timeoutMs);
    }

    function confirmAfterResultVisible(selectSelector) {
        var confirmed  = false;
        var observer   = null;
        var timeoutId  = null;

        function doConfirm() {
            if (confirmed) return;
            confirmed = true;
            if (observer)  { observer.disconnect();  observer  = null; }
            if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }

            var jQ          = getjQ();
            var searchInput = findSearchInput();

            if (jQ && searchInput) {
                var $input = jQ(searchInput);
                $input.trigger(jQ.Event('keydown', { keyCode: 13, which: 13, key: 'Enter', bubbles: true }));
                $input.trigger(jQ.Event('keyup',   { keyCode: 13, which: 13, key: 'Enter', bubbles: true }));

                setTimeout(function () {
                    $input.trigger(jQ.Event('keydown', { keyCode: 9, which: 9, key: 'Tab', bubbles: true }));
                    if (selectSelector) {
                        setTimeout(function () { cleanValidationErrors(selectSelector); }, 500);
                    }
                    window.postMessage({
                        source:   'EXTENSION_ROBO_NFSE_BRIDGE',
                        type:     'SELECT2_CONFIRMED',
                        selector: selectSelector
                    }, '*');
                }, 200);

            } else if (searchInput) {
                searchInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, which: 13, key: 'Enter', bubbles: true }));
                searchInput.dispatchEvent(new KeyboardEvent('keyup',   { keyCode: 13, which: 13, key: 'Enter', bubbles: true }));
                setTimeout(function () {
                    searchInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, which: 9, key: 'Tab', bubbles: true }));
                    if (selectSelector) setTimeout(function () { cleanValidationErrors(selectSelector); }, 500);
                    window.postMessage({
                        source:   'EXTENSION_ROBO_NFSE_BRIDGE',
                        type:     'SELECT2_CONFIRMED',
                        selector: selectSelector
                    }, '*');
                }, 200);
            } else {
                window.postMessage({
                    source:   'EXTENSION_ROBO_NFSE_BRIDGE',
                    type:     'SELECT2_CONFIRMED',
                    selector: selectSelector
                }, '*');
            }
        }

        var listNow = findResultsList(selectSelector);
        if (listNow && hasRealResult(listNow)) {
            doConfirm();
            return;
        }

        observer = new MutationObserver(function () {
            var l = findResultsList(selectSelector);
            if (l && hasRealResult(l)) doConfirm();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        timeoutId = setTimeout(function () {
            console.warn('[AUTOMAÇÃO NFSE] SELECT2_CONFIRM: timeout. Confirmando mesmo sem resultado visível...');
            doConfirm();
        }, SELECT2_RESULT_TIMEOUT_MS);
    }

    function cleanValidationErrors(selectSelector) {
        var jQ = getjQ();
        if (!jQ) return;
        try {
            var el = jQ(selectSelector);
            if (!el.length) return;
            el.trigger('change.select2');
            el.trigger('change');
            el.removeClass('input-validation-error');
            var formGroup = el.closest('.form-group');
            if (formGroup.length) {
                formGroup.removeClass('erro');
                formGroup.find('.field-validation-error').empty().removeClass('text-danger');
            }
        } catch (e) { 
            logSurgicalError('bridge.js', 'cleanValidationErrors', new BridgeIntegrationException('Erro ao limpar classes de validação DOM', e, { selector: selectSelector }));
        }
    }

    function updateField(selector, value, fieldType) {
        var jQ = getjQ();
        if (!jQ) {
            console.warn('[AUTOMAÇÃO NFSE] jQuery não encontrado. Fallback nativo.');
            nativeFallback(selector, value);
            return;
        }
        try {
            var el = jQ(selector);
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
            logSurgicalError('bridge.js', 'updateField', new BridgeIntegrationException('Falha ao atualizar campo via jQuery', err, { selector: selector, value: value }));
            nativeFallback(selector, value);
        }
    }

    function triggerSelect2BySearch(selector, value) {
        var jQ = getjQ();

        function sendConfirmed() {
            window.postMessage({
                source: 'EXTENSION_ROBO_NFSE_BRIDGE',
                type: 'SELECT2_CONFIRMED',
                selector: selector
            }, '*');
        }

        if (!jQ) {
            nativeFallback(selector, value);
            sendConfirmed();
            return;
        }

        try {
            var el = jQ(selector);
            if (!el.length) {
                sendConfirmed();
                return;
            }

            try { el.select2('open'); } catch (e) { /* silencioso */ }

            setTimeout(function () {
                var searchInput = findSearchInput() || document.querySelector('input.select2-search__field');

                if (searchInput) {
                    var $input = jQ(searchInput);
                    $input.val(value).trigger('input');

                    $input.trigger(jQ.Event('keydown', { keyCode: 65, which: 65, key: 'a' }));
                    $input.trigger(jQ.Event('keyup',   { keyCode: 65, which: 65, key: 'a' }));

                    var attempts = 0;
                    var maxAttempts = 40; 
                    var checkInterval = setInterval(function () {
                        attempts++;
                        var list = findResultsList(selector);

                        if (hasRealResult(list)) {
                            clearInterval(checkInterval);

                            $input.trigger(jQ.Event('keydown', { keyCode: 13, which: 13, key: 'Enter' }));
                            $input.trigger(jQ.Event('keyup',   { keyCode: 13, which: 13, key: 'Enter' }));

                            setTimeout(function () {
                                $input.trigger(jQ.Event('keydown', { keyCode: 9, which: 9, key: 'Tab' }));
                                cleanValidationErrors(selector);
                                try { el.select2('close'); } catch (e) { /* silencioso */ }
                                el.trigger('change');
                                sendConfirmed();
                            }, 300);

                        } else if (attempts >= maxAttempts) {
                            clearInterval(checkInterval);
                            console.warn('[AUTOMAÇÃO NFSE] Fallback Select2: Timeout aguardando AJAX para', selector);
                            try { el.select2('close'); } catch (e) { /* silencioso */ }
                            sendConfirmed();
                        }
                    }, 200);

                } else {
                    console.warn('[AUTOMAÇÃO NFSE] Fallback Select2: Search input não encontrado para', selector);
                    nativeFallback(selector, value);
                    sendConfirmed();
                }
            }, 500); 
        } catch (err) {
            logSurgicalError('bridge.js', 'triggerSelect2BySearch', new BridgeIntegrationException('Falha crítica no Fallback Integrado AJAX', err, { selector: selector, value: value }));
            nativeFallback(selector, value);
            sendConfirmed();
        }
    }

    function nativeFallback(selector, value) {
        var el = document.querySelector(selector);
        if (!el) return;
        if (el.value === String(value)) return;

        try {
            var proto = Object.getPrototypeOf(el);
            var desc  = Object.getOwnPropertyDescriptor(proto, 'value');
            if (desc && desc.set) { desc.set.call(el, value); }
            else { el.value = value; }
        } catch (e) {
            el.value = value;
        }

        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur',   { bubbles: true }));
    }

    function triggerClick(selector) {
        var jQ = getjQ();
        if (jQ) { jQ(selector).trigger('click'); }
        else {
            var el = document.querySelector(selector);
            if (el) el.click();
        }
    }

})();