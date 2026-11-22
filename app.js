/**
 * Control 4 Sistemas — Frontend Controller Modular
 * - Rastreamento UTM (sessionStorage) & registrarConversao()
 * - Botão Flutuante de WhatsApp Inteligente (IntersectionObserver)
 * - Menu Mobile & Ano Atual
 * - Demonstração interativa de CRUD
 * - Calculadora de Prejuízo com Planilhas
 * - FAQ Comercial Accordion
 * - Formulário de Orçamento -> WhatsApp Juliana + /obrigado
 * - Calculadora de Comissão (parceiros.html)
 * - Calculadora de Margem e Precificação (calculadora-margem.html)
 */

(function () {
  'use strict';

  const WHATSAPP_BUDGET_NUMBER = '5512988600746';
  const CORPORATE_EMAIL = 'contato@control4sistemas.com.br';
  const UTM_STORAGE_KEY = 'c4_utm_source';

  /* -------------------------------------------------------------------------
   * 0. RASTREAMENTO UTM & CONVERSÃO GLOBAL
   * ------------------------------------------------------------------------- */
  function captureUtmSource() {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source');
      if (utmSource && utmSource.trim()) {
        sessionStorage.setItem(UTM_STORAGE_KEY, utmSource.trim());
      }
      return sessionStorage.getItem(UTM_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  function getUtmSource() {
    try {
      return sessionStorage.getItem(UTM_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  function buildWhatsAppUrl(message) {
    const utmSource = getUtmSource();
    const finalMessage = utmSource
      ? `${message}\n\n[Origem: ${utmSource}]`
      : message;
    return `https://wa.me/${WHATSAPP_BUDGET_NUMBER}?text=${encodeURIComponent(finalMessage)}`;
  }

  const activeUtm = captureUtmSource();

  // Sobrescreve/expõe registrarConversao globalmente com suporte a UTM
  window.registrarConversao = function registrarConversao(origem) {
    const utmSource = getUtmSource() || 'direto';
    const labelComUtm = `${origem} | utm:${utmSource}`;

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: 'contato',
        event_label: labelComUtm,
        utm_source: utmSource,
      });
    }

    if (typeof window.clarity === 'function') {
      window.clarity('set', 'lead_origem', origem);
      window.clarity('set', 'utm_source', utmSource);
      window.clarity('event', 'clique_orcamento');
    }
  };

  window.c4BuildWhatsAppUrl = buildWhatsAppUrl;

  // Atualiza links estáticos de WhatsApp com UTM caso exista na sessão
  if (activeUtm) {
    document.querySelectorAll('a[data-wa-base-msg]').forEach((anchor) => {
      const baseMsg = anchor.getAttribute('data-wa-base-msg');
      if (baseMsg) {
        anchor.href = buildWhatsAppUrl(baseMsg);
      }
    });
  }

  // Inicializa ícones Lucide e ano atual
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
   * 2. BOTÃO FLUTUANTE DE WHATSAPP INTELIGENTE (INTERSECTION OBSERVER)
   * ------------------------------------------------------------------------- */
  const waFloatBtn = document.getElementById('wa-float-btn');
  const waFloatLabel = document.getElementById('wa-float-label');

  const WA_CONTEXT_MAP = {
    hero: {
      label: 'Orçamento Sob Medida',
      msg: 'Olá Juliana! Vi o site da Control 4 Sistemas e gostaria de solicitar um orçamento para um sistema sob medida.',
    },
    metricas: {
      label: 'Reduzir Retrabalho',
      msg: 'Olá Juliana! Quero entender como reduzir o retrabalho operacional na minha empresa com um sistema da Control 4.',
    },
    'calculadora-prejuizo': {
      label: 'Eliminar Prejuízo',
      msg: 'Olá Juliana! Usei a calculadora de planilhas no site e quero eliminar o retrabalho operacional da minha equipe.',
    },
    comparativo: {
      label: 'Sair das Planilhas',
      msg: 'Olá Juliana! Vi o comparativo de Planilhas vs. Sistema Sob Medida e quero avaliar a migração para minha empresa.',
    },
    bases: {
      label: 'Bases Customizáveis',
      msg: 'Olá Juliana! Tenho interesse em uma das Bases Prontas Customizáveis da Control 4 Sistemas.',
    },
    projetos: {
      label: 'Portfólio & Estoque V1',
      msg: 'Olá Juliana! Estava vendo o portfólio de sistemas (Pedidos, Estoque, O.S.) e quero saber como adaptar para minha empresa.',
    },
    servicos: {
      label: 'Serviços Estratégicos',
      msg: 'Olá Juliana! Gostaria de informações sobre os Serviços Estratégicos (Auditoria, B2B Express ou CTO Sob Demanda).',
    },
    'para-quem': {
      label: 'Avaliar Meu Cenário',
      msg: 'Olá Juliana! Quero avaliar se um sistema sob medida da Control 4 faz sentido para o momento da minha empresa.',
    },
    faq: {
      label: 'Tirar Dúvidas',
      msg: 'Olá Juliana! Estava lendo o FAQ e gostaria de tirar uma dúvida sobre prazo, código ou integrações.',
    },
    contato: {
      label: 'Falar com Juliana',
      msg: 'Olá Juliana! Quero solicitar um orçamento personalizado para minha empresa.',
    },
  };

  let currentWaContext = 'hero';

  function updateFloatingWhatsApp(sectionId) {
    if (!waFloatBtn) return;
    const ctx = WA_CONTEXT_MAP[sectionId];
    if (!ctx) return;

    currentWaContext = sectionId;
    waFloatBtn.href = buildWhatsAppUrl(ctx.msg);
    if (waFloatLabel) {
      waFloatLabel.textContent = ctx.label;
    }
  }

  if (waFloatBtn) {
    const defaultMsg = waFloatBtn.getAttribute('data-wa-default');
    if (defaultMsg) {
      waFloatBtn.href = buildWhatsAppUrl(defaultMsg);
    } else {
      updateFloatingWhatsApp('hero');
    }

    waFloatBtn.addEventListener('click', () => {
      window.registrarConversao(`whatsapp_flutuante_${currentWaContext}`);
    });

    const observedSections = document.querySelectorAll('section[data-wa-section]');
    if (observedSections.length > 0 && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          let topCandidate = null;
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!topCandidate || entry.intersectionRatio > topCandidate.intersectionRatio) {
                topCandidate = entry;
              }
            }
          });
          if (topCandidate) {
            const id = topCandidate.target.getAttribute('data-wa-section') || topCandidate.target.id;
            updateFloatingWhatsApp(id);
          }
        },
        {
          root: null,
          rootMargin: '-25% 0px -45% 0px',
          threshold: [0.1, 0.35, 0.6],
        }
      );

      observedSections.forEach((sec) => observer.observe(sec));
    }
  }

  /* -------------------------------------------------------------------------
   * 3. DEMONSTRAÇÃO INTERATIVA DE CRUD (GESTÃO DE PEDIDOS)
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

    if (crudSearch) crudSearch.addEventListener('input', renderCrudTable);
    if (crudFilter) crudFilter.addEventListener('change', renderCrudTable);

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
   * 4. CALCULADORA DE PREJUÍZO COM PLANILHAS (INDEX.HTML)
   * ------------------------------------------------------------------------- */
  const sliderFuncionarios = document.getElementById('calc-funcionarios');
  const sliderHoras = document.getElementById('calc-horas');
  const labelFuncionarios = document.getElementById('calc-funcionarios-val');
  const labelHoras = document.getElementById('calc-horas-val');
  const outPrejuizoAnual = document.getElementById('calc-prejuizo-anual');
  const outPrejuizoMensal = document.getElementById('calc-prejuizo-mensal');
  const outHorasAno = document.getElementById('calc-horas-ano');
  const btnEliminarPrejuizo = document.getElementById('calc-eliminar-btn');

  function formatBRL(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatBRLDetailed(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  const CUSTO_HORA_MEDIO_BRL = 45; // Custo hora médio com encargos B2B
  const SEMANAS_ANO = 52;

  function updateLossCalculator() {
    if (!sliderFuncionarios || !sliderHoras) return;

    const funcionarios = Number(sliderFuncionarios.value) || 1;
    const horasSemana = Number(sliderHoras.value) || 1;

    const horasAno = funcionarios * horasSemana * SEMANAS_ANO;
    const custoAnual = horasAno * CUSTO_HORA_MEDIO_BRL;
    const custoMensal = custoAnual / 12;

    if (labelFuncionarios) {
      labelFuncionarios.textContent = `${funcionarios} ${funcionarios === 1 ? 'pessoa' : 'pessoas'}`;
    }
    if (labelHoras) {
      labelHoras.textContent = `${horasSemana}h / sem`;
    }
    if (outPrejuizoAnual) {
      outPrejuizoAnual.textContent = formatBRL(custoAnual);
    }
    if (outPrejuizoMensal) {
      outPrejuizoMensal.textContent = `${formatBRL(custoMensal)} / mês`;
    }
    if (outHorasAno) {
      outHorasAno.textContent = `${horasAno.toLocaleString('pt-BR')} horas/ano`;
    }

    return { funcionarios, horasSemana, custoAnual, horasAno };
  }

  if (sliderFuncionarios && sliderHoras) {
    updateLossCalculator();
    sliderFuncionarios.addEventListener('input', updateLossCalculator);
    sliderHoras.addEventListener('input', updateLossCalculator);

    if (btnEliminarPrejuizo) {
      btnEliminarPrejuizo.addEventListener('click', () => {
        const stats = updateLossCalculator();
        window.registrarConversao('calculadora_prejuizo');

        const desafioField = document.getElementById('desafio');
        if (desafioField && stats) {
          desafioField.value = `Temos ${stats.funcionarios} pessoa(s) gastando cerca de ${stats.horasSemana}h/semana em planilhas (estimativa de ${formatBRL(stats.custoAnual)}/ano perdidos). Queremos automatizar esse processo.`;
        }
      });
    }
  }

  /* -------------------------------------------------------------------------
   * 5. FAQ COMERCIAL ACCORDION
   * ------------------------------------------------------------------------- */
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  faqTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('aria-controls');
      const panel = targetId ? document.getElementById(targetId) : null;
      if (!panel) return;

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Fecha outros itens abertos para manter interface limpa
      faqTriggers.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherPanelId = otherBtn.getAttribute('aria-controls');
          const otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;
          if (otherPanel) otherPanel.classList.add('hidden');
          const otherIcon = otherBtn.querySelector('.faq-chevron');
          if (otherIcon) otherIcon.classList.remove('rotate-180');
        }
      });

      btn.setAttribute('aria-expanded', String(!isExpanded));
      panel.classList.toggle('hidden', isExpanded);
      const chevron = btn.querySelector('.faq-chevron');
      if (chevron) {
        chevron.classList.toggle('rotate-180', !isExpanded);
      }
    });
  });

  /* -------------------------------------------------------------------------
   * 6. CÓPIA RÁPIDA DE E-MAIL CORPORATIVO
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
   * 7. MÁSCARA DE WHATSAPP, VALIDAÇÃO DO FORMULÁRIO E REDIRECT /OBRIGADO
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
        '*Necessidade:*',
        desafio,
        '',
        '_Enviado via control4sistemas.com.br_',
      ].join('\n');

      const whatsappUrl = buildWhatsAppUrl(structuredMessage);

      if (feedbackBox) {
        feedbackBox.innerHTML = `
          <div class="font-semibold text-emerald-700">Mensagem pronta para a Juliana!</div>
          <p class="mt-1 text-xs text-slate-600">
            Abrindo o WhatsApp (+55 12 98860-0746) e redirecionando para os próximos passos...
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="underline text-sky-600 font-semibold">Clique aqui caso não abra</a>.
          </p>
        `;
        feedbackBox.classList.remove('hidden');
      }

      window.registrarConversao('contato_formulario');
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      setTimeout(() => {
        window.location.href = '/obrigado';
      }, 900);
    });
  }

  /* -------------------------------------------------------------------------
   * 8. CALCULADORA DE COMISSÃO (PARCEIROS.HTML)
   * ------------------------------------------------------------------------- */
  const parceirosClientes = document.getElementById('parceiros-clientes');
  const parceirosTicket = document.getElementById('parceiros-ticket');

  function updateParceirosCalc() {
    if (!parceirosClientes || !parceirosTicket) return;

    const clientes = Number(parceirosClientes.value) || 1;
    const ticketSetup = Number(parceirosTicket.value) || 5000;

    // Modelo transparente: 15% no setup + R$ 150/mês de recorrência por cliente ativo
    const comissaoSetup = clientes * (ticketSetup * 0.15);
    const recorrenciaMensal = clientes * 150;
    const ganhoAnual = comissaoSetup + recorrenciaMensal * 12;

    const elClientesVal = document.getElementById('parceiros-clientes-val');
    const elTicketVal = document.getElementById('parceiros-ticket-val');
    const elSetupOut = document.getElementById('parceiros-setup-total');
    const elRecorrenteMesOut = document.getElementById('parceiros-recorrente-mes');
    const elAnualOut = document.getElementById('parceiros-ganho-anual');
    const waBtn = document.getElementById('parceiros-wa-btn');

    if (elClientesVal) elClientesVal.textContent = `${clientes} ${clientes === 1 ? 'cliente' : 'clientes'}`;
    if (elTicketVal) elTicketVal.textContent = formatBRL(ticketSetup);
    if (elSetupOut) elSetupOut.textContent = formatBRL(comissaoSetup);
    if (elRecorrenteMesOut) elRecorrenteMesOut.textContent = `${formatBRL(recorrenciaMensal)} / mês`;
    if (elAnualOut) elAnualOut.textContent = formatBRL(ganhoAnual);

    if (waBtn) {
      const msg = `Olá Juliana! Quero me cadastrar no Programa de Parceiros da Control 4 Sistemas. Simulei ${clientes} indicação(ões) com ticket médio de ${formatBRL(ticketSetup)}.`;
      waBtn.href = buildWhatsAppUrl(msg);
    }
  }

  if (parceirosClientes && parceirosTicket) {
    updateParceirosCalc();
    parceirosClientes.addEventListener('input', updateParceirosCalc);
    parceirosTicket.addEventListener('input', updateParceirosCalc);
  }

  /* -------------------------------------------------------------------------
   * 9. CALCULADORA DE PRECIFICAÇÃO E MARGEM (CALCULADORA-MARGEM.HTML)
   * ------------------------------------------------------------------------- */
  const mCusto = document.getElementById('margem-custo');
  const mVariaveis = document.getElementById('margem-variaveis');
  const mImpostos = document.getElementById('margem-impostos');
  const mTaxas = document.getElementById('margem-taxas');
  const mLucro = document.getElementById('margem-lucro');

  function updateMargemCalc() {
    if (!mCusto || !mVariaveis || !mImpostos || !mTaxas || !mLucro) return;

    const custoBase = Math.max(0, Number(mCusto.value) || 0);
    const custoVariavel = Math.max(0, Number(mVariaveis.value) || 0);
    const impostosPct = Math.max(0, Number(mImpostos.value) || 0);
    const taxasPct = Math.max(0, Number(mTaxas.value) || 0);
    const margemDesejadaPct = Math.max(0, Number(mLucro.value) || 0);

    const custoTotal = custoBase + custoVariavel;
    const somaPercentuais = impostosPct + taxasPct + margemDesejadaPct;

    const warningEl = document.getElementById('margem-warning');
    const outPreco = document.getElementById('margem-preco-venda');
    const outLucro = document.getElementById('margem-lucro-valor');
    const outMarkup = document.getElementById('margem-markup');
    const outImpostosTaxas = document.getElementById('margem-impostos-valor');

    const barCusto = document.getElementById('bar-custo');
    const barTaxas = document.getElementById('bar-taxas');
    const barLucro = document.getElementById('bar-lucro');

    if (somaPercentuais >= 100) {
      if (warningEl) warningEl.classList.remove('hidden');
      if (outPreco) outPreco.textContent = 'Inválido';
      if (outLucro) outLucro.textContent = 'R$ 0,00';
      if (outMarkup) outMarkup.textContent = '0%';
      if (outImpostosTaxas) outImpostosTaxas.textContent = 'R$ 0,00';
      return;
    }

    if (warningEl) warningEl.classList.add('hidden');

    const divisor = 1 - somaPercentuais / 100;
    const precoVenda = custoTotal / divisor;
    const valorImpostosTaxas = precoVenda * ((impostosPct + taxasPct) / 100);
    const lucroLiquido = precoVenda * (margemDesejadaPct / 100);
    const markupPct = custoTotal > 0 ? ((precoVenda - custoTotal) / custoTotal) * 100 : 0;

    if (outPreco) outPreco.textContent = formatBRLDetailed(precoVenda);
    if (outLucro) outLucro.textContent = formatBRLDetailed(lucroLiquido);
    if (outMarkup) outMarkup.textContent = `${markupPct.toFixed(1).replace('.', ',')}%`;
    if (outImpostosTaxas) outImpostosTaxas.textContent = formatBRLDetailed(valorImpostosTaxas);

    if (precoVenda > 0 && barCusto && barTaxas && barLucro) {
      const pctCusto = (custoTotal / precoVenda) * 100;
      const pctTaxas = impostosPct + taxasPct;
      const pctLucro = margemDesejadaPct;
      barCusto.style.width = `${pctCusto.toFixed(1)}%`;
      barTaxas.style.width = `${pctTaxas.toFixed(1)}%`;
      barLucro.style.width = `${pctLucro.toFixed(1)}%`;
    }
  }

  if (mCusto && mVariaveis && mImpostos && mTaxas && mLucro) {
    updateMargemCalc();
    [mCusto, mVariaveis, mImpostos, mTaxas, mLucro].forEach((input) => {
      input.addEventListener('input', updateMargemCalc);
    });
  }

  /* -------------------------------------------------------------------------
   * 10. RASTREAMENTO DE PROFUNDIDADE DE SCROLL (25%, 50%, 75%, 90%)
   * ------------------------------------------------------------------------- */
  (function initScrollDepthTracking() {
    const thresholds = [25, 50, 75, 90];
    const fired = new Set();
    let ticking = false;

    function checkScrollDepth() {
      ticking = false;
      const docEl = document.documentElement;
      const scrollTop = window.scrollY || docEl.scrollTop || 0;
      const maxScroll = docEl.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const percent = Math.min(100, Math.round((scrollTop / maxScroll) * 100));

      thresholds.forEach((t) => {
        if (percent >= t && !fired.has(t)) {
          fired.add(t);
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'scroll_depth', { percent: t });
          }
        }
      });
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(checkScrollDepth);
        }
      },
      { passive: true }
    );
  })();

  /* -------------------------------------------------------------------------
   * 11. RASTREAMENTO DE CLIQUE NOS 8 CARDS DO PORTFÓLIO (HOME)
   * ------------------------------------------------------------------------- */
  document.querySelectorAll('a[data-portfolio-system]').forEach((link) => {
    link.addEventListener('click', () => {
      const systemName = link.getAttribute('data-portfolio-system') || '';
      const slug = link.getAttribute('data-portfolio-slug') || '';

      if (typeof window.gtag === 'function' && systemName) {
        window.gtag('event', 'select_portfolio_system', {
          system_name: systemName,
        });
      }
      if (typeof window.clarity === 'function' && slug) {
        window.clarity('event', 'clique_sistema_' + slug);
      }
    });
  });

  /* -------------------------------------------------------------------------
   * 12. BANNER DISCRETO DE AVISO DE COOKIES / LGPD (PRIMEIRA VISITA)
   * ------------------------------------------------------------------------- */
  (function initLgpdBanner() {
    const LGPD_KEY = 'c4_lgpd_consent';
    try {
      if (localStorage.getItem(LGPD_KEY) === 'accepted') return;
    } catch {
      return;
    }

    const banner = document.createElement('aside');
    banner.id = 'c4-lgpd-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de Privacidade e Cookies');
    banner.className =
      'fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-30 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-4 shadow-lg text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center gap-3';

    banner.innerHTML = `
      <p class="leading-relaxed flex-1">
        Utilizamos cookies e métricas anônimas (GA4 e Clarity) para melhorar sua experiência. Ao continuar, você concorda com nossa
        <a href="/privacidade" class="text-sky-600 underline hover:text-sky-700 font-medium">Política de Privacidade</a>.
      </p>
      <button
        type="button"
        id="c4-lgpd-accept"
        class="shrink-0 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
      >
        Entendi
      </button>
    `;

    document.body.appendChild(banner);

    const acceptBtn = document.getElementById('c4-lgpd-accept');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        try {
          localStorage.setItem(LGPD_KEY, 'accepted');
        } catch {
          // ignore storage errors
        }
        banner.remove();
      });
    }
  })();
})();
