// site-wide image lazy initializer
// Runs on import and ensures all <img> elements get loading="lazy" and decoding="async".
// If an <img> has data-src or data-srcset, the script will remove its src and wait until
// the image enters the viewport before assigning src/srcset (IntersectionObserver).

if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target as HTMLImageElement;
      const dataSrc = img.getAttribute('data-src');
      const dataSrcset = img.getAttribute('data-srcset');
      try {
        if (dataSrc) img.src = dataSrc;
        if (dataSrcset) img.srcset = dataSrcset;
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
      } catch (e) {
        // ignore
      }
      io.unobserve(img);
    });
  }, { rootMargin: '250px' });

  function ensureAttrs(img: HTMLImageElement) {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  }

  function processImage(img: HTMLImageElement) {
    // If author provided data-src/data-srcset, defer assigning src until visible
    if (img.hasAttribute('data-src') || img.hasAttribute('data-srcset')) {
      // remove immediate src to avoid eager download if present
      try { img.removeAttribute('src'); } catch(e) {}
      ensureAttrs(img);
      io.observe(img);
    } else {
      ensureAttrs(img);
    }
  }

  // Process existing images
  document.querySelectorAll('img').forEach(n => processImage(n as HTMLImageElement));

  // Watch for dynamically added images (Angular renders templates later)
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        const el = node as Element;
        if (el.tagName === 'IMG') processImage(el as HTMLImageElement);
        else el.querySelectorAll && el.querySelectorAll('img').forEach(n => processImage(n as HTMLImageElement));
      });
    }
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });
}

// For very old browsers without IntersectionObserver, we still ensure attributes are set.
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  document.querySelectorAll('img').forEach((n) => {
    const img = n as HTMLImageElement;
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });
}
