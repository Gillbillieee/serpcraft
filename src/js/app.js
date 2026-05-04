// ===== SerpCraft — SEO Meta Tag Generator =====
(function() {
  'use strict';

  const pageTitleEl = document.getElementById('pageTitle');
  const pageDescEl = document.getElementById('pageDesc');
  const brandNameEl = document.getElementById('brandName');
  const targetKeywordEl = document.getElementById('targetKeyword');
  const metaOutput = document.getElementById('metaOutput');
  const metaEmpty = document.getElementById('metaEmpty');
  const googlePreview = document.getElementById('googlePreview');
  const metaLoading = document.getElementById('metaLoading');

  let generatedMeta = {};

  document.addEventListener('DOMContentLoaded', () => {
    loadDraft();
    setupAutoSave();
  });

  function generateMeta() {
    const title = pageTitleEl.value.trim();
    const desc = pageDescEl.value.trim();
    const brand = brandNameEl.value.trim();
    const keyword = targetKeywordEl.value.trim();

    if (!title && !desc) {
      shakeElement(pageTitleEl || pageDescEl);
      (pageTitleEl || pageDescEl).focus();
      return;
    }

    metaOutput.style.display = 'none';
    googlePreview.style.display = 'none';
    metaLoading.style.display = 'block';

    setTimeout(() => {
      const results = generateMetaTags(title, desc, brand, keyword);
      generatedMeta = results;
      renderMetaTags(results);
      renderGooglePreview(results);

      metaOutput.style.display = 'flex';
      googlePreview.style.display = 'block';
      metaLoading.style.display = 'none';
      saveDraft();
    }, 600);
  }

  function generateMetaTags(title, desc, brand, keyword) {
    const titleVariants = [];
    const descVariants = [];

    // Title generation templates
    const titleTemplates = [
      () => `${title}${brand ? ' | ' + brand : ''}`,
      () => `${title} — ${brand || 'Expert Guide'}`,
      () => `${keyword || title.split(' ')[0]}: ${title.replace(new RegExp(keyword || '', 'gi'), '').trim() || title}${brand ? ' | ' + brand : ''}`,
    ];

    // Smart title generation
    const baseTitle = title || desc.substring(0, 40);
    const keywordStr = keyword || extractKeyword(baseTitle);

    titleVariants.push(`${baseTitle}${brand ? ' | ' + brand : ''}`.substring(0, 60));
    titleVariants.push(`${keywordStr}: ${baseTitle.substring(0, 50)}${brand ? ' | ' + brand : ''}`.substring(0, 60));
    titleVariants.push(`${baseTitle} | ${brand || '2026 Guide'}`.substring(0, 60));

    // Description generation templates
    const descTemplates = [
      () => `${desc || baseTitle}. Learn everything you need to know about ${keywordStr || baseTitle.substring(0, 30)}. ${brand ? brand + ' — ' : ''}${Math.random() > 0.5 ? 'Get started today.' : 'Discover more now.'}`,
      () => `Looking for ${keywordStr || baseTitle}? Our comprehensive guide covers everything you need to know. ${desc ? desc.substring(0, 120) : 'Expert tips and strategies inside.'} ${brand ? '| ' + brand : ''}`,
      () => `${desc || baseTitle.substring(0, 140)}${desc && desc.length > 140 ? '...' : ''}${brand ? ` — ${brand}` : ''}.`,
    ];

    descVariants.push(descTemplates[0]().substring(0, 160));
    descVariants.push(descTemplates[1]().substring(0, 160));
    descVariants.push(descTemplates[2]().substring(0, 160));

    // Remove duplicates
    const uniqueTitles = [...new Set(titleVariants)];
    const uniqueDescs = [...new Set(descVariants)];

    return {
      titles: uniqueTitles.slice(0, 3),
      descriptions: uniqueDescs.slice(0, 3),
      ogTitle: (title || desc.substring(0, 40)).substring(0, 60),
      ogDescription: (desc || baseTitle).substring(0, 200),
      ogImage: '', // User sets this
      twitterCard: 'summary_large_image',
    };
  }

  function extractKeyword(text) {
    const words = text.split(/\s+/).filter(w => w.length > 3);
    return words.slice(0, 3).join(' ') || text.substring(0, 20);
  }

  function renderMetaTags(meta) {
    metaOutput.innerHTML = '';

    // Generate combinations for display
    const combos = [];
    for (let i = 0; i < Math.min(3, meta.titles.length); i++) {
      combos.push({
        title: meta.titles[i],
        desc: meta.descriptions[i % meta.descriptions.length],
      });
    }

    combos.forEach((combo, idx) => {
      const card = document.createElement('div');
      card.className = 'meta-card';

      const titleChars = combo.title.length;
      const descChars = combo.desc.length;
      let titleClass = titleChars <= 60 ? 'ok' : titleChars <= 70 ? 'warn' : 'over';
      let descClass = descChars <= 160 ? 'ok' : descChars <= 175 ? 'warn' : 'over';

      card.innerHTML = `
        <div class="meta-label">Option ${idx + 1}</div>
        
        <div style="margin-bottom:12px;">
          <div class="meta-label" style="color:#888;">Meta Title</div>
          <div class="meta-value">${escapeHtml(combo.title)}</div>
          <div class="char-count ${titleClass}">${titleChars}/60 characters ${titleChars > 60 ? '⚠️ truncated in Google' : ''}</div>
        </div>

        <div style="margin-bottom:12px;">
          <div class="meta-label" style="color:#888;">Meta Description</div>
          <div class="meta-value">${escapeHtml(combo.desc)}</div>
          <div class="char-count ${descClass}">${descChars}/160 characters ${descChars > 160 ? '⚠️ truncated in Google' : ''}</div>
        </div>

        <div style="margin-bottom:12px;">
          <div class="meta-label" style="color:#888;">HTML Code</div>
          <div class="meta-value" style="font-size:12px; white-space:pre-wrap;">&lt;title&gt;${escapeHtml(combo.title)}&lt;/title&gt;
&lt;meta name="description" content="${escapeHtml(combo.desc)}"&gt;</div>
        </div>

        <div class="meta-actions">
          <button class="btn btn-sm btn-outline" onclick="copyMeta(${idx})">📋 Copy HTML</button>
          <button class="btn btn-sm btn-outline" onclick="copyTitle(${idx})">📋 Title Only</button>
        </div>
      `;

      metaOutput.appendChild(card);
    });

    // OG Tags section
    const ogCard = document.createElement('div');
    ogCard.className = 'meta-card';
    ogCard.innerHTML = `
      <div class="meta-label" style="color:var(--accent);">📱 Open Graph Tags (for social sharing)</div>
      <div class="meta-value" style="font-size:12px; white-space:pre-wrap;">&lt;meta property="og:title" content="${escapeHtml(meta.ogTitle)}"&gt;
&lt;meta property="og:description" content="${escapeHtml(meta.ogDescription)}"&gt;
&lt;meta property="og:type" content="website"&gt;
&lt;!-- Add og:image with your image URL --&gt;
&lt;meta property="og:image" content="https://yoursite.com/image.jpg"&gt;

&lt;meta name="twitter:card" content="${meta.twitterCard}"&gt;
&lt;meta name="twitter:title" content="${escapeHtml(meta.ogTitle)}"&gt;
&lt;meta name="twitter:description" content="${escapeHtml(meta.ogDescription)}"&gt;</div>
      <button class="btn btn-sm btn-outline" onclick="copyOgTags()">📋 Copy OG Tags</button>
    `;
    metaOutput.appendChild(ogCard);
  }

  function renderGooglePreview(meta) {
    const title = meta.titles[0] || '';
    const desc = meta.descriptions[0] || '';
    const url = 'www.example.com' + (pageTitleEl.value.trim() ? '/' + pageTitleEl.value.trim().toLowerCase().replace(/\s+/g, '-').substring(0, 30) : '');

    document.getElementById('prevUrl').textContent = url;
    document.getElementById('prevTitle').textContent = title;
    document.getElementById('prevDesc').textContent = desc;
  }

  // ===== Actions =====
  window.copyMeta = function(idx) {
    const combo = generatedMeta.titles[idx];
    if (!combo) return;
    const desc = generatedMeta.descriptions[idx % generatedMeta.descriptions.length];
    const html = `<title>${escapeHtml(combo)}</title>\n<meta name="description" content="${escapeHtml(desc)}">`;
    navigator.clipboard.writeText(html).then(() => showToast('HTML meta tags copied!'));
  };

  window.copyTitle = function(idx) {
    if (!generatedMeta.titles[idx]) return;
    navigator.clipboard.writeText(generatedMeta.titles[idx]).then(() => showToast('Title copied!'));
  };

  window.copyOgTags = function() {
    const meta = generatedMeta;
    const html = `<meta property="og:title" content="${escapeHtml(meta.ogTitle)}">
<meta property="og:description" content="${escapeHtml(meta.ogDescription)}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://yoursite.com/image.jpg">
<meta name="twitter:card" content="${meta.twitterCard}">
<meta name="twitter:title" content="${escapeHtml(meta.ogTitle)}">
<meta name="twitter:description" content="${escapeHtml(meta.ogDescription)}">`;
    navigator.clipboard.writeText(html).then(() => showToast('OG tags copied!'));
  };

  window.copyAllMeta = function() {
    let all = '';
    for (let i = 0; i < Math.min(3, generatedMeta.titles.length); i++) {
      const desc = generatedMeta.descriptions[i % generatedMeta.descriptions.length];
      all += `--- Option ${i + 1} ---\n<title>${escapeHtml(generatedMeta.titles[i])}</title>\n<meta name="description" content="${escapeHtml(desc)}">\n\n`;
    }
    navigator.clipboard.writeText(all).then(() => showToast('All meta tags copied!'));
  };

  // ===== Utilities =====
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => el.style.animation = '', 400);
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#333;color:white;padding:12px 24px;border-radius:8px;font-size:14px;z-index:9999;animation:fadeInUp 0.3s ease;`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 2000);
  }

  // ===== Persistence =====
  function saveDraft() {
    try {
      localStorage.setItem('serpcraft_form', JSON.stringify({
        title: pageTitleEl.value, desc: pageDescEl.value,
        brand: brandNameEl.value, keyword: targetKeywordEl.value, ts: Date.now()
      }));
    } catch (e) {}
  }

  function loadDraft() {
    try {
      const d = localStorage.getItem('serpcraft_form');
      if (!d) return;
      const data = JSON.parse(d);
      if (Date.now() - data.ts < 86400000) {
        pageTitleEl.value = data.title || '';
        pageDescEl.value = data.desc || '';
        brandNameEl.value = data.brand || '';
        targetKeywordEl.value = data.keyword || '';
      }
    } catch (e) {}
  }

  function setupAutoSave() {
    [pageTitleEl, pageDescEl, brandNameEl, targetKeywordEl].forEach(el => {
      el.addEventListener('input', saveDraft);
    });
  }

  // Add shake animation
  const style = document.createElement('style');
  style.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}} @keyframes fadeInUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
  document.head.appendChild(style);

})();
