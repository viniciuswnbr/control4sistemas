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

  const SYSTEMS = [
    { file: 'pedidos-comissoes.html', label: '01. Pedidos & Comissões' },
    { file: 'ordem-servico.html', label: '02. Ordem de Serviço + Assinatura' },
    { file: 'estoque-alertas.html', label: '03. Estoque & Alertas' },
    { file: 'agendamento-clinicas.html', label: '04. Agenda Clínicas 24h' },
    { file: 'cotacao-fornecedores.html', label: '05. Cotação Fornecedores' },
    { file: 'controle-frota.html', label: '06. Controle de Frota' },
    { file: 'gestor-obras.html', label: '07. Gestor de Obras' },
    { file: 'revenda-consignado.html', label: '08. Revenda Consignado' },
  ];

  const currentFile = (window.location.pathname.split('/').pop() || '').toLowerCase();

  const waMessage = encodeURIComponent(
    `Olá Juliana! Estava testando o sistema "${systemName}" no Portfólio V1 da Control 4 Sistemas e gostaria de um orçamento para personalizar para a minha empresa.`
  );
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  // Inject styles for the shared bar (independent of Tailwind classes so it always renders cleanly)
  const style = document.createElement('style');
  style.textContent = `
    #c4-portfolio-bar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #0F172A;
      color: #F8FAFC;
      border-bottom: 1px solid #1E293B;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
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
    @media print {
      #c4-portfolio-bar { display: none !important; }
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
          <a href="../index.html" class="c4-pb-back" title="Voltar para Control 4 Sistemas">
            <span>←</span>
            <span>Site</span>
          </a>
          <span class="c4-pb-badge">PORTFÓLIO V1 // CONTROL 4 SISTEMAS</span>
          <select id="c4-pb-switcher" class="c4-pb-select" aria-label="Trocar sistema do portfólio">
            ${optionsHtml}
          </select>
        </div>
        <div class="c4-pb-actions">
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
      let container = document.getElementById('c4-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'c4-toast-container';
        container.style.cssText =
          'position:fixed;bottom:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;max-width:340px;';
        document.body.appendChild(container);
      }
      const colors = {
        success: 'background:#0F172A;color:#FFFFFF;border-left:4px solid #10B981;',
        warning: 'background:#0F172A;color:#FFFFFF;border-left:4px solid #F59E0B;',
        error: 'background:#0F172A;color:#FFFFFF;border-left:4px solid #EF4444;',
        info: 'background:#0F172A;color:#FFFFFF;border-left:4px solid #0284C7;',
      };
      const el = document.createElement('div');
      el.style.cssText =
        (colors[type] || colors.success) +
        'padding:12px 16px;border-radius:8px;font-size:13px;font-weight:500;box-shadow:0 10px 25px rgba(15,23,42,0.2);transition:opacity 0.25s ease;';
      el.textContent = message;
      container.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 260);
      }, 3000);
    },
  };
})();
