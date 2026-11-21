/**
 * Control 4 Sistemas — Frontend Controller
 * - Ícones Lucide
 * - Menu mobile
 * - Demonstração interativa de CRUD (Criar, Buscar/Filtrar, Editar Status, Excluir)
 * - Máscara de telefone e envio de orçamento para WhatsApp da Juliana (+55 12 98860-0746)
 */

(function () {
  'use strict';

  // WhatsApp oficial para orçamentos: Juliana +55 12 98860-0746
  const WHATSAPP_BUDGET_NUMBER = '5512988600746';
  const CORPORATE_EMAIL = 'contato@control4sistemas.com.br';

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -------------------------------------------------------------------------
   * 1. MENU MOBILE
   * ------------------------------------------------------------------------- */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileMenu(forceClose = false) {
    if (!mobileMenu || !mobileMenuBtn) return;
    const isHidden = mobileMenu.classList.contains('hidden');
    const shouldOpen = forceClose ? false : isHidden;

    mobileMenu.classList.toggle('hidden', !shouldOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(shouldOpen));

    if (iconOpen && iconClose) {
      iconOpen.classList.toggle('hidden', shouldOpen);
      iconClose.classList.toggle('hidden', !shouldOpen);
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());
  }

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMobileMenu(true));
  });

  /* -------------------------------------------------------------------------
   * 2. DEMONSTRAÇÃO INTERATIVA DE CRUD (GESTÃO DE PEDIDOS)
   * ------------------------------------------------------------------------- */
  const crudTableBody = document.getElementById('crud-table-body');
  const crudSearch = document.getElementById('crud-search');
  const crudFilter = document.getElementById('crud-filter');
  const crudAddBtn = document.getElementById('crud-add-btn');
  const crudCount = document.getElementById('crud-count');

  const STATUS_CYCLE = ['Pago', 'Pendente', 'Em Análise'];

  const sampleRecords = [
    { id: 1042, cliente: 'Distribuidora Vale', valor: 'R$ 4.850,00', status: 'Pago' },
    { id: 1043, cliente: 'Comercial Horizonte', valor: 'R$ 2.190,00', status: 'Pendente' },
    { id: 1044, cliente: 'Indústria Paulista', valor: 'R$ 9.400,00', status: 'Em Análise' },
  ];

  const EXTRA_CLIENTS = [
    { cliente: 'Mercado Central', valor: 'R$ 1.750,00', status: 'Pendente' },
    { cliente: 'Transportadora Sul', valor: 'R$ 6.320,00', status: 'Pago' },
    { cliente: 'Clínica São José', valor: 'R$ 3.100,00', status: 'Em Análise' },
  ];
  let extraIndex = 0;

  function getStatusBadgeClass(status) {
    if (status === 'Pago') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'Pendente') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-sky-50 text-sky-700 border-sky-200';
  }

  function renderCrudTable() {
    if (!crudTableBody) return;

    const query = (crudSearch ? crudSearch.value : '').trim().toLowerCase();
    const statusFilter = crudFilter ? crudFilter.value : 'todos';

    const filtered = sampleRecords.filter((item) => {
      const matchesText =
        item.cliente.toLowerCase().includes(query) || String(item.id).includes(query);
      const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;
      return matchesText && matchesStatus;
    });

    if (filtered.length === 0) {
      crudTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="py-6 text-center text-slate-400 font-mono">
            Nenhum registro encontrado.
          </td>
        </tr>
      `;
    } else {
      crudTableBody.innerHTML = filtered
        .map(
          (item) => `
          <tr class="hover:bg-slate-50/80 transition-colors">
            <td class="py-2.5 px-3 font-mono text-slate-500">#${item.id}</td>
            <td class="py-2.5 px-3 font-medium text-slate-800">${item.cliente}</td>
            <td class="py-2.5 px-3 font-mono text-slate-700">${item.valor}</td>
            <td class="py-2.5 px-3">
              <span class="inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusBadgeClass(item.status)}">
                ${item.status}
              </span>
            </td>
            <td class="py-2.5 px-3 text-right whitespace-nowrap">
              <button
                type="button"
                data-action="toggle-status"
                data-id="${item.id}"
                class="inline-flex items-center justify-center rounded p-1 text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer"
                title="Alterar status"
                aria-label="Alterar status do pedido ${item.id}"
              >
                <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
              </button>
              <button
                type="button"
                data-action="delete"
                data-id="${item.id}"
                class="inline-flex items-center justify-center rounded p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                title="Excluir registro"
                aria-label="Excluir pedido ${item.id}"
              >
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </td>
          </tr>
        `
        )
        .join('');
    }

    if (crudCount) {
      crudCount.textContent = `${filtered.length} registro(s) exibido(s)`;
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function trackDemoTableInteraction() {
    if (typeof window.clarity === 'function') {
      window.clarity('event', 'interacao_demo_tabela');
    }
  }

  if (crudTableBody) {
    renderCrudTable();

    if (crudSearch) {
      crudSearch.addEventListener('input', renderCrudTable);
    }
    if (crudFilter) {
      crudFilter.addEventListener('change', renderCrudTable);
    }
    if (crudAddBtn) {
      crudAddBtn.addEventListener('click', () => {
        const nextId = sampleRecords.length
          ? Math.max(...sampleRecords.map((r) => r.id)) + 1
          : 1045;
        const template = EXTRA_CLIENTS[extraIndex % EXTRA_CLIENTS.length];
        extraIndex += 1;

        sampleRecords.unshift({
          id: nextId,
          cliente: template.cliente,
          valor: template.valor,
          status: template.status,
        });
        renderCrudTable();
        trackDemoTableInteraction();
      });
    }

    crudTableBody.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;

      const id = Number(btn.getAttribute('data-id'));
      const action = btn.getAttribute('data-action');
      const index = sampleRecords.findIndex((r) => r.id === id);
      if (index === -1) return;

      if (action === 'toggle-status') {
        const currentStatus = sampleRecords[index].status;
        const nextIdx = (STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length;
        sampleRecords[index].status = STATUS_CYCLE[nextIdx];
        renderCrudTable();
        trackDemoTableInteraction();
      } else if (action === 'delete') {
        sampleRecords.splice(index, 1);
        renderCrudTable();
        trackDemoTableInteraction();
      }
    });
  }

  /* -------------------------------------------------------------------------
   * 3. CÓPIA RÁPIDA DE E-MAIL CORPORATIVO
   * ------------------------------------------------------------------------- */
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyEmailLabel = document.getElementById('copy-email-label');

  if (copyEmailBtn && copyEmailLabel) {
    copyEmailBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(CORPORATE_EMAIL);
        copyEmailLabel.textContent = 'Copiado!';
        setTimeout(() => {
          copyEmailLabel.textContent = 'Copiar';
        }, 2000);
      } catch {
        copyEmailLabel.textContent = CORPORATE_EMAIL;
      }
    });
  }

  /* -------------------------------------------------------------------------
   * 4. MÁSCARA DE WHATSAPP E VALIDAÇÃO DO FORMULÁRIO
   * ------------------------------------------------------------------------- */
  const form = document.getElementById('lead-form');
  const whatsappInput = document.getElementById('whatsapp');
  const feedbackBox = document.getElementById('form-feedback');

  function formatPhoneBR(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (whatsappInput) {
    whatsappInput.addEventListener('input', (event) => {
      event.target.value = formatPhoneBR(event.target.value);
    });
  }

  function setFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.querySelector(`.error-msg[data-for="${fieldId}"]`);
    if (!input || !errorEl) return;

    if (message) {
      input.classList.add('input-error');
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    } else {
      input.classList.remove('input-error');
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }

  function validateForm() {
    const nome = document.getElementById('nome').value.trim();
    const empresa = document.getElementById('empresa').value.trim();
    const whatsappDigits = document.getElementById('whatsapp').value.replace(/\D/g, '');
    const desafio = document.getElementById('desafio').value.trim();

    let isValid = true;

    if (nome.length < 2) {
      setFieldError('nome', 'Informe seu nome.');
      isValid = false;
    } else {
      setFieldError('nome', '');
    }

    if (empresa.length < 2) {
      setFieldError('empresa', 'Informe sua empresa.');
      isValid = false;
    } else {
      setFieldError('empresa', '');
    }

    if (whatsappDigits.length < 10 || whatsappDigits.length > 11) {
      setFieldError('whatsapp', 'Informe um WhatsApp válido com DDD.');
      isValid = false;
    } else {
      setFieldError('whatsapp', '');
    }

    if (desafio.length < 10) {
      setFieldError('desafio', 'Descreva brevemente o que deseja controlar.');
      isValid = false;
    } else {
      setFieldError('desafio', '');
    }

    return {
      isValid,
      nome,
      empresa,
      whatsapp: document.getElementById('whatsapp').value.trim(),
      desafio,
    };
  }

  if (form) {
    ['nome', 'empresa', 'whatsapp', 'desafio'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => setFieldError(id, ''));
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const { isValid, nome, empresa, whatsapp, desafio } = validateForm();

      if (!isValid) return;

      const structuredMessage = [
        '*[ORÇAMENTO - CONTROL 4 SISTEMAS]*',
        '',
        `*Nome:* ${nome}`,
        `*Empresa:* ${empresa}`,
        `*WhatsApp:* ${whatsapp}`,
        `*Necessidade:*`,
        desafio,
        '',
        '_Enviado via control4sistemas.com.br_',
      ].join('\n');

      const whatsappUrl = `https://wa.me/${WHATSAPP_BUDGET_NUMBER}?text=${encodeURIComponent(structuredMessage)}`;

      if (feedbackBox) {
        feedbackBox.innerHTML = `
          <div class="font-semibold text-emerald-700">Mensagem pronta para a Juliana!</div>
          <p class="mt-1 text-xs text-slate-600">
            Abrindo o WhatsApp (+55 12 98860-0746). Caso não abra automaticamente,
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="underline text-sky-600 font-semibold">clique aqui para enviar</a>.
          </p>
        `;
        feedbackBox.classList.remove('hidden');
      }

      if (typeof window.registrarConversao === 'function') {
        window.registrarConversao('contato_formulario');
      }

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }
})();
