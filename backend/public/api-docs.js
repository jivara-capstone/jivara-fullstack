(() => {
  const ROOT_SELECTOR = '#app';
  const ENHANCED_ATTR = 'data-jivara-scalar-enhanced';

  const loadViewportMeta = () => {
    if (document.querySelector('meta[name="viewport"]')) return;

    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(meta);
  };

  const loadJivaraStylesheet = () => {
    if (document.querySelector('link[data-jivara-docs-style]')) return;

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/docs-assets/api-docs.css';
    stylesheet.dataset.jivaraDocsStyle = 'true';
    document.head.appendChild(stylesheet);
  };

  const loadJivaraFonts = () => {
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
  };

  const ensureBodyState = () => {
    document.documentElement.dataset.jivaraDocs = 'scalar';
    document.body.dataset.jivaraDocs = 'scalar';
    document.title = 'Dokumentasi API | Jivara';
  };

  const appendJivaraFooter = () => {
    if (document.querySelector('.jivara-docs-footer')) return;

    const root = document.querySelector(ROOT_SELECTOR);
    if (!root) return;

    const footer = document.createElement('footer');
    footer.className = 'jivara-docs-footer';

    const inner = document.createElement('div');
    inner.className = 'jivara-docs-footer__inner';

    const copyright = document.createElement('span');
    copyright.textContent = `${String.fromCharCode(169)} ${new Date().getFullYear()} Jivara`;

    const tagline = document.createElement('span');
    tagline.textContent = 'Stay on track, stay healthy';

    inner.append(copyright, tagline);
    footer.appendChild(inner);
    root.insertAdjacentElement('afterend', footer);
  };

  const appendBackToTopButton = () => {
    if (document.querySelector('.jivara-back-to-top')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'jivara-back-to-top';
    button.setAttribute('aria-label', 'Kembali ke atas');
    button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const updateVisibility = () => {
      button.dataset.visible = String(window.scrollY > 420);
    };

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', updateVisibility, { passive: true });
    document.body.appendChild(button);
    updateVisibility();
  };

  const normalizeScalarButtons = () => {
    document.querySelectorAll(`${ROOT_SELECTOR} button:not([${ENHANCED_ATTR}])`).forEach((button) => {
      button.setAttribute(ENHANCED_ATTR, 'true');

      const label = (button.textContent || '').trim().toLowerCase();
      if (label === 'logout') {
        button.dataset.jivaraLogout = 'true';
      }
    });
  };

  const normalizeScalarInputs = () => {
    document.querySelectorAll(`${ROOT_SELECTOR} input:not([${ENHANCED_ATTR}]), ${ROOT_SELECTOR} textarea:not([${ENHANCED_ATTR}])`).forEach((input) => {
      input.setAttribute(ENHANCED_ATTR, 'true');
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('autocorrect', 'off');
      input.spellcheck = false;
    });
  };

  const runEnhancements = () => {
    loadViewportMeta();
    loadJivaraStylesheet();
    loadJivaraFonts();
    ensureBodyState();
    appendJivaraFooter();
    appendBackToTopButton();
    normalizeScalarButtons();
    normalizeScalarInputs();
  };

  let mutationTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(mutationTimeout);
    mutationTimeout = setTimeout(runEnhancements, 100);
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  runEnhancements();
})();
