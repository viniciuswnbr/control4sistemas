/**
 * Control 4 Sistemas — Barra Compartilhada do Portfólio V1
 * Uso: <script src="portfolio-bar.js" data-system-name="Nome do Sistema" data-storage-key="c4_v1_chave"></script>
 */
(function () {
  const currentScript = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const systemName =
    (currentScript && currentScript.getAttribute('data-system-name')) ||
    document.title.split('|')[0].trim() ||
    'Sistema sob Medida';

  const storageKey =
    (currentScript && currentScript.getAttribute('data-storage-key')) || '';

  const WHATSAPP_NUMBER = '5512988600746';
  const THEME_KEY = 'c4_portfolio_theme';

  const SYSTEMS = [
    { file: 'pedidos-comissoes', label: '01. Pedidos & Comissões' },
    { file: 'ordem-servico', label: '02. Ordem de Serviço + Assinatura' },
    { file: 'estoque-alertas', label: '03. Estoque & Alertas' },
    { file: 'agendamento-clinicas', label: '04. Agenda Clínicas 24h' },
    { file: 'cotacao-fornecedores', label: '05. Cotação Fornecedores' },
    { file: 'controle-frota', label: '06. Controle de Frota' },
    { file: 'gestor-obras', label: '07. Gestor de Obras' },
    { file: 'revenda-consignado', label: '08. Revenda Consignado' },
  ];

  const currentFile = (window.location.pathname.split('/').pop() || '')
    .toLowerCase()
    .replace(/\.html$/, '');

  const waMessage = encodeURIComponent(
    `Olá Juliana! Estava testando o sistema "${systemName}" no Portfólio V1 da Control 4 Sistemas e gostaria de um orçamento para personalizar para a minha empresa.`
  );
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  const SUN_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  const MOON_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  }

  function updateThemeButton(isDark) {
    const btn = document.getElementById('c4-pb-theme');
    if (!btn) return;
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.title = isDark ? 'Alternar para Modo Escritório (Tema Claro)' : 'Alternar para Modo Operação/Galpão (Tema Escuro)';
    btn.innerHTML = isDark
      ? `${SUN_SVG}<span>Tema Claro</span>`
      : `${MOON_SVG}<span>Tema Escuro</span>`;
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch (e) {}
    updateThemeButton(isDark);
  }

  // Apply saved theme immediately to minimize flash
  applyTheme(getSavedTheme());

  // Inject styles for the shared bar, dark mode, toasts, and empty states
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --c4-bg: #F8FAFC;
      --c4-surface: #FFFFFF;
      --c4-surface-alt: #F1F5F9;
      --c4-border: #E2E8F0;
      --c4-text: #0F172A;
      --c4-text-muted: #64748B;
    }
    html.dark {
      color-scheme: dark;
      --c4-bg: #0B1120;
      --c4-surface: #111827;
      --c4-surface-alt: #1E293B;
      --c4-border: #1E293B;
      --c4-text: #F8FAFC;
      --c4-text-muted: #94A3B8;
    }

    #c4-portfolio-bar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #0F172A;
      color: #F8FAFC;
      border-bottom: 1px solid #1E293B;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.16);
    }
    #c4-portfolio-bar * {
      box-sizing: border-box;
    }
    .c4-pb-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 10px 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .c4-pb-left {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
    .c4-pb-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #94A3B8;
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid #334155;
      background: #1E293B;
      transition: all 0.15s ease;
    }
    .c4-pb-back:hover {
      color: #FFFFFF;
      border-color: #475569;
    }
    .c4-pb-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: #38BDF8;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 5px 10px;
      border-radius: 9999px;
      white-space: nowrap;
    }
    .c4-pb-select {
      background: #1E293B;
      color: #E2E8F0;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 12px;
      font-weight: 500;
      outline: none;
      cursor: pointer;
    }
    .c4-pb-select:hover, .c4-pb-select:focus {
      border-color: #38BDF8;
    }
    .c4-pb-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .c4-pb-btn-theme {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #1E293B;
      color: #E2E8F0;
      border: 1px solid #334155;
      border-radius: 9999px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .c4-pb-btn-theme:hover {
      background: #334155;
      border-color: #38BDF8;
      color: #FFFFFF;
    }
    html.dark .c4-pb-btn-theme {
      background: rgba(56, 189, 248, 0.14);
      border-color: rgba(56, 189, 248, 0.4);
      color: #7DD3FC;
    }
    html.dark .c4-pb-btn-theme:hover {
      background: rgba(56, 189, 248, 0.24);
      color: #FFFFFF;
    }
    .c4-pb-btn-reset {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #1E293B;
      color: #E2E8F0;
      border: 1px solid #475569;
      border-radius: 8px;
      padding: 7px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .c4-pb-btn-reset:hover {
      background: #334155;
      color: #FFFFFF;
    }
    .c4-pb-btn-wa {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: #10B981;
      color: #FFFFFF;
      text-decoration: none;
      border: 1px solid #059669;
      border-radius: 8px;
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
      transition: all 0.15s ease;
    }
    .c4-pb-btn-wa:hover {
      background: #059669;
      transform: translateY(-1px);
    }

    /* Toast System */
    #c4-toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 360px;
      width: calc(100vw - 32px);
      pointer-events: none;
    }
    .c4-toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 15px;
      border-radius: 10px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;
      background: #0F172A;
      color: #F8FAFC;
      border: 1px solid #1E293B;
      box-shadow: 0 12px 28px rgba(2, 6, 23, 0.28);
      opacity: 0;
      transform: translateY(14px) scale(0.96);
      transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .c4-toast.c4-toast-show {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .c4-toast.c4-toast-hide {
      opacity: 0;
      transform: translateY(10px) scale(0.96);
    }
    .c4-toast-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 9999px;
      flex-shrink: 0;
    }
    .c4-toast-success { border-left: 4px solid #10B981; }
    .c4-toast-success .c4-toast-icon { background: rgba(16, 185, 129, 0.16); color: #34D399; }
    .c4-toast-info { border-left: 4px solid #06B6D4; }
    .c4-toast-info .c4-toast-icon { background: rgba(6, 182, 212, 0.16); color: #22D3EE; }
    .c4-toast-warning { border-left: 4px solid #F59E0B; }
    .c4-toast-warning .c4-toast-icon { background: rgba(245, 158, 11, 0.16); color: #FBBF24; }
    .c4-toast-error { border-left: 4px solid #EF4444; }
    .c4-toast-error .c4-toast-icon { background: rgba(239, 68, 68, 0.16); color: #F87171; }

    /* Empty State Component */
    .c4-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
    }
    .c4-empty-icon {
      width: 52px;
      height: 52px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F1F5F9;
      color: #64748B;
      margin-bottom: 14px;
      border: 1px solid #E2E8F0;
    }
    .c4-empty-title {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 6px 0;
    }
    .c4-empty-sub {
      font-size: 13px;
      color: #64748B;
      max-width: 420px;
      margin: 0 0 18px 0;
      line-height: 1.5;
    }
    .c4-empty-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      background: #0284C7;
      color: #FFFFFF;
      border: none;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.15s ease;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);
    }
    .c4-empty-btn:hover {
      background: #0369A1;
      transform: translateY(-1px);
    }
    html.dark .c4-empty-icon {
      background: #1E293B;
      color: #94A3B8;
      border-color: #334155;
    }
    html.dark .c4-empty-title {
      color: #F8FAFC;
    }
    html.dark .c4-empty-sub {
      color: #94A3B8;
    }

    /* Global Dark Mode Adaptation for Portfolio V1 Systems */
    html.dark body {
      background-color: #0B1120 !important;
      color: #F8FAFC !important;
    }
    html.dark main .bg-white,
    html.dark [id$="-modal"] .bg-white {
      background-color: #111827 !important;
    }
    html.dark .c4-keep-light {
      background-color: #FFFFFF !important;
      color: #0F172A !important;
    }
    html.dark main .bg-slate-50,
    html.dark main .bg-slate-50\\/70,
    html.dark main .bg-slate-50\\/80,
    html.dark main .bg-slate-100,
    html.dark [id$="-modal"] .bg-slate-50,
    html.dark [id$="-modal"] .bg-slate-100 {
      background-color: #1E293B !important;
    }
    html.dark main .border-slate-200,
    html.dark main .border-slate-100,
    html.dark [id$="-modal"] .border-slate-200,
    html.dark [id$="-modal"] .border-slate-100 {
      border-color: #1E293B !important;
    }
    html.dark main .border-slate-300,
    html.dark [id$="-modal"] .border-slate-300 {
      border-color: #334155 !important;
    }
    html.dark main .divide-slate-100 > :not([hidden]) ~ :not([hidden]),
    html.dark main .divide-slate-200 > :not([hidden]) ~ :not([hidden]) {
      border-color: #1E293B !important;
    }
    html.dark main .text-slate-900,
    html.dark main .text-slate-800,
    html.dark [id$="-modal"] .text-slate-900,
    html.dark [id$="-modal"] .text-slate-800 {
      color: #F8FAFC !important;
    }
    html.dark main .text-slate-700,
    html.dark main .text-slate-600,
    html.dark [id$="-modal"] .text-slate-700,
    html.dark [id$="-modal"] .text-slate-600 {
      color: #CBD5E1 !important;
    }
    html.dark main .text-slate-500,
    html.dark main .text-slate-400,
    html.dark [id$="-modal"] .text-slate-500,
    html.dark [id$="-modal"] .text-slate-400 {
      color: #94A3B8 !important;
    }
    html.dark main input:not([type="checkbox"]):not([type="radio"]),
    html.dark main select,
    html.dark main textarea,
    html.dark [id$="-modal"] input:not([type="checkbox"]):not([type="radio"]),
    html.dark [id$="-modal"] select,
    html.dark [id$="-modal"] textarea {
      background-color: #0F172A !important;
      color: #F8FAFC !important;
      border-color: #334155 !important;
    }
    html.dark main input::placeholder,
    html.dark main textarea::placeholder,
    html.dark [id$="-modal"] input::placeholder,
    html.dark [id$="-modal"] textarea::placeholder {
      color: #64748B !important;
    }
    html.dark main table thead tr {
      background-color: #1E293B !important;
      color: #94A3B8 !important;
    }
    html.dark main table tbody tr:hover {
      background-color: rgba(30, 41, 59, 0.72) !important;
    }
    html.dark main .hover\\:bg-slate-50:hover,
    html.dark main .hover\\:bg-slate-50\\/80:hover,
    html.dark main .hover\\:bg-slate-50\\/70:hover,
    html.dark main .hover\\:bg-slate-100:hover,
    html.dark main .hover\\:bg-slate-200:hover,
    html.dark [id$="-modal"] .hover\\:bg-slate-100:hover {
      background-color: #334155 !important;
    }

    /* Semantic badges & highlights in Dark Mode */
    html.dark main .bg-sky-50,
    html.dark [id$="-modal"] .bg-sky-50 {
      background-color: rgba(14, 165, 233, 0.14) !important;
    }
    html.dark main .text-sky-700,
    html.dark main .text-sky-800,
    html.dark [id$="-modal"] .text-sky-700,
    html.dark [id$="-modal"] .text-sky-800 {
      color: #38BDF8 !important;
    }
    html.dark main .border-sky-200,
    html.dark [id$="-modal"] .border-sky-200 {
      border-color: rgba(56, 189, 248, 0.32) !important;
    }

    html.dark main .bg-emerald-50,
    html.dark main .bg-emerald-50\\/30,
    html.dark main .bg-emerald-50\\/90 {
      background-color: rgba(16, 185, 129, 0.14) !important;
    }
    html.dark main .text-emerald-700,
    html.dark main .text-emerald-800,
    html.dark [id$="-modal"] .text-emerald-700 {
      color: #34D399 !important;
    }
    html.dark main .border-emerald-200,
    html.dark main .border-emerald-300,
    html.dark main .border-emerald-400 {
      border-color: rgba(52, 211, 153, 0.35) !important;
    }

    html.dark main .bg-amber-50,
    html.dark main .bg-amber-100 {
      background-color: rgba(245, 158, 11, 0.15) !important;
    }
    html.dark main .text-amber-700,
    html.dark main .text-amber-800,
    html.dark [id$="-modal"] .text-amber-700 {
      color: #FBBF24 !important;
    }
    html.dark main .border-amber-200,
    html.dark main .border-amber-300 {
      border-color: rgba(251, 191, 36, 0.32) !important;
    }

    html.dark main .bg-rose-50,
    html.dark main .bg-rose-50\\/40,
    html.dark main .bg-rose-50\\/90,
    html.dark main .bg-rose-100 {
      background-color: rgba(244, 63, 94, 0.15) !important;
    }
    html.dark main .text-rose-700,
    html.dark main .text-rose-800,
    html.dark main .text-rose-900 {
      color: #FB7185 !important;
    }
    html.dark main .border-rose-200,
    html.dark main .border-rose-300 {
      border-color: rgba(251, 113, 133, 0.35) !important;
    }

    html.dark main .bg-indigo-50 {
      background-color: rgba(99, 102, 241, 0.15) !important;
    }
    html.dark main .text-indigo-600 {
      color: #818CF8 !important;
    }

    html.dark #wa-preview-text {
      background-color: #064E3B !important;
      color: #ECFDF5 !important;
      border-color: #059669 !important;
    }

    @media print {
      #c4-portfolio-bar, #c4-toast-container { display: none !important; }
      html.dark body, html.dark #receipt-print-area {
        background: #FFFFFF !important;
        color: #0F172A !important;
      }
      html.dark #receipt-print-area * {
        color: #0F172A !important;
        border-color: #CBD5E1 !important;
      }
    }
    @media (max-width: 640px) {
      .c4-pb-inner { padding: 8px 12px; gap: 8px; }
      .c4-pb-actions { width: 100%; justify-content: space-between; }
      .c4-pb-btn-wa { flex: 1; justify-content: center; }
    }
  `;
  document.head.appendChild(style);

  function renderBar() {
    if (document.getElementById('c4-portfolio-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'c4-portfolio-bar';

    const optionsHtml = SYSTEMS.map((s) => {
      const selected = s.file === currentFile ? 'selected' : '';
      return `<option value="${s.file}" ${selected}>${s.label}</option>`;
    }).join('');

    bar.innerHTML = `
      <div class="c4-pb-inner">
        <div class="c4-pb-left">
          <a href="/" class="c4-pb-back" title="Voltar para Control 4 Sistemas">
            <span>←</span>
            <span>Site</span>
          </a>
          <span class="c4-pb-badge">PORTFÓLIO V1 // CONTROL 4 SISTEMAS</span>
          <select id="c4-pb-switcher" class="c4-pb-select" aria-label="Trocar sistema do portfólio">
            ${optionsHtml}
          </select>
        </div>
        <div class="c4-pb-actions">
          <button type="button" id="c4-pb-theme" class="c4-pb-btn-theme"></button>
          <button type="button" id="c4-pb-reset" class="c4-pb-btn-reset" title="Restaurar dados iniciais de demonstração">
            <span>↺</span>
            <span>Resetar Dados Demo</span>
          </button>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="c4-pb-btn-wa">
            <span>💬</span>
            <span>Personalizar Este Sistema (Orçamento)</span>
          </a>
        </div>
      </div>
    `;

    document.body.insertBefore(bar, document.body.firstChild);
    updateThemeButton(document.documentElement.classList.contains('dark'));

    const themeBtn = document.getElementById('c4-pb-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(nextTheme);
        if (typeof window.showToast === 'function') {
          window.showToast(
            nextTheme === 'dark' ? 'Tema Escuro (Modo Operação) ativado' : 'Tema Claro (Modo Escritório) ativado',
            'info'
          );
        }
      });
    }

    const switcher = document.getElementById('c4-pb-switcher');
    if (switcher) {
      switcher.addEventListener('change', function () {
        if (this.value && this.value !== currentFile) {
          window.location.href = this.value;
        }
      });
    }

    const resetBtn = document.getElementById('c4-pb-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (typeof window.resetDemoData === 'function') {
          window.resetDemoData();
        } else if (storageKey) {
          localStorage.removeItem(storageKey);
          window.location.reload();
        } else {
          Object.keys(localStorage)
            .filter((k) => k.startsWith('c4_v1_'))
            .forEach((k) => localStorage.removeItem(k));
          window.location.reload();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBar);
  } else {
    renderBar();
  }

  // Global Toast System
  const TOAST_ICONS = {
    success: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    warning: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    error: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  };

  window.showToast = function (mensagem, tipo = 'success') {
    const validType = TOAST_ICONS[tipo] ? tipo : 'success';
    let container = document.getElementById('c4-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'c4-toast-container';
      document.body.appendChild(container);
    }

    const el = document.createElement('div');
    el.className = `c4-toast c4-toast-${validType}`;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');

    const iconWrap = document.createElement('span');
    iconWrap.className = 'c4-toast-icon';
    iconWrap.innerHTML = TOAST_ICONS[validType];

    const textWrap = document.createElement('span');
    textWrap.textContent = mensagem;

    el.appendChild(iconWrap);
    el.appendChild(textWrap);
    container.appendChild(el);

    requestAnimationFrame(() => {
      el.classList.add('c4-toast-show');
    });

    setTimeout(() => {
      el.classList.remove('c4-toast-show');
      el.classList.add('c4-toast-hide');
      setTimeout(() => el.remove(), 260);
    }, 3200);
  };

  // Global utility helpers for the 8 V1 apps
  window.C4Utils = {
    formatBRL: function (val) {
      return Number(val || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    },
    formatNumber: function (val, decimals = 2) {
      return Number(val || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
    escapeHtml: function (str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    toast: function (message, type = 'success') {
      window.showToast(message, type);
    },
    emptyStateHtml: function (
      onClearClick = 'clearFilters()',
      subtitle = 'Tente ajustar os termos da busca ou remover os filtros aplicados para visualizar os registros.'
    ) {
      return `
        <div class="c4-empty-state">
          <div class="c4-empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
              <path d="m13.5 8.5-5 5"></path>
              <path d="m8.5 8.5 5 5"></path>
            </svg>
          </div>
          <h3 class="c4-empty-title">Nenhum registro encontrado para este filtro</h3>
          <p class="c4-empty-sub">${this.escapeHtml(subtitle)}</p>
          <button type="button" onclick="${onClearClick}" class="c4-empty-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            <span>Limpar Filtros</span>
          </button>
        </div>
      `;
    },
  };
})();
