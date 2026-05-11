    function loadViewportMeta() {
      if (document.querySelector('meta[name="viewport"]')) return;
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }

    function loadJivaraFonts() {
      if (document.querySelector('link[data-jivara-fonts]')) return;

      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = 'https://fonts.googleapis.com';
      preconnect.dataset.jivaraFonts = 'true';

      const preconnectStatic = document.createElement('link');
      preconnectStatic.rel = 'preconnect';
      preconnectStatic.href = 'https://fonts.gstatic.com';
      preconnectStatic.crossOrigin = 'anonymous';
      preconnectStatic.dataset.jivaraFonts = 'true';

      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap';
      stylesheet.dataset.jivaraFonts = 'true';

      document.head.append(preconnect, preconnectStatic, stylesheet);
    }

    loadViewportMeta();
    loadJivaraFonts();

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lenis@1.1.18/dist/lenis.min.js';
    script.onload = () => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      
      // Ubah ukuran otomatis lenis pada perubahan konten swagger yang dinamis
      let mutationTimeout;
      const observer = new MutationObserver(() => {
        clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(() => {
          lenis.resize();
          enhanceAllSelects();
          appendJivaraFooter();
          appendBackToTopButton();
          enforceAuthInputFocusColor();
          enforceParameterInputFocusColor();
          enforceRequiredAsteriskColor();
          enforceSchemaToggleColor();
          markRequestBodyExamples();
          enforceBodyParamSchemaColor();
          enforceLogoutButtonStyle();
        }, 100);
      });
      observer.observe(document.body, { childList: true, subtree: true });

      window.lenis = lenis;
    };
    document.head.appendChild(script);

    function enhanceAllSelects() {
      document.querySelectorAll('.swagger-ui select:not([data-jivara-enhanced])').forEach((select) => {
        select.dataset.jivaraEnhanced = 'true';

        const customSelect = document.createElement('div');
        customSelect.className = 'jivara-select';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'jivara-select__button';
        button.setAttribute('aria-haspopup', 'listbox');
        button.setAttribute('aria-expanded', 'false');

        const label = document.createElement('span');
        label.className = 'jivara-select__label';

        const chevron = document.createElement('span');
        chevron.className = 'jivara-select__chevron';
        chevron.setAttribute('aria-hidden', 'true');

        const menu = document.createElement('div');
        menu.className = 'jivara-select__menu';
        menu.setAttribute('role', 'listbox');

        const updateLabel = () => {
          label.textContent = select.options[select.selectedIndex]?.textContent || select.value;
        };

        const close = () => {
          customSelect.dataset.open = 'false';
          button.setAttribute('aria-expanded', 'false');
        };

        const renderOptions = () => {
          menu.replaceChildren();
          Array.from(select.options).forEach((option) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'jivara-select__option';
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', String(option.value === select.value));
            item.textContent = option.textContent || option.value;

            item.addEventListener('click', () => {
              select.value = option.value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
              updateLabel();
              renderOptions();
              close();
            });

            menu.appendChild(item);
          });
        };

        button.append(label, chevron);
        customSelect.append(button, menu);
        select.insertAdjacentElement('afterend', customSelect);

        button.addEventListener('click', () => {
          const isOpen = customSelect.dataset.open === 'true';
          document.querySelectorAll('.jivara-select[data-open="true"]').forEach((node) => {
            node.dataset.open = 'false';
            node.querySelector('button')?.setAttribute('aria-expanded', 'false');
          });
          customSelect.dataset.open = String(!isOpen);
          button.setAttribute('aria-expanded', String(!isOpen));
        });

        document.addEventListener('pointerdown', (event) => {
          if (!customSelect.contains(event.target)) close();
        });

        const observerOptions = new MutationObserver(() => {
          renderOptions();
          updateLabel();
        });
        observerOptions.observe(select, { childList: true, subtree: true });

        select.addEventListener('change', () => {
          updateLabel();
          renderOptions();
        });

        updateLabel();
        renderOptions();
        close();
      });
    }

    function appendJivaraFooter() {
      if (document.querySelector('.jivara-docs-footer')) return;

      const swaggerRoot = document.querySelector('.swagger-ui');
      if (!swaggerRoot) return;

      const footer = document.createElement('footer');
      footer.className = 'jivara-docs-footer';

      const inner = document.createElement('div');
      inner.className = 'jivara-docs-footer__inner';

      const copyright = document.createElement('span');
      copyright.textContent = String.fromCharCode(169) + ' ' + new Date().getFullYear() + ' Jivara';

      const tagline = document.createElement('span');
      tagline.textContent = 'Stay on track, stay healthy';

      inner.append(copyright, tagline);
      footer.appendChild(inner);
      swaggerRoot.insertAdjacentElement('afterend', footer);
    }

    function appendBackToTopButton() {
      if (document.querySelector('.jivara-back-to-top')) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'jivara-back-to-top';
      button.setAttribute('aria-label', 'Kembali ke atas');
      button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      button.style.setProperty('display', 'none', 'important');
      button.style.setProperty('position', 'fixed', 'important');
      button.style.setProperty('right', '24px', 'important');
      button.style.setProperty('bottom', '24px', 'important');
      button.style.setProperty('z-index', '29000', 'important');
      button.style.setProperty('width', '48px', 'important');
      button.style.setProperty('height', '48px', 'important');
      button.style.setProperty('place-items', 'center', 'important');
      button.style.setProperty('border', '0', 'important');
      button.style.setProperty('border-radius', '999px', 'important');
      button.style.setProperty('background', 'var(--primary)', 'important');
      button.style.setProperty('color', 'var(--bg)', 'important');
      button.style.setProperty('box-shadow', 'none', 'important');

      const updateVisibility = () => {
        const isVisible = window.scrollY > 420;
        button.dataset.visible = String(isVisible);
        button.style.setProperty('display', isVisible ? 'grid' : 'none', 'important');
      };

      button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      window.addEventListener('scroll', updateVisibility, { passive: true });
      document.body.appendChild(button);
      updateVisibility();
    }

    function enforceAuthInputFocusColor() {
      document.querySelectorAll('.swagger-ui .dialog-ux .modal-ux input:not([data-jivara-focus-bound])').forEach((input) => {
        input.dataset.jivaraFocusBound = 'true';

        const setIdle = () => {
          input.style.setProperty('border-color', 'var(--line)', 'important');
          input.style.setProperty('outline', '0', 'important');
          input.style.setProperty('background', 'var(--bg)', 'important');
          input.style.setProperty('background-color', 'var(--bg)', 'important');
          input.style.setProperty('color', 'var(--text)', 'important');
          input.style.setProperty('-webkit-text-fill-color', 'var(--text)', 'important');
          input.style.setProperty('box-shadow', '0 0 0 1000px var(--bg) inset', 'important');
          input.style.setProperty('-webkit-box-shadow', '0 0 0 1000px var(--bg) inset', 'important');
        };

        const setFocused = () => {
          input.style.setProperty('border-color', 'var(--primary)', 'important');
          input.style.setProperty('outline', '0', 'important');
          input.style.setProperty('outline-color', 'transparent', 'important');
          input.style.setProperty('background', 'var(--bg)', 'important');
          input.style.setProperty('background-color', 'var(--bg)', 'important');
          input.style.setProperty('color', 'var(--text)', 'important');
          input.style.setProperty('-webkit-text-fill-color', 'var(--text)', 'important');
          input.style.setProperty('box-shadow', '0 0 0 1000px var(--bg) inset', 'important');
          input.style.setProperty('-webkit-box-shadow', '0 0 0 1000px var(--bg) inset', 'important');
        };

        input.addEventListener('mousedown', () => requestAnimationFrame(setFocused));
        input.addEventListener('focus', setFocused);
        input.addEventListener('focusin', setFocused);
        input.addEventListener('change', setFocused);
        input.addEventListener('input', () => {
          if (document.activeElement === input) setFocused();
        });
        input.addEventListener('blur', setIdle);
        if (document.activeElement === input) setFocused();
      });
    }

    function enforceParameterInputFocusColor() {
      document.querySelectorAll('.swagger-ui .parameters input:not([data-jivara-param-focus-bound]), .swagger-ui .opblock-body input:not([data-jivara-param-focus-bound]), .swagger-ui .parameters textarea:not([data-jivara-param-focus-bound]), .swagger-ui .opblock-body textarea:not([data-jivara-param-focus-bound])').forEach((input) => {
        input.dataset.jivaraParamFocusBound = 'true';
        input.spellcheck = false;
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('autocorrect', 'off');

        if (input.classList.contains('body-param__text')) {
          input.closest('.highlight-code, .model-example, .microlight')?.classList.add('jivara-body-param-editor');
          input.closest('.body-param')?.classList.add('jivara-body-param-editor');
          input.closest('.body-param')?.querySelector('.body-param-options')?.classList.add('jivara-body-param-editor-tab');
        }

        const setIdle = () => {
          input.style.setProperty('border-color', 'var(--line)', 'important');
          input.style.setProperty('outline', '0', 'important');
          input.style.setProperty('box-shadow', 'none', 'important');
          input.style.setProperty('-webkit-box-shadow', 'none', 'important');

          if (input.classList.contains('body-param__text')) {
            input.style.setProperty('background', 'var(--bg)', 'important');
            input.style.setProperty('background-color', 'var(--bg)', 'important');
            input.style.setProperty('color', 'var(--text)', 'important');
            input.style.setProperty('-webkit-text-fill-color', 'var(--text)', 'important');
          }
        };

        const setFocused = () => {
          input.style.setProperty('border-color', 'var(--primary)', 'important');
          input.style.setProperty('outline', '0', 'important');
          input.style.setProperty('outline-color', 'transparent', 'important');
          input.style.setProperty('box-shadow', 'none', 'important');
          input.style.setProperty('-webkit-box-shadow', 'none', 'important');

          if (input.classList.contains('body-param__text')) {
            input.style.setProperty('background', 'var(--bg)', 'important');
            input.style.setProperty('background-color', 'var(--bg)', 'important');
            input.style.setProperty('color', 'var(--text)', 'important');
            input.style.setProperty('-webkit-text-fill-color', 'var(--text)', 'important');
          }
        };

        input.addEventListener('mousedown', () => requestAnimationFrame(setFocused));
        input.addEventListener('focus', setFocused);
        input.addEventListener('focusin', setFocused);
        input.addEventListener('input', () => {
          if (document.activeElement === input) setFocused();
        });
        input.addEventListener('blur', setIdle);
        if (document.activeElement === input) setFocused();
      });
    }

    function enforceBodyParamSchemaColor() {
      document.querySelectorAll([
        '.swagger-ui .opblock-body .body-param',
        '.swagger-ui .opblock-body .highlight-code',
        '.swagger-ui .opblock-body .highlight-code *',
        '.swagger-ui .opblock-body .microlight',
        '.swagger-ui .opblock-body .microlight *',
        '.swagger-ui .opblock-body .body-param-options',
        '.swagger-ui .opblock-body .body-param-options *',
        '.swagger-ui .opblock-body .body-param .tab',
        '.swagger-ui .opblock-body .body-param .tab *',
        '.swagger-ui .opblock-body .body-param .model',
        '.swagger-ui .opblock-body .body-param .model *',
        '.swagger-ui .opblock-body .body-param .model-box',
        '.swagger-ui .opblock-body .body-param .model-box *',
        '.swagger-ui .opblock-body .body-param .model-title',
        '.swagger-ui .opblock-body .body-param .model-toggle',
        '.swagger-ui .opblock-body .body-param .property',
        '.swagger-ui .opblock-body .body-param .prop-type',
        '.swagger-ui .opblock-body .body-param .prop-format'
      ].join(', ')).forEach((node) => {
        node.style.setProperty('background', 'transparent', 'important');
        node.style.setProperty('background-color', 'transparent', 'important');
        node.style.setProperty('box-shadow', 'none', 'important');
        node.style.setProperty('color', 'var(--text)', 'important');
        node.style.setProperty('-webkit-text-fill-color', 'var(--text)', 'important');
        node.style.setProperty('text-shadow', 'none', 'important');
      });
    }

    function markRequestBodyExamples() {
      document.querySelectorAll('.swagger-ui .opblock-body .highlight-code, .swagger-ui .opblock-body .microlight, .swagger-ui .request-body .highlight-code, .swagger-ui .request-body .microlight').forEach((node) => {
        if (node.querySelector('textarea.body-param__text')) return;

        node.classList.add('jivara-request-body-example');
        node.style.setProperty('background', 'transparent', 'important');
        node.style.setProperty('background-color', 'transparent', 'important');
        node.style.setProperty('color', 'var(--text)', 'important');
        node.style.setProperty('-webkit-text-fill-color', 'var(--text)', 'important');
        node.style.setProperty('box-shadow', 'none', 'important');

        node.querySelectorAll('*').forEach((child) => {
          child.style.setProperty('background', 'transparent', 'important');
          child.style.setProperty('background-color', 'transparent', 'important');
          child.style.setProperty('color', 'var(--text)', 'important');
          child.style.setProperty('-webkit-text-fill-color', 'var(--text)', 'important');
          child.style.setProperty('box-shadow', 'none', 'important');
          child.style.setProperty('text-shadow', 'none', 'important');
        });
      });
    }

    function enforceRequiredAsteriskColor() {
      document.querySelectorAll('.swagger-ui .parameter__name.required').forEach((node) => {
        node.querySelectorAll('.jivara-required-star').forEach((star) => {
          star.style.setProperty('color', 'var(--danger)', 'important');
          star.style.setProperty('-webkit-text-fill-color', 'var(--danger)', 'important');
        });

        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
          acceptNode: (textNode) => {
            if (!textNode.textContent?.includes('*')) return NodeFilter.FILTER_REJECT;
            if (textNode.parentElement?.classList.contains('jivara-required-star')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        });

        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        textNodes.forEach((textNode) => {
          const text = textNode.textContent || '';
          if (!text.includes('*')) return;

          const fragment = document.createDocumentFragment();
          text.split(/(\*)/).forEach((part) => {
            if (!part) return;
            if (part === '*') {
              const star = document.createElement('span');
              star.className = 'jivara-required-star';
              star.textContent = '*';
              star.style.setProperty('color', 'var(--danger)', 'important');
              star.style.setProperty('-webkit-text-fill-color', 'var(--danger)', 'important');
              fragment.appendChild(star);
              return;
            }
            fragment.appendChild(document.createTextNode(part));
          });

          textNode.replaceWith(fragment);
        });
      });
    }

    function enforceSchemaToggleColor() {
      document.querySelectorAll('.swagger-ui .request-body .model-toggle, .swagger-ui .opblock-body .body-param .model-toggle, .swagger-ui .request-body .json-schema-2020-12-accordion__icon, .swagger-ui .opblock-body .body-param .json-schema-2020-12-accordion__icon').forEach((toggle) => {
        toggle.style.setProperty('color', 'var(--text)', 'important');
        toggle.style.setProperty('-webkit-text-fill-color', 'var(--text)', 'important');
        toggle.style.setProperty('opacity', '1', 'important');

        toggle.querySelectorAll('svg, path, polygon, use, g').forEach((icon) => {
          icon.style.setProperty('color', 'var(--text)', 'important');
          icon.style.setProperty('fill', 'var(--text)', 'important');
          icon.style.setProperty('stroke', 'var(--text)', 'important');
          icon.style.setProperty('opacity', '1', 'important');
        });
      });
    }

    function enforceLogoutButtonStyle() {
      document.querySelectorAll('.swagger-ui button, .swagger-ui .btn').forEach((button) => {
        if ((button.textContent || '').trim().toUpperCase() !== 'LOGOUT') return;

        button.dataset.jivaraLogout = 'true';
        button.style.setProperty('border', '0', 'important');
        button.style.setProperty('outline', '0', 'important');
        button.style.setProperty('outline-color', 'transparent', 'important');
        button.style.setProperty('box-shadow', 'none', 'important');
        button.style.setProperty('-webkit-box-shadow', 'none', 'important');
        button.style.setProperty('background', 'var(--primary)', 'important');
        button.style.setProperty('color', 'var(--bg)', 'important');

        const setIdle = () => {
          button.style.setProperty('background', 'var(--primary)', 'important');
          button.style.setProperty('color', 'var(--bg)', 'important');
          button.style.setProperty('border', '0', 'important');
          button.style.setProperty('box-shadow', 'none', 'important');
          button.style.setProperty('-webkit-box-shadow', 'none', 'important');
        };

        const setHover = () => {
          button.style.setProperty('background', 'var(--primary-hover)', 'important');
          button.style.setProperty('color', 'var(--bg)', 'important');
          button.style.setProperty('border', '0', 'important');
          button.style.setProperty('box-shadow', 'none', 'important');
          button.style.setProperty('-webkit-box-shadow', 'none', 'important');
        };

        button.addEventListener('mouseenter', setHover);
        button.addEventListener('focus', setHover);
        button.addEventListener('mouseleave', setIdle);
        button.addEventListener('blur', setIdle);
      });
    }

    enhanceAllSelects();
    appendJivaraFooter();
    appendBackToTopButton();
    enforceAuthInputFocusColor();
    enforceParameterInputFocusColor();
    enforceRequiredAsteriskColor();
    enforceSchemaToggleColor();
    markRequestBodyExamples();
    enforceBodyParamSchemaColor();
    enforceLogoutButtonStyle();
