/* ==========================================================================
   Control 4 // Sistemas — Painel Administrativo & Comercial
   Módulos: Auth (SHA-256) | CRM & Triagem | Gerador PDF | Prospecção Cirúrgica
   ========================================================================== */

(() => {
  'use strict';

  // --------------------------------------------------------------------------
  // CONSTANTES & STORAGE KEYS
  // --------------------------------------------------------------------------
  const DEFAULT_PASSWORD_HASH = 'd97a9973230aa340689733de75eb1be37963544a7e1708f02387abf6460d78c5'; // control4@2026
  const STORAGE_KEYS = {
    AUTH_SESSION: 'c4_admin_session_ok',
    PASSWORD_HASH: 'c4_admin_password_hash',
    ADMIN_TOKEN: 'c4_admin_token',
    CRM_LEADS: 'c4_crm_leads_v1',
    PLACES_PROVIDER: 'c4_places_provider',
    PLACES_API_KEY: 'c4_places_api_key',
    PROSPECT_LAST_DATE: 'c4_prospector_last_search_date',
    PROSPECT_RESULTS: 'c4_prospector_results_v1',
    PROSPECT_META: 'c4_prospector_meta_v1',
  };

  const CRM_STATUSES = [
    { id: 'Novo', label: 'Novo', badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
    { id: 'Diagnóstico Agendado', label: 'Diagnóstico Agendado', badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    { id: 'Proposta Enviada', label: 'Proposta Enviada', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
    { id: 'Fechado', label: 'Fechado', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    { id: 'Perdido', label: 'Perdido', badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  ];

  const PROPOSAL_MODULES = [
    {
      id: 'auth',
      name: 'Autenticação & Permissões',
      checked: true,
      summary: 'Login seguro com controle de perfis (Administrador, Operacional, Financeiro) e trilha de auditoria por usuário.',
    },
    {
      id: 'dashboard',
      name: 'Dashboard Executivo',
      checked: true,
      summary: 'Painel gerencial em tempo real com KPIs operacionais, gráficos de faturamento, alertas de gargalo e filtros por período.',
    },
    {
      id: 'estoque',
      name: 'Controle de Estoque/Pedidos',
      checked: true,
      summary: 'Gestão completa de entradas, saídas, estoque mínimo, pedidos de venda/compra e histórico de movimentações sem planilhas.',
    },
    {
      id: 'relatorios',
      name: 'Relatórios PDF/Excel',
      checked: true,
      summary: 'Exportação instantânea de relatórios gerenciais, romaneios e fechamentos em PDF padronizado e planilhas Excel (.xlsx/.csv).',
    },
    {
      id: 'whatsapp',
      name: 'Integração WhatsApp/API',
      checked: false,
      summary: 'Disparo automático de notificações, status de pedidos, lembretes de cobrança ou links de acompanhamento via API oficial/webhook.',
    },
    {
      id: 'assinatura',
      name: 'Assinatura Digital',
      checked: false,
      summary: 'Coleta de aceite eletrônico em ordens de serviço, contratos ou comprovantes de entrega com registro de IP, data e hash.',
    },
    {
      id: 'hospedagem',
      name: 'Hospedagem & Backup Mensal',
      checked: true,
      summary: 'Infraestrutura cloud dedicada com SSL, monitoramento 24/7, backups diários automatizados e suporte técnico contínuo.',
    },
  ];

  // --------------------------------------------------------------------------
  // UTILITÁRIOS GERAIS
  // --------------------------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizePhoneBR(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.startsWith('55') ? digits : `55${digits}`;
  }

  function formatCurrencyBRL(value) {
    const num = Number(value) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function getLocalDateYYYYMMDD(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDateBR(isoDate) {
    if (!isoDate) return '—';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function showToast(message) {
    const toast = $('#admin-toast');
    const msg = $('#admin-toast-msg');
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.add('hidden'), 3200);
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // SHA-256 via Web Crypto API com fallback JS puro para ambientes não-HTTPS (file://)
  async function sha256Hex(text) {
    if (window.crypto && window.crypto.subtle) {
      const data = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    return sha256Fallback(text);
  }

  function sha256Fallback(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let result = '';
    const words = [];
    const asciiBitLength = ascii.length * 8;
    const hash = (sha256Fallback.h = sha256Fallback.h || []);
    const k = (sha256Fallback.k = sha256Fallback.k || []);
    let primeCounter = k.length;
    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while ((ascii.length % 64) - 56) ascii += '\x00';
    for (let i = 0; i < ascii.length; i++) {
      const j = ascii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;
    const hCopy = hash.slice(0, 8);
    for (let j = 0; j < words.length; ) {
      const w = words.slice(j, (j += 16));
      const oldHash = hCopy.slice(0);
      for (let i = 0; i < 64; i++) {
        const w15 = w[i - 15];
        const w2 = w[i - 2];
        const a = hCopy[0];
        const e = hCopy[4];
        const temp1 =
          hCopy[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & hCopy[5]) ^ (~e & hCopy[6])) +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  w[i - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0);
        const temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & hCopy[1]) ^ (a & hCopy[2]) ^ (hCopy[1] & hCopy[2]));
        hCopy.unshift((temp1 + temp2) | 0);
        hCopy[4] = (hCopy[4] + temp1) | 0;
        hCopy.pop();
      }
      for (let i = 0; i < 8; i++) hCopy[i] = (hCopy[i] + oldHash[i]) | 0;
    }
    for (let i = 0; i < 8; i++) {
      for (let j = 3; j + 1; j--) {
        const b = (hCopy[i] >> (j * 8)) & 255;
        result += (b < 16 ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }

  // --------------------------------------------------------------------------
  // 1. AUTENTICAÇÃO (SHA-256 + TOKEN)
  // --------------------------------------------------------------------------
  function initAuth() {
    const authGate = $('#auth-gate');
    const adminShell = $('#admin-shell');
    const loginForm = $('#login-form');
    const secretInput = $('#login-secret');
    const loginError = $('#login-error');
    const toggleVisBtn = $('#toggle-password-visibility');
    const logoutBtn = $('#logout-btn');

    function unlockPanel() {
      authGate.classList.add('hidden');
      adminShell.classList.remove('hidden');
      sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, '1');
      initAppModules();
      refreshIcons();
    }

    function lockPanel() {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      adminShell.classList.add('hidden');
      authGate.classList.remove('hidden');
      secretInput.value = '';
      loginError.classList.add('hidden');
    }

    if (sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) === '1') {
      unlockPanel();
    }

    toggleVisBtn?.addEventListener('click', () => {
      const isPass = secretInput.type === 'password';
      secretInput.type = isPass ? 'text' : 'password';
    });

    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.classList.add('hidden');
      const raw = secretInput.value.trim();
      if (!raw) return;

      const expectedHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH) || DEFAULT_PASSWORD_HASH;
      const customToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      const inputHash = await sha256Hex(raw);

      if (inputHash === expectedHash || (customToken && raw === customToken)) {
        unlockPanel();
      } else {
        loginError.classList.remove('hidden');
        secretInput.focus();
      }
    });

    logoutBtn?.addEventListener('click', lockPanel);
  }

  // --------------------------------------------------------------------------
  // NAVEGAÇÃO ENTRE ABAS
  // --------------------------------------------------------------------------
  let activeTab = 'crm';

  function switchTab(tabName) {
    activeTab = tabName;
    $$('.tab-panel').forEach((panel) => {
      panel.classList.toggle('hidden', panel.id !== `tab-${tabName}`);
    });
    $$('.tab-btn').forEach((btn) => {
      const isCurrent = btn.dataset.tab === tabName;
      btn.classList.toggle('bg-white', isCurrent);
      btn.classList.toggle('text-slate-900', isCurrent);
      btn.classList.toggle('shadow-sm', isCurrent);
      btn.classList.toggle('text-slate-600', !isCurrent);
    });
    refreshIcons();
  }

  // --------------------------------------------------------------------------
  // ABA 1: TRIAGEM COMERCIAL & CRM (JULIANA)
  // --------------------------------------------------------------------------
  let crmLeads = [];
  let crmViewMode = 'kanban'; // 'kanban' | 'table'
  let activeWaLead = null;

  function getDefaultLeads() {
    const today = getLocalDateYYYYMMDD();
    const tomorrow = getLocalDateYYYYMMDD(new Date(Date.now() + 86400000));
    const inTwoDays = getLocalDateYYYYMMDD(new Date(Date.now() + 2 * 86400000));
    return [
      {
        id: 'lead-101',
        name: 'Carlos Mendes',
        company: 'Vale Distribuidora de Bebidas',
        whatsapp: '(12) 99142-3310',
        pain: 'Controle de estoque em 4 planilhas separadas e perda de pedidos na rota.',
        origin: 'Site',
        followup: today,
        status: 'Novo',
      },
      {
        id: 'lead-102',
        name: 'Fernanda Rocha',
        company: 'Clínica FisioMov Taubaté',
        whatsapp: '(12) 98210-4455',
        pain: 'Agendamento manual no WhatsApp e falta de histórico financeiro por profissional.',
        origin: 'YouTube',
        followup: tomorrow,
        status: 'Diagnóstico Agendado',
      },
      {
        id: 'lead-103',
        name: 'Roberto Almeida',
        company: 'Almeida Autopeças SJC',
        whatsapp: '(12) 99788-1209',
        pain: 'Orçamentos lentos em Word/Excel e sem controle de margem por peça.',
        origin: 'Prospecção',
        followup: today,
        status: 'Proposta Enviada',
      },
      {
        id: 'lead-104',
        name: 'Juliano Costa',
        company: 'TransVale Logística',
        whatsapp: '(12) 98155-9080',
        pain: 'Comprovantes de entrega em papel e demora para faturar fretes.',
        origin: 'Parceiro',
        followup: inTwoDays,
        status: 'Fechado',
      },
    ];
  }

  function loadLeads() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CRM_LEADS);
      crmLeads = raw ? JSON.parse(raw) : getDefaultLeads();
      if (!raw) saveLeads();
    } catch {
      crmLeads = getDefaultLeads();
    }
  }

  function saveLeads() {
    localStorage.setItem(STORAGE_KEYS.CRM_LEADS, JSON.stringify(crmLeads));
  }

  function getFilteredLeads() {
    const query = ($('#crm-search')?.value || '').trim().toLowerCase();
    const origin = $('#crm-filter-origin')?.value || 'Todas';
    return crmLeads.filter((lead) => {
      const matchesOrigin = origin === 'Todas' || lead.origin === origin;
      const matchesQuery =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query) ||
        lead.pain.toLowerCase().includes(query);
      return matchesOrigin && matchesQuery;
    });
  }

  function updateCrmKpis() {
    $('#kpi-total').textContent = crmLeads.length;
    $('#kpi-novos').textContent = crmLeads.filter((l) => l.status === 'Novo').length;
    $('#kpi-diagnostico').textContent = crmLeads.filter((l) => l.status === 'Diagnóstico Agendado').length;
    $('#kpi-proposta').textContent = crmLeads.filter((l) => l.status === 'Proposta Enviada').length;
    $('#kpi-fechado').textContent = crmLeads.filter((l) => l.status === 'Fechado').length;
  }

  function isFollowupOverdue(dateStr) {
    if (!dateStr) return false;
    return dateStr < getLocalDateYYYYMMDD();
  }

  function renderCrm() {
    updateCrmKpis();
    const filtered = getFilteredLeads();
    renderKanban(filtered);
    renderTable(filtered);
    refreshIcons();
  }

  function renderKanban(leads) {
    const container = $('#crm-kanban-view');
    if (!container) return;

    container.innerHTML = CRM_STATUSES.map((col) => {
      const colLeads = leads.filter((l) => l.status === col.id);
      const cardsHtml = colLeads.length
        ? colLeads
            .map((lead) => {
              const overdue = isFollowupOverdue(lead.followup) && lead.status !== 'Fechado' && lead.status !== 'Perdido';
              return `
                <article
                  draggable="true"
                  data-lead-id="${escapeHtml(lead.id)}"
                  class="kanban-card bg-white border border-brand-border rounded-xl p-3.5 space-y-2.5 cursor-grab active:cursor-grabbing"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h4 class="text-xs font-bold text-slate-900 truncate">${escapeHtml(lead.company)}</h4>
                      <p class="text-[11px] text-brand-muted truncate">${escapeHtml(lead.name)}</p>
                    </div>
                    <span class="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono bg-brand-subtle border border-brand-border text-slate-600">
                      ${escapeHtml(lead.origin)}
                    </span>
                  </div>

                  <p class="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    ${escapeHtml(lead.pain)}
                  </p>

                  <div class="flex items-center justify-between text-[11px] pt-1">
                    <span class="font-mono ${overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}">
                      <i data-lucide="calendar" class="w-3 h-3 inline mr-0.5"></i>
                      ${formatDateBR(lead.followup)}${overdue ? ' (Atrasado)' : ''}
                    </span>
                    <span class="font-mono text-slate-500">${escapeHtml(lead.whatsapp)}</span>
                  </div>

                  <div class="pt-2 border-t border-brand-border flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      data-action="wa"
                      data-id="${escapeHtml(lead.id)}"
                      class="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition"
                      title="Abrir WhatsApp com script pronto"
                    >
                      <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      data-action="proposta"
                      data-id="${escapeHtml(lead.id)}"
                      class="px-2 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-brand-cyan border border-sky-200 text-[11px] font-semibold transition"
                      title="Gerar Proposta PDF para este lead"
                    >
                      <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                    </button>
                    <button
                      type="button"
                      data-action="edit"
                      data-id="${escapeHtml(lead.id)}"
                      class="px-2 py-1.5 rounded-lg bg-brand-subtle hover:bg-slate-200 text-slate-600 text-[11px] transition"
                      title="Editar lead"
                    >
                      <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </article>
              `;
            })
            .join('')
        : `<div class="text-center py-8 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl">Sem leads nesta etapa</div>`;

      return `
        <div class="kanban-col bg-brand-subtle/70 border border-brand-border rounded-xl p-3 flex flex-col gap-3" data-status="${escapeHtml(col.id)}">
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full ${col.dot}"></span>
              <h3 class="text-xs font-bold text-slate-800">${escapeHtml(col.label)}</h3>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-white border border-brand-border text-slate-600">
              ${colLeads.length}
            </span>
          </div>
          <div class="space-y-2.5 flex-1">
            ${cardsHtml}
          </div>
        </div>
      `;
    }).join('');

    bindKanbanDragAndDrop();
  }

  function renderTable(leads) {
    const tbody = $('#crm-table-body');
    if (!tbody) return;

    if (!leads.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-slate-400">Nenhum lead encontrado com os filtros atuais.</td></tr>`;
      return;
    }

    tbody.innerHTML = leads
      .map((lead) => {
        const statusObj = CRM_STATUSES.find((s) => s.id === lead.status) || CRM_STATUSES[0];
        return `
          <tr class="hover:bg-brand-subtle/60 transition">
            <td class="py-3 px-4">
              <p class="font-bold text-slate-900">${escapeHtml(lead.company)}</p>
              <p class="text-[11px] text-brand-muted">${escapeHtml(lead.name)}</p>
            </td>
            <td class="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">${escapeHtml(lead.whatsapp)}</td>
            <td class="py-3 px-4 max-w-xs text-slate-600">${escapeHtml(lead.pain)}</td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded-md text-[11px] font-mono bg-brand-subtle border border-brand-border text-slate-700">
                ${escapeHtml(lead.origin)}
              </span>
            </td>
            <td class="py-3 px-4 font-mono whitespace-nowrap">${formatDateBR(lead.followup)}</td>
            <td class="py-3 px-4">
              <select data-action="status-change" data-id="${escapeHtml(lead.id)}"
                class="px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusObj.badge} outline-none cursor-pointer">
                ${CRM_STATUSES.map(
                  (s) => `<option value="${escapeHtml(s.id)}" ${s.id === lead.status ? 'selected' : ''}>${escapeHtml(s.label)}</option>`
                ).join('')}
              </select>
            </td>
            <td class="py-3 px-4 text-right whitespace-nowrap">
              <div class="inline-flex items-center gap-1.5">
                <button type="button" data-action="wa" data-id="${escapeHtml(lead.id)}"
                  class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold">
                  <i data-lucide="message-circle" class="w-3.5 h-3.5"></i> WhatsApp
                </button>
                <button type="button" data-action="proposta" data-id="${escapeHtml(lead.id)}"
                  class="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-brand-cyan border border-sky-200" title="Gerar Proposta">
                  <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                </button>
                <button type="button" data-action="edit" data-id="${escapeHtml(lead.id)}"
                  class="p-1.5 rounded-lg bg-brand-subtle hover:bg-slate-200 text-slate-600" title="Editar">
                  <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                </button>
                <button type="button" data-action="delete" data-id="${escapeHtml(lead.id)}"
                  class="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600" title="Excluir">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  function bindKanbanDragAndDrop() {
    let draggedId = null;
    $$('.kanban-card').forEach((card) => {
      card.addEventListener('dragstart', () => {
        draggedId = card.dataset.leadId;
        card.classList.add('opacity-50');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('opacity-50');
        $$('.kanban-col').forEach((c) => c.classList.remove('kanban-drop-active'));
      });
    });

    $$('.kanban-col').forEach((col) => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('kanban-drop-active');
      });
      col.addEventListener('dragleave', () => {
        col.classList.remove('kanban-drop-active');
      });
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('kanban-drop-active');
        const newStatus = col.dataset.status;
        if (!draggedId || !newStatus) return;
        const lead = crmLeads.find((l) => l.id === draggedId);
        if (lead && lead.status !== newStatus) {
          lead.status = newStatus;
          saveLeads();
          renderCrm();
          showToast(`Lead movido para "${newStatus}".`);
        }
      });
    });
  }

  function buildWhatsAppScript(lead, templateKey) {
    const firstName = (lead.name || '').split(' ')[0] || 'tudo bem';
    const company = lead.company || 'sua empresa';
    const pain = lead.pain ? `sobre "${lead.pain.replace(/\.$/, '')}"` : 'sobre a automação dos controles internos';

    const templates = {
      primeiro_contato: `Olá ${firstName}, tudo bem? Aqui é a Juliana da Control 4 Sistemas (Taubaté/SP). Recebi seu contato referente à ${company} e vi o ponto ${pain}. Consegue fazer uma call rápida de 15 min esta semana para eu te mostrar como substituímos essas planilhas por um sistema sob medida?`,
      lembrete_diagnostico: `Oi ${firstName}, tudo bem? Passando para confirmar nosso diagnóstico rápido da ${company} agendado para ${formatDateBR(lead.followup)}. Vou te mostrar exemplos práticos de painéis para resolver a questão ${pain}. Até lá!`,
      followup_proposta: `Olá ${firstName}, tudo bem? Aqui é a Juliana da Control 4 Sistemas. Conseguiu avaliar a proposta técnica que enviei para a ${company}? Se tiver alguma dúvida sobre o escopo ou prazo, fico à disposição para ajustarmos juntos!`,
      reativacao: `Olá ${firstName}, tudo bem? Faz um tempinho que conversamos sobre o sistema da ${company}. Como ficou o controle ${pain} por aí? Se fizer sentido retomar essa melhoria agora, me avise que te envio uma atualização rápida.`,
    };
    return templates[templateKey] || templates.primeiro_contato;
  }

  function openWaScriptModal(lead) {
    activeWaLead = lead;
    $('#wa-modal-subtitle').textContent = `${lead.name} • ${lead.company} (${lead.whatsapp})`;

    const statusMap = {
      Novo: 'primeiro_contato',
      'Diagnóstico Agendado': 'lembrete_diagnostico',
      'Proposta Enviada': 'followup_proposta',
      Perdido: 'reativacao',
      Fechado: 'followup_proposta',
    };
    const defaultTpl = statusMap[lead.status] || 'primeiro_contato';
    const select = $('#wa-script-template');
    const textarea = $('#wa-script-text');
    select.value = defaultTpl;
    textarea.value = buildWhatsAppScript(lead, defaultTpl);
    updateWaLink();
    $('#wa-script-modal').classList.remove('hidden');
  }

  function updateWaLink() {
    if (!activeWaLead) return;
    const phone = sanitizePhoneBR(activeWaLead.whatsapp);
    const text = encodeURIComponent($('#wa-script-text').value.trim());
    $('#wa-open-link').href = `https://wa.me/${phone}?text=${text}`;
  }

  function openLeadModal(lead = null) {
    $('#lead-modal-title').textContent = lead ? 'Editar Lead' : 'Novo Lead';
    $('#lead-id').value = lead?.id || '';
    $('#lead-name').value = lead?.name || '';
    $('#lead-company').value = lead?.company || '';
    $('#lead-whatsapp').value = lead?.whatsapp || '';
    $('#lead-origin').value = lead?.origin || 'Site';
    $('#lead-followup').value = lead?.followup || getLocalDateYYYYMMDD();
    $('#lead-status').value = lead?.status || 'Novo';
    $('#lead-pain').value = lead?.pain || '';
    $('#lead-modal').classList.remove('hidden');
  }

  function initCrm() {
    loadLeads();
    renderCrm();

    $('#crm-search')?.addEventListener('input', renderCrm);
    $('#crm-filter-origin')?.addEventListener('change', renderCrm);

    $('#view-kanban-btn')?.addEventListener('click', () => {
      crmViewMode = 'kanban';
      $('#crm-kanban-view').classList.remove('hidden');
      $('#crm-table-view').classList.add('hidden');
      $('#view-kanban-btn').classList.add('bg-white', 'text-slate-900', 'shadow-sm');
      $('#view-table-btn').classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    });

    $('#view-table-btn')?.addEventListener('click', () => {
      crmViewMode = 'table';
      $('#crm-table-view').classList.remove('hidden');
      $('#crm-kanban-view').classList.add('hidden');
      $('#view-table-btn').classList.add('bg-white', 'text-slate-900', 'shadow-sm');
      $('#view-kanban-btn').classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    });

    $('#new-lead-btn')?.addEventListener('click', () => openLeadModal(null));
    $$('.close-lead-modal').forEach((b) => b.addEventListener('click', () => $('#lead-modal').classList.add('hidden')));
    $$('.close-wa-modal').forEach((b) => b.addEventListener('click', () => $('#wa-script-modal').classList.add('hidden')));

    $('#lead-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = $('#lead-id').value;
      const payload = {
        id: id || `lead-${Date.now()}`,
        name: $('#lead-name').value.trim(),
        company: $('#lead-company').value.trim(),
        whatsapp: $('#lead-whatsapp').value.trim(),
        origin: $('#lead-origin').value,
        followup: $('#lead-followup').value,
        status: $('#lead-status').value,
        pain: $('#lead-pain').value.trim(),
      };

      if (id) {
        const idx = crmLeads.findIndex((l) => l.id === id);
        if (idx !== -1) crmLeads[idx] = payload;
        showToast('Lead atualizado com sucesso.');
      } else {
        crmLeads.unshift(payload);
        showToast('Novo lead adicionado ao CRM.');
      }
      saveLeads();
      renderCrm();
      $('#lead-modal').classList.add('hidden');
    });

    // Delegação de eventos no Kanban e Tabela
    $('#tab-crm')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      const lead = crmLeads.find((l) => l.id === id);
      if (!lead) return;

      if (action === 'wa') {
        openWaScriptModal(lead);
      } else if (action === 'edit') {
        openLeadModal(lead);
      } else if (action === 'delete') {
        if (confirm(`Remover o lead "${lead.company}" do CRM?`)) {
          crmLeads = crmLeads.filter((l) => l.id !== id);
          saveLeads();
          renderCrm();
          showToast('Lead removido.');
        }
      } else if (action === 'proposta') {
        $('#prop-client-name').value = lead.name;
        $('#prop-company').value = lead.company;
        if (lead.pain) {
          $('#prop-notes').value = `Objetivo principal: ${lead.pain}`;
        }
        renderProposalPreview();
        switchTab('proposta');
        showToast(`Dados de ${lead.company} carregados no Gerador de Proposta.`);
      }
    });

    $('#tab-crm')?.addEventListener('change', (e) => {
      const sel = e.target.closest('select[data-action="status-change"]');
      if (!sel) return;
      const lead = crmLeads.find((l) => l.id === sel.dataset.id);
      if (lead) {
        lead.status = sel.value;
        saveLeads();
        renderCrm();
        showToast(`Status atualizado para "${sel.value}".`);
      }
    });

    $('#wa-script-template')?.addEventListener('change', (e) => {
      if (!activeWaLead) return;
      $('#wa-script-text').value = buildWhatsAppScript(activeWaLead, e.target.value);
      updateWaLink();
    });

    $('#wa-script-text')?.addEventListener('input', updateWaLink);
  }

  // --------------------------------------------------------------------------
  // ABA 2: GERADOR AUTOMÁTICO DE ESCOPO E PROPOSTA COMERCIAL (PDF EM 10s)
  // --------------------------------------------------------------------------
  function renderProposalModulesCheckboxes() {
    const container = $('#prop-modules-list');
    if (!container) return;
    container.innerHTML = PROPOSAL_MODULES.map(
      (mod) => `
      <label class="flex items-start gap-2.5 p-2.5 rounded-lg border border-brand-border bg-brand-subtle/60 hover:bg-brand-subtle cursor-pointer transition">
        <input type="checkbox" data-mod-id="${mod.id}" ${mod.checked ? 'checked' : ''}
          class="prop-mod-checkbox mt-0.5 rounded border-slate-300 text-brand-cyan focus:ring-brand-cyan" />
        <div class="min-w-0">
          <p class="text-xs font-semibold text-slate-900">${escapeHtml(mod.name)}</p>
          <p class="text-[11px] text-brand-muted leading-snug">${escapeHtml(mod.summary)}</p>
        </div>
      </label>
    `
    ).join('');
  }

  function renderProposalPreview() {
    const docEl = $('#proposal-pdf-document');
    if (!docEl) return;

    const clientName = $('#prop-client-name')?.value.trim() || 'Cliente';
    const company = $('#prop-company')?.value.trim() || 'Empresa Contratante';
    const timeline = $('#prop-timeline')?.value.trim() || '30 dias úteis';
    const baseValue = Number($('#prop-base-value')?.value) || 0;
    const monthlyValue = Number($('#prop-monthly-value')?.value) || 0;
    const validityDays = Math.max(1, Number($('#prop-validity-days')?.value) || 10);
    const notes = $('#prop-notes')?.value.trim() || '';

    const today = new Date();
    const validUntil = new Date(today.getTime() + validityDays * 86400000);
    const todayStr = today.toLocaleDateString('pt-BR');
    const validUntilStr = validUntil.toLocaleDateString('pt-BR');

    const selectedIds = $$('.prop-mod-checkbox:checked').map((cb) => cb.dataset.modId);
    const selectedModules = PROPOSAL_MODULES.filter((m) => selectedIds.includes(m.id));

    const entryValue = baseValue * 0.5;
    const deliveryValue = baseValue * 0.5;

    docEl.innerHTML = `
      <!-- Cabeçalho Corporativo -->
      <div class="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-6">
        <div>
          <div class="flex items-center gap-2.5 mb-1.5">
            <div class="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">C4</div>
            <span class="font-mono font-bold text-lg tracking-tight text-slate-900">CONTROL 4 // SISTEMAS</span>
          </div>
          <p class="text-[11px] text-slate-600">Desenvolvimento de Sistemas Web &amp; Automação Sob Medida</p>
          <p class="text-[11px] text-slate-500 font-mono">Taubaté / Vale do Paraíba, SP • contato@control4sistemas.com.br • (12) 98860-0746</p>
        </div>
        <div class="text-right">
          <span class="inline-block px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
            Proposta Comercial
          </span>
          <p class="font-mono text-xs font-bold text-slate-800 mt-1.5">PROP-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}</p>
          <p class="text-[11px] text-slate-500">Emissão: ${todayStr}</p>
          <p class="text-[11px] font-semibold text-sky-700">Validade: ${validUntilStr} (${validityDays} dias)</p>
        </div>
      </div>

      <!-- Dados do Contratante -->
      <div class="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-xs">
        <div>
          <p class="text-[10px] font-mono uppercase text-slate-500">Empresa Contratante</p>
          <p class="font-bold text-slate-900 mt-0.5">${escapeHtml(company)}</p>
        </div>
        <div>
          <p class="text-[10px] font-mono uppercase text-slate-500">Aos Cuidados de</p>
          <p class="font-bold text-slate-900 mt-0.5">${escapeHtml(clientName)}</p>
        </div>
        <div>
          <p class="text-[10px] font-mono uppercase text-slate-500">Prazo Estimado</p>
          <p class="font-bold text-slate-900 mt-0.5">${escapeHtml(timeline)}</p>
        </div>
      </div>

      ${
        notes
          ? `<div class="mb-6">
               <h4 class="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">1. Objetivo &amp; Contexto Operacional</h4>
               <p class="text-xs text-slate-700 leading-relaxed">${escapeHtml(notes)}</p>
             </div>`
          : ''
      }

      <!-- Detalhamento Técnico dos Módulos -->
      <div class="mb-6">
        <h4 class="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          2. Escopo Técnico &amp; Módulos Inclusos (${selectedModules.length})
        </h4>
        <div class="space-y-2">
          ${
            selectedModules.length
              ? selectedModules
                  .map(
                    (m, idx) => `
                <div class="border border-slate-200 rounded-lg p-3">
                  <p class="text-xs font-bold text-slate-900">${idx + 1}. ${escapeHtml(m.name)}</p>
                  <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">${escapeHtml(m.summary)}</p>
                </div>
              `
                  )
                  .join('')
              : '<p class="text-xs text-slate-400 italic">Selecione ao menos um módulo no formulário ao lado.</p>'
          }
        </div>
      </div>

      <!-- Cronograma Macro -->
      <div class="mb-6">
        <h4 class="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          3. Cronograma de Entrega (${escapeHtml(timeline)})
        </h4>
        <div class="grid grid-cols-3 gap-3 text-[11px]">
          <div class="border border-slate-200 rounded-lg p-3 bg-slate-50/70">
            <p class="font-mono font-bold text-sky-700">FASE 01 • IMERSÃO</p>
            <p class="font-semibold text-slate-900 mt-0.5">Arquitetura &amp; Protótipo</p>
            <p class="text-slate-600 mt-1">Mapeamento de fluxos, modelagem de banco e validação das telas.</p>
          </div>
          <div class="border border-slate-200 rounded-lg p-3 bg-slate-50/70">
            <p class="font-mono font-bold text-sky-700">FASE 02 • CONSTRUÇÃO</p>
            <p class="font-semibold text-slate-900 mt-0.5">Desenvolvimento &amp; APIs</p>
            <p class="text-slate-600 mt-1">Implementação dos módulos contratados com entregas parciais semanais.</p>
          </div>
          <div class="border border-slate-200 rounded-lg p-3 bg-slate-50/70">
            <p class="font-mono font-bold text-emerald-700">FASE 03 • GO-LIVE</p>
            <p class="font-semibold text-slate-900 mt-0.5">Testes &amp; Treinamento</p>
            <p class="text-slate-600 mt-1">Homologação assistida, importação inicial e treinamento da equipe.</p>
          </div>
        </div>
      </div>

      <!-- Condições Comerciais -->
      <div class="border-t-2 border-slate-200 pt-5 mb-6">
        <h4 class="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          4. Investimento &amp; Condições Comerciais
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="border border-slate-900 rounded-lg p-4 bg-slate-900 text-white">
            <p class="text-[10px] font-mono uppercase text-slate-300">Desenvolvimento Sob Medida</p>
            <p class="text-xl font-bold font-mono mt-1">${formatCurrencyBRL(baseValue)}</p>
            <p class="text-[11px] text-slate-300 mt-2">
              • <strong>50% Entrada (${formatCurrencyBRL(entryValue)})</strong> na aprovação<br/>
              • <strong>50% Entrega (${formatCurrencyBRL(deliveryValue)})</strong> no Go-Live
            </p>
          </div>
          <div class="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <p class="text-[10px] font-mono uppercase text-slate-500">Plano de Sustentação Mensal</p>
            <p class="text-xl font-bold font-mono text-slate-900 mt-1">${formatCurrencyBRL(monthlyValue)}<span class="text-xs font-normal text-slate-500">/mês</span></p>
            <p class="text-[11px] text-slate-600 mt-2">
              Inclui servidor cloud, certificado SSL, backups diários automatizados, atualizações de segurança e suporte técnico.
            </p>
          </div>
        </div>
      </div>

      <!-- Rodapé / Aceite -->
      <div class="pt-4 border-t border-slate-200 flex items-end justify-between text-[11px] text-slate-500">
        <div>
          <p class="font-semibold text-slate-800">Control 4 Sistemas — Engenharia de Software Sob Medida</p>
          <p>Proposta válida até ${validUntilStr}. Valores sujeitos a revisão após o vencimento.</p>
        </div>
        <div class="text-right">
          <div class="w-44 border-b border-slate-400 mb-1"></div>
          <p class="font-mono text-[10px]">Aceite: ${escapeHtml(company)}</p>
        </div>
      </div>
    `;
  }

  function initProposalGenerator() {
    renderProposalModulesCheckboxes();
    renderProposalPreview();

    const inputs = [
      '#prop-client-name',
      '#prop-company',
      '#prop-timeline',
      '#prop-base-value',
      '#prop-monthly-value',
      '#prop-validity-days',
      '#prop-notes',
    ];
    inputs.forEach((sel) => $(sel)?.addEventListener('input', renderProposalPreview));
    $('#prop-modules-list')?.addEventListener('change', renderProposalPreview);

    $('#generate-pdf-btn')?.addEventListener('click', async () => {
      const element = $('#proposal-pdf-document');
      if (!element) return;
      if (typeof window.html2pdf !== 'function') {
        alert('Biblioteca html2pdf.js não carregada. Verifique sua conexão com a internet.');
        return;
      }

      const btn = $('#generate-pdf-btn');
      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Gerando PDF...';
      refreshIcons();

      const companySlug = ($('#prop-company')?.value || 'cliente')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Proposta-Control4-${companySlug || 'cliente'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      try {
        await window.html2pdf().set(opt).from(element).save();
        showToast('Proposta PDF gerada e baixada!');
      } catch (err) {
        console.error(err);
        showToast('Erro ao gerar o PDF. Tente novamente.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
        refreshIcons();
      }
    });
  }

  // --------------------------------------------------------------------------
  // ABA 3: PROSPECÇÃO ATIVA CIRÚRGICA (TRAVA DIÁRIA + GOOGLE PLACES / SERPER)
  // --------------------------------------------------------------------------
  let prospectorTimerInterval = null;
  let mappedProspects = [];

  // Abstração preparada para migração futura para backend (ex: /api/prospector)
  const ProspectorStorage = {
    getLastSearchDate() {
      return localStorage.getItem(STORAGE_KEYS.PROSPECT_LAST_DATE) || '';
    },
    setLastSearchDate(yyyyMmDd) {
      localStorage.setItem(STORAGE_KEYS.PROSPECT_LAST_DATE, yyyyMmDd);
    },
    getSavedResults() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROSPECT_RESULTS) || '[]');
      } catch {
        return [];
      }
    },
    saveResults(list, meta) {
      localStorage.setItem(STORAGE_KEYS.PROSPECT_RESULTS, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEYS.PROSPECT_META, JSON.stringify(meta));
    },
    getMeta() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROSPECT_META) || '{}');
      } catch {
        return {};
      }
    },
  };

  function isProspectorLockedToday() {
    const today = getLocalDateYYYYMMDD();
    return ProspectorStorage.getLastSearchDate() === today;
  }

  function updateDailyLockUI() {
    const btn = $('#run-prospect-btn');
    const btnText = $('#run-prospect-btn-text');
    const countdownEl = $('#daily-lock-countdown');
    const labelEl = $('#daily-lock-label');
    if (!btn || !countdownEl) return;

    const locked = isProspectorLockedToday();
    btn.disabled = locked;

    if (!locked) {
      labelEl.textContent = 'Janela Diária';
      countdownEl.textContent = 'Disponível agora (0/1 hoje)';
      countdownEl.classList.remove('text-amber-600');
      countdownEl.classList.add('text-emerald-600');
      btnText.textContent = 'Atualizar / Mapear 20 Empresas';
      return;
    }

    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const diffMs = Math.max(0, nextMidnight - now);
    const hrs = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
    const mins = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
    const secs = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');

    labelEl.textContent = 'Trava Diária Ativa (Próxima Janela)';
    countdownEl.textContent = `${hrs}:${mins}:${secs}`;
    countdownEl.classList.remove('text-emerald-600');
    countdownEl.classList.add('text-amber-600');
    btnText.textContent = `Bloqueado até amanhã (${hrs}:${mins}:${secs})`;
  }

  function classifyDigitalPresence(website) {
    if (!website || !String(website).trim()) {
      return { label: 'Sem Site', rank: 0, badge: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    const url = String(website).toLowerCase();
    const weakSignals = ['facebook.com', 'instagram.com', 'linktr.ee', 'blogspot', 'wixsite', 'http://', 'wa.me'];
    if (weakSignals.some((sig) => url.includes(sig))) {
      return { label: 'Site Desatualizado', rank: 1, badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Site Básico', rank: 2, badge: 'bg-slate-100 text-slate-600 border-slate-200' };
  }

  async function fetchRealPlaces(niche, city) {
    const provider = localStorage.getItem(STORAGE_KEYS.PLACES_PROVIDER) || 'serper';
    const apiKey = (localStorage.getItem(STORAGE_KEYS.PLACES_API_KEY) || '').trim();
    if (!apiKey) return null;

    const query = `${niche} em ${city}`;

    if (provider === 'serper') {
      const resp = await fetch('https://google.serper.dev/places', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query, gl: 'br', hl: 'pt-br', num: 20 }),
      });
      if (!resp.ok) throw new Error(`Serper API HTTP ${resp.status}`);
      const data = await resp.json();
      const places = Array.isArray(data.places) ? data.places : [];
      return places.map((p, idx) => ({
        id: `serper-${Date.now()}-${idx}`,
        name: p.title || 'Empresa Local',
        address: p.address || city,
        phone: p.phoneNumber || '(12) 99999-0000',
        website: p.website || '',
        niche,
        city,
        contacted: false,
      }));
    }

    // Google Places API (New Text Search)
    const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri',
      },
      body: JSON.stringify({ textQuery: query, languageCode: 'pt-BR', maxResultCount: 20 }),
    });
    if (!resp.ok) throw new Error(`Google Places HTTP ${resp.status}`);
    const data = await resp.json();
    const places = Array.isArray(data.places) ? data.places : [];
    return places.map((p, idx) => ({
      id: `gplaces-${Date.now()}-${idx}`,
      name: p.displayName?.text || 'Empresa Local',
      address: p.formattedAddress || city,
      phone: p.nationalPhoneNumber || '(12) 99999-0000',
      website: p.websiteUri || '',
      niche,
      city,
      contacted: false,
    }));
  }

  function generateRealisticFallback(niche, city) {
    const cityShort = city.split(',')[0].trim();
    const streets = [
      'Av. Independência',
      'Rua XV de Novembro',
      'Av. Charles Schnneider',
      'Av. Marechal Deodoro',
      'Rua Dr. Souza Alves',
      'Av. Itália',
      'Av. do Povo',
      'Rua Voluntário Benedito Sérgio',
      'Av. Bandeirantes',
      'Av. John Boyd Dunlop',
    ];
    const prefixes = {
      Distribuidoras: ['Vale Sul', 'Serra', 'Mantova', 'Líder', 'Bandeirantes', 'Nova Era', 'Central', 'Express', 'Aliança', 'União'],
      Autopeças: ['Auto Center', 'Império', 'Vale Peças', 'Mecânica & Peças', 'São Cristóvão', 'Rota 116', 'Dutra', 'Real', 'Master', 'ProCar'],
      'Clínicas e Estúdios': ['Espaço Vida', 'Clínica Integra', 'Studio Corpo', 'Essence', 'Movimento', 'Saúde Plena', 'Vitalis', 'Equilíbrio', 'Bem Estar', 'Harmonia'],
      Transportadoras: ['TransVale', 'Rápido Dutra', 'Logística', 'Expresso', 'Cargo', 'FreteSul', 'Rota Certa', 'Rodovale', 'Viação', 'Carga Pesada'],
      'Oficinas e Manutenção': ['Oficina Precision', 'TecnoCar', 'Diesel Vale', 'Auto Elétrica', 'Retífica', 'Box 4', 'Garage', 'Manutec', 'Solução Auto', 'Torque'],
      Construtoras: ['Engenharia', 'Construtora Vale', 'Obra Prima', 'Alvenaria & Cia', 'Estrutura', 'Horizonte', 'Base Forte', 'Concreto', 'Pilar', 'Habitar'],
    };

    const listPrefixes = prefixes[niche] || prefixes.Distribuidoras;
    const suffixes = ['Ltda', 'Comércio', 'Serviços', 'Regional', 'do Vale', 'Soluções', 'Brasil', 'Grupo', 'Especializada', 'Pro'];

    const items = [];
    for (let i = 0; i < 20; i++) {
      const prefix = listPrefixes[i % listPrefixes.length];
      const suffix = suffixes[(i * 3) % suffixes.length];
      const name = i < 10 ? `${prefix} ${niche.split(' ')[0]} ${cityShort}` : `${prefix} ${suffix} ${cityShort}`;
      const street = streets[i % streets.length];
      const num = 120 + i * 47;
      const phoneMid = 98100 + ((i * 137) % 899);
      const phoneEnd = 1000 + ((i * 731) % 8999);
      // 14 sem site, 4 site desatualizado, 2 site básico
      let website = '';
      if (i >= 14 && i < 18) website = `https://instagram.com/${prefix.toLowerCase().replace(/\s+/g, '')}`;
      if (i >= 18) website = `https://${prefix.toLowerCase().replace(/\s+/g, '')}.com.br`;

      items.push({
        id: `sim-${Date.now()}-${i}`,
        name,
        address: `${street}, ${num} - Centro, ${city}`,
        phone: `(12) ${phoneMid}-${phoneEnd}`,
        website,
        niche,
        city,
        contacted: false,
      });
    }
    return items;
  }

  function prioritizeAndSlice20(rawList) {
    return rawList
      .map((item) => ({
        ...item,
        presence: classifyDigitalPresence(item.website),
      }))
      .sort((a, b) => a.presence.rank - b.presence.rank)
      .slice(0, 20);
  }

  function renderProspectList() {
    const container = $('#prospect-list-container');
    const countBadge = $('#prospect-count-badge');
    const modeBadge = $('#prospector-mode-badge');
    if (!container) return;

    const meta = ProspectorStorage.getMeta();
    countBadge.textContent = `${mappedProspects.length} / 20`;

    if (meta.mode === 'real') {
      modeBadge.textContent = `API Real (${meta.provider || 'Places'})`;
      modeBadge.className = 'px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else {
      modeBadge.textContent = 'Modo Simulado (Configure API Key em Configurações)';
      modeBadge.className = 'px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200';
    }

    if (!mappedProspects.length) {
      container.innerHTML = `
        <div class="p-10 text-center space-y-2">
          <p class="text-sm font-semibold text-slate-700">Nenhuma empresa mapeada hoje ainda.</p>
          <p class="text-xs text-brand-muted">Selecione o segmento, a cidade e clique em <strong>"Atualizar / Mapear 20 Empresas"</strong>.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = mappedProspects
      .map((emp, idx) => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${emp.name} ${emp.address}`)}`;
        const phoneDigits = sanitizePhoneBR(emp.phone);
        const waMessage = `Olá, tudo bem? Aqui é a Juliana da Control 4 Sistemas (Taubaté/SP). Vi o trabalho da ${emp.name} na região e notei que vocês ainda não têm um portal web integrado. Ajudamos empresas do setor de ${emp.niche} a substituir planilhas e controles manuais por sistemas simples sob medida. Topa um diagnóstico gratuito de 15 min esta semana para eu te mostrar como funciona?`;
        const waUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(waMessage)}`;

        return `
          <div class="p-4 sm:px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-brand-subtle/50 transition">
            <div class="space-y-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-mono text-[11px] font-bold text-slate-400">#${String(idx + 1).padStart(2, '0')}</span>
                <h4 class="text-sm font-bold text-slate-900">${escapeHtml(emp.name)}</h4>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${emp.presence.badge}">
                  ${escapeHtml(emp.presence.label)}
                </span>
                ${
                  emp.contacted
                    ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Abordagem Enviada</span>'
                    : ''
                }
              </div>
              <p class="text-xs text-brand-muted flex items-center gap-1.5">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 shrink-0 text-slate-400"></i>
                <span class="truncate">${escapeHtml(emp.address)}</span>
              </p>
              <p class="text-xs font-mono text-slate-700 flex items-center gap-1.5">
                <i data-lucide="phone" class="w-3.5 h-3.5 shrink-0 text-slate-400"></i>
                ${escapeHtml(emp.phone)}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-border bg-white hover:bg-brand-subtle text-xs font-semibold text-slate-700 transition">
                <i data-lucide="map" class="w-3.5 h-3.5 text-slate-500"></i>
                Google Maps
              </a>
              <button type="button" data-prospect-action="to-crm" data-prospect-id="${escapeHtml(emp.id)}"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-xs font-semibold text-brand-cyan transition">
                <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
                + CRM
              </button>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer"
                data-prospect-action="mark-contacted" data-prospect-id="${escapeHtml(emp.id)}"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-emerald hover:bg-emerald-600 text-white text-xs font-semibold transition shadow-sm">
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                Enviar Abordagem (Diagnóstico 15 min)
              </a>
            </div>
          </div>
        `;
      })
      .join('');

    refreshIcons();
  }

  function initProspector() {
    mappedProspects = ProspectorStorage.getSavedResults();
    renderProspectList();
    updateDailyLockUI();

    clearInterval(prospectorTimerInterval);
    prospectorTimerInterval = setInterval(updateDailyLockUI, 1000);

    $('#run-prospect-btn')?.addEventListener('click', async () => {
      if (isProspectorLockedToday()) {
        showToast('Trava diária ativa: aguarde a próxima janela.');
        return;
      }

      const niche = $('#prospect-niche').value;
      const city = $('#prospect-city').value;
      const btn = $('#run-prospect-btn');
      btn.disabled = true;
      $('#run-prospect-btn-text').textContent = 'Mapeando 20 empresas...';

      let mode = 'simulado';
      let rawResults = null;
      const provider = localStorage.getItem(STORAGE_KEYS.PLACES_PROVIDER) || 'serper';

      try {
        rawResults = await fetchRealPlaces(niche, city);
        if (rawResults && rawResults.length > 0) {
          mode = 'real';
        }
      } catch (err) {
        console.warn('Falha na API real, usando fallback realista:', err);
        showToast('API externa indisponível/CORS; usando dados simulados locais.');
      }

      if (!rawResults || rawResults.length === 0) {
        rawResults = generateRealisticFallback(niche, city);
        mode = 'simulado';
      }

      mappedProspects = prioritizeAndSlice20(rawResults);
      const today = getLocalDateYYYYMMDD();
      ProspectorStorage.setLastSearchDate(today);
      ProspectorStorage.saveResults(mappedProspects, { mode, provider, niche, city, date: today });

      renderProspectList();
      updateDailyLockUI();
      showToast(`20 empresas mapeadas em ${city} (${niche}). Trava diária ativada.`);
    });

    $('#prospect-list-container')?.addEventListener('click', (e) => {
      const target = e.target.closest('[data-prospect-action]');
      if (!target) return;
      const action = target.dataset.prospectAction;
      const id = target.dataset.prospectId;
      const emp = mappedProspects.find((p) => p.id === id);
      if (!emp) return;

      if (action === 'mark-contacted') {
        emp.contacted = true;
        ProspectorStorage.saveResults(mappedProspects, ProspectorStorage.getMeta());
        renderProspectList();
      } else if (action === 'to-crm') {
        const exists = crmLeads.some((l) => l.company.toLowerCase() === emp.name.toLowerCase());
        if (exists) {
          showToast(`"${emp.name}" já está no CRM.`);
          return;
        }
        crmLeads.unshift({
          id: `lead-${Date.now()}`,
          name: 'Responsável / Diretoria',
          company: emp.name,
          whatsapp: emp.phone,
          pain: `${emp.presence.label} — Prospecção ativa (${emp.niche} em ${emp.city}).`,
          origin: 'Prospecção',
          followup: getLocalDateYYYYMMDD(),
          status: 'Novo',
        });
        saveLeads();
        renderCrm();
        showToast(`"${emp.name}" enviada para a Aba 1 (CRM)!`);
      }
    });
  }

  // --------------------------------------------------------------------------
  // CONFIGURAÇÕES (API KEYS & ALTERAÇÃO DE SENHA SHA-256)
  // --------------------------------------------------------------------------
  function initSettingsModal() {
    const modal = $('#settings-modal');
    $('#open-settings-btn')?.addEventListener('click', () => {
      $('#cfg-places-provider').value = localStorage.getItem(STORAGE_KEYS.PLACES_PROVIDER) || 'serper';
      $('#cfg-places-apikey').value = localStorage.getItem(STORAGE_KEYS.PLACES_API_KEY) || '';
      $('#cfg-new-password').value = '';
      modal.classList.remove('hidden');
    });

    $$('.close-settings-modal').forEach((b) => b.addEventListener('click', () => modal.classList.add('hidden')));

    $('#settings-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      localStorage.setItem(STORAGE_KEYS.PLACES_PROVIDER, $('#cfg-places-provider').value);
      localStorage.setItem(STORAGE_KEYS.PLACES_API_KEY, $('#cfg-places-apikey').value.trim());

      const newPass = $('#cfg-new-password').value.trim();
      if (newPass) {
        const newHash = await sha256Hex(newPass);
        localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, newHash);
      }

      modal.classList.add('hidden');
      showToast('Configurações salvas com sucesso.');
    });
  }

  // --------------------------------------------------------------------------
  // INICIALIZAÇÃO DO PAINEL
  // --------------------------------------------------------------------------
  let modulesInitialized = false;

  function initAppModules() {
    if (modulesInitialized) return;
    modulesInitialized = true;

    $$('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    initCrm();
    initProposalGenerator();
    initProspector();
    initSettingsModal();
    switchTab('crm');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    refreshIcons();
  });
})();
