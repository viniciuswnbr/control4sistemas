/* ==========================================================================
   Control 4 Sistemas — Central de Materiais (Mídia Kit)
   ========================================================================== */

(() => {
  'use strict';

  const BASE_URL = 'https://www.control4sistemas.com.br';

  // ------------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------------
  function slugify(value) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function sanitizeName(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function getShareData() {
    const input = document.getElementById('partner-name-input');
    const rawName = sanitizeName(input ? input.value : '');
    const slug = slugify(rawName);
    const url = slug ? `${BASE_URL}/?ref=${slug}` : BASE_URL;
    return { name: rawName, slug, url };
  }

  // ------------------------------------------------------------------------
  // Geração Dinâmica de Textos (WhatsApp, Instagram, Facebook)
  // ------------------------------------------------------------------------
  function buildTexts({ name, url }) {
    const signInline = name ? ` (pode falar que foi indicação de ${name})` : '';
    const signLine = name ? `\nIndicação de: ${name}` : '';

    // WhatsApp (3 opções naturais para encaminhar)
    const wa1 =
      `Oi! Tudo bem? Lembrei de você porque vi um pessoal que faz sistemas sob medida muito práticos para comércios e lojas.\n\n` +
      `Eles ajudam a sair do caderno e das planilhas, organizando estoque, vendas e financeiro em um painel bem fácil de usar${signInline}.\n\n` +
      `Dá uma olhada no site e nas demonstrações deles:\n${url}`;

    const wa2 =
      `Olá! Tudo certo? Queria te indicar a Control 4 Sistemas, caso esteja buscando melhorar o controle de agendamentos, ordens de serviço ou atendimento${signInline}.\n\n` +
      `Eles criam sistemas e sites sob medida para clínicas, oficinas e prestadores de serviço, sem complicação.\n\n` +
      `Vale a pena conhecer:\n${url}`;

    const wa3 =
      `Pessoal, fica a dica para quem tem empresa ou presta serviço e quer organizar pedidos, estoque ou criar um site profissional:\n\n` +
      `Conheça a Control 4 Sistemas — dá para testar demonstrações direto no site!${signLine}\n` +
      `${url}`;

    // Instagram (< 500 caracteres cada)
    const ig1 =
      `Sua empresa aparece bem quando o cliente pesquisa no Google? 🔍\n\n` +
      `A Control 4 Sistemas cria sites profissionais rápidos, modernos e pensados para gerar contatos reais no WhatsApp.\n\n` +
      `Acesse o link na bio ou envie este post para quem precisa profissionalizar o negócio.${signLine}\n\n` +
      `#criacaodesites #pequenasempresas #empreendedorismo #presencadigital #control4sistemas`;

    const ig2 =
      `Chega de perder tempo com caderno e planilha solta! 📊\n\n` +
      `A Control 4 desenvolve sistemas de gestão sob medida para estoque, pedidos, clínicas e oficinas — simples de usar no celular ou computador.${signLine}\n\n` +
      `Teste as demonstrações no link da bio ou chame no Direct!\n\n` +
      `#gestaoempresarial #sistemadegestao #pequenasempresas #empreendedorismo #control4sistemas`;

    // Facebook (3 textos para grupos/feed)
    const fb1 =
      `Indicação para empreendedores da região! 🚀\n\n` +
      `Se você precisa organizar sua empresa ou colocar seu negócio no Google com mais profissionalismo, vale conhecer a Control 4 Sistemas:\n` +
      `• Criação de Sites Profissionais\n` +
      `• Controle de Estoque e Vendas\n` +
      `• Gestão para Clínicas e Agendamentos\n` +
      `• Ordens de Serviço para Oficinas e Frotas\n\n` +
      `Conheça os projetos e peça uma demonstração:${signLine}\n` +
      `${url}`;

    const fb2 =
      `Pergunta rápida para quem empreende aqui no grupo:\n\n` +
      `Qual a maior dificuldade hoje para controlar os pedidos e o estoque da sua empresa? Ainda usa caderno ou várias planilhas separadas?\n\n` +
      `Se quiser conhecer uma solução sob medida, simples e sem mensalidade abusiva, dá uma olhada na Control 4 Sistemas:${signLine}\n` +
      `${url}`;

    const fb3 =
      `Para quem gosta de testar antes de contratar: a Control 4 Sistemas tem demonstrações gratuitas disponíveis direto no site!\n\n` +
      `Dá para ver na prática como funcionam os painéis de estoque, pedidos, ordens de serviço e sites profissionais.${signLine}\n\n` +
      `Acesse aqui para testar:\n${url}`;

    return { wa1, wa2, wa3, ig1, ig2, fb1, fb2, fb3 };
  }

  function updateDynamicContent() {
    const data = getShareData();
    const texts = buildTexts(data);

    // URL display & clear button
    const urlDisplay = document.getElementById('generated-url-display');
    if (urlDisplay) urlDisplay.textContent = data.url;

    const clearBtn = document.getElementById('clear-name-btn');
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !data.name);
    }

    // WhatsApp texts & direct share links
    const waMap = [
      { msgId: 'wa-msg-1', shareId: 'wa-share-1', text: texts.wa1 },
      { msgId: 'wa-msg-2', shareId: 'wa-share-2', text: texts.wa2 },
      { msgId: 'wa-msg-3', shareId: 'wa-share-3', text: texts.wa3 },
    ];
    waMap.forEach(({ msgId, shareId, text }) => {
      const pre = document.getElementById(msgId);
      if (pre) pre.textContent = text;
      const link = document.getElementById(shareId);
      if (link) {
        link.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
      }
    });

    // Instagram captions + char counter
    const igMap = [
      { id: 'ig-cap-1', countId: 'ig-cap-1-count', text: texts.ig1 },
      { id: 'ig-cap-2', countId: 'ig-cap-2-count', text: texts.ig2 },
    ];
    igMap.forEach(({ id, countId, text }) => {
      const pre = document.getElementById(id);
      if (pre) pre.textContent = text;
      const counter = document.getElementById(countId);
      if (counter) {
        const len = text.length;
        counter.textContent = `${len}/500 caracteres`;
        counter.className =
          len <= 500
            ? 'text-xs font-mono text-emerald-700'
            : 'text-xs font-mono text-rose-600 font-semibold';
      }
    });

    // Facebook posts
    const fbMap = [
      { id: 'fb-msg-1', text: texts.fb1 },
      { id: 'fb-msg-2', text: texts.fb2 },
      { id: 'fb-msg-3', text: texts.fb3 },
    ];
    fbMap.forEach(({ id, text }) => {
      const pre = document.getElementById(id);
      if (pre) pre.textContent = text;
    });
  }

  // ------------------------------------------------------------------------
  // Copiar para Área de Transferência (Feedback 2s)
  // ------------------------------------------------------------------------
  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  function showCopyFeedback(btn) {
    if (!btn.dataset.originalHtml) {
      btn.dataset.originalHtml = btn.innerHTML;
      btn.dataset.originalClass = btn.className;
    }

    if (btn._copyTimeout) {
      clearTimeout(btn._copyTimeout);
    }

    btn.className =
      'copy-btn inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors';
    btn.innerHTML = '<span>✓ Copiado para área de transferência</span>';

    btn._copyTimeout = setTimeout(() => {
      btn.className = btn.dataset.originalClass;
      btn.innerHTML = btn.dataset.originalHtml;
    }, 2000);
  }

  function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        let text = '';
        const targetId = btn.getAttribute('data-copy-id');
        const targetType = btn.getAttribute('data-copy-target');

        if (targetType === 'generated-url') {
          text = getShareData().url;
        } else if (targetId) {
          const el = document.getElementById(targetId);
          text = el ? el.textContent : '';
        }

        if (!text) return;

        try {
          await copyToClipboard(text);
          showCopyFeedback(btn);
        } catch (err) {
          console.error('Erro ao copiar texto:', err);
        }
      });
    });
  }

  // ------------------------------------------------------------------------
  // Navegação por Abas
  // ------------------------------------------------------------------------
  function initTabs() {
    const buttons = document.querySelectorAll('[data-tab-btn]');
    const panels = document.querySelectorAll('[data-tab-panel]');

    const activeStyles = {
      whatsapp: 'bg-white text-emerald-700 shadow-sm border border-emerald-200',
      instagram: 'bg-white text-sky-700 shadow-sm border border-sky-200',
      facebook: 'bg-white text-sky-700 shadow-sm border border-sky-200',
    };

    const inactiveStyle = 'text-slate-600 hover:text-slate-900 border border-transparent';

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab-btn');

        buttons.forEach((b) => {
          const name = b.getAttribute('data-tab-btn');
          const isActive = name === target;
          b.setAttribute('aria-selected', String(isActive));
          b.className = `tab-btn flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
            isActive ? activeStyles[name] : inactiveStyle
          }`;
        });

        panels.forEach((panel) => {
          const isMatch = panel.getAttribute('data-tab-panel') === target;
          panel.classList.toggle('hidden', !isMatch);
        });
      });
    });
  }

  // ------------------------------------------------------------------------
  // Utilitários de Desenho HTML5 Canvas (Identidade Control 4 Sistemas)
  // ------------------------------------------------------------------------
  function roundRectPath(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function drawTechBackground(ctx, w, h) {
    // Fundo escuro moderno (#0F172A -> #091120)
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.55, '#0B1324');
    grad.addColorStop(1, '#08101E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Glow radial cyan e emerald
    const glowCyan = ctx.createRadialGradient(w * 0.85, h * 0.15, 10, w * 0.85, h * 0.15, w * 0.65);
    glowCyan.addColorStop(0, 'rgba(2, 132, 199, 0.28)');
    glowCyan.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = glowCyan;
    ctx.fillRect(0, 0, w, h);

    const glowEmerald = ctx.createRadialGradient(w * 0.15, h * 0.82, 10, w * 0.15, h * 0.82, w * 0.55);
    glowEmerald.addColorStop(0, 'rgba(16, 185, 129, 0.20)');
    glowEmerald.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glowEmerald;
    ctx.fillRect(0, 0, w, h);

    // Grade sutil tech
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function drawBrandHeader(ctx, x, y, scale = 1) {
    ctx.save();
    // Ponto emerald
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(x + 10 * scale, y, 8 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Texto marca
    ctx.font = `700 ${Math.round(28 * scale)}px "JetBrains Mono", monospace`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#F8FAFC';
    const part1 = 'CONTROL 4 ';
    ctx.fillText(part1, x + 28 * scale, y);
    const w1 = ctx.measureText(part1).width;

    ctx.fillStyle = '#38BDF8';
    const part2 = '// ';
    ctx.fillText(part2, x + 28 * scale + w1, y);
    const w2 = ctx.measureText(part2).width;

    ctx.fillStyle = '#F8FAFC';
    ctx.fillText('SISTEMAS', x + 28 * scale + w1 + w2, y);
    ctx.restore();
  }

  function drawPill(ctx, text, x, y, bgColor, borderColor, textColor, fontSize = 24, padX = 26, padY = 14) {
    ctx.save();
    ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
    const metrics = ctx.measureText(text);
    const w = metrics.width + padX * 2;
    const h = fontSize + padY * 2;

    roundRectPath(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padX, y + h / 2 + 1);
    ctx.restore();
    return { width: w, height: h };
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, font, color) {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';

    const words = text.split(' ');
    let line = '';
    let currY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line ? `${line} ${words[i]}` : words[i];
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, currY);
        line = words[i];
        currY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, x, currY);
      currY += lineHeight;
    }
    ctx.restore();
    return currY;
  }

  function drawCheckList(ctx, items, x, startY, maxWidth, fontSize = 34, gap = 28) {
    let y = startY;
    items.forEach((item) => {
      // Ícone check emerald
      ctx.save();
      roundRectPath(ctx, x, y + 4, 42, 42, 12);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
      ctx.stroke();

      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 25);
      ctx.lineTo(x + 19, y + 32);
      ctx.lineTo(x + 31, y + 18);
      ctx.stroke();
      ctx.restore();

      const nextY = drawWrappedText(
        ctx,
        item,
        x + 62,
        y + 4,
        maxWidth - 62,
        fontSize * 1.32,
        `500 ${fontSize}px "Inter", sans-serif`,
        '#E2E8F0'
      );
      y = nextY + gap;
    });
    return y;
  }

  function drawCtaBar(ctx, label, sublabel, x, y, w, h, accent = '#0284C7') {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 24);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.stroke();

    // Faixa lateral de destaque
    roundRectPath(ctx, x + 14, y + 14, 12, h - 28, 6);
    ctx.fillStyle = accent;
    ctx.fill();

    ctx.font = '700 32px "Inter", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + 48, y + 26);

    ctx.font = '500 24px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText(sublabel, x + 48, y + 72);
    ctx.restore();
  }

  // ------------------------------------------------------------------------
  // Desenho dos 7 Criativos
  // ------------------------------------------------------------------------
  function renderWaStatus1() {
    const canvas = document.getElementById('canvas-wa-status-1');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 1080;
    const h = 1920;

    drawTechBackground(ctx, w, h);
    drawBrandHeader(ctx, 90, 120, 1.15);

    drawPill(
      ctx,
      'GESTÃO EMPRESARIAL SOB MEDIDA',
      90,
      230,
      'rgba(2, 132, 199, 0.18)',
      'rgba(56, 189, 248, 0.5)',
      '#38BDF8',
      24
    );

    let y = drawWrappedText(
      ctx,
      'Sua empresa ainda perde vendas no caderno?',
      90,
      340,
      w - 180,
      98,
      '800 82px "Inter", sans-serif',
      '#FFFFFF'
    );

    y = drawWrappedText(
      ctx,
      'Substitua planilhas soltas e anotações de papel por um painel simples, feito sob medida para a rotina do seu negócio.',
      90,
      y + 30,
      w - 180,
      54,
      '400 36px "Inter", sans-serif',
      '#94A3B8'
    );

    // Card central
    const cardY = y + 70;
    roundRectPath(ctx, 90, cardY, w - 180, 560, 28);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.stroke();

    drawCheckList(
      ctx,
      [
        'Controle de estoque e alertas em tempo real',
        'Pedidos, orçamentos e histórico de clientes',
        'Fluxo financeiro claro no celular ou PC',
        'Sem mensalidades abusivas por usuário',
      ],
      140,
      cardY + 60,
      w - 280,
      34,
      34
    );

    drawCtaBar(
      ctx,
      'Teste as demonstrações gratuitas',
      'control4sistemas.com.br',
      90,
      1660,
      w - 180,
      130,
      '#10B981'
    );
  }

  function renderWaStatus2() {
    const canvas = document.getElementById('canvas-wa-status-2');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 1080;
    const h = 1920;

    drawTechBackground(ctx, w, h);
    drawBrandHeader(ctx, 90, 120, 1.15);

    drawPill(
      ctx,
      'SOLUÇÕES DIGITAIS PARA EMPRESAS',
      90,
      230,
      'rgba(16, 185, 129, 0.16)',
      'rgba(52, 211, 153, 0.45)',
      '#34D399',
      24
    );

    let y = drawWrappedText(
      ctx,
      'Sites e Sistemas Sob Medida sem mensalidade abusiva',
      90,
      340,
      w - 180,
      98,
      '800 80px "Inter", sans-serif',
      '#FFFFFF'
    );

    y = drawWrappedText(
      ctx,
      'Tecnologia limpa e direta para quem precisa vender mais e organizar a operação.',
      90,
      y + 30,
      w - 180,
      54,
      '400 36px "Inter", sans-serif',
      '#94A3B8'
    );

    // Badges de segmentos
    const tags = ['Sites Profissionais', 'Estoque & Vendas', 'Clínicas', 'Oficinas & OS', 'Frotas'];
    let tagX = 90;
    let tagY = y + 65;
    tags.forEach((tag) => {
      ctx.font = '600 26px "JetBrains Mono", monospace';
      const tw = ctx.measureText(tag).width + 52;
      if (tagX + tw > w - 90) {
        tagX = 90;
        tagY += 80;
      }
      const res = drawPill(
        ctx,
        tag,
        tagX,
        tagY,
        'rgba(30, 41, 59, 0.85)',
        'rgba(56, 189, 248, 0.4)',
        '#E2E8F0',
        26,
        26,
        16
      );
      tagX += res.width + 20;
    });

    drawCtaBar(
      ctx,
      'Peça um orçamento sem compromisso',
      'control4sistemas.com.br',
      90,
      1660,
      w - 180,
      130,
      '#0284C7'
    );
  }

  function renderIgFeed1() {
    const canvas = document.getElementById('canvas-ig-feed-1');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 1080;
    const h = 1080;

    drawTechBackground(ctx, w, h);
    drawBrandHeader(ctx, 80, 90, 1.0);

    drawPill(
      ctx,
      'CRIAÇÃO DE SITES PROFISSIONAIS',
      80,
      170,
      'rgba(2, 132, 199, 0.18)',
      'rgba(56, 189, 248, 0.5)',
      '#38BDF8',
      22
    );

    let y = drawWrappedText(
      ctx,
      'Sua empresa encontrada no Google todos os dias.',
      80,
      255,
      w - 160,
      78,
      '800 64px "Inter", sans-serif',
      '#FFFFFF'
    );

    drawCheckList(
      ctx,
      [
        'Site rápido, responsivo e focado em conversão',
        'Estrutura preparada para SEO no Google',
        'Botão direto para o WhatsApp da sua equipe',
      ],
      80,
      y + 45,
      w - 160,
      30,
      24
    );

    drawCtaBar(
      ctx,
      'Conheça nossos projetos no site',
      'control4sistemas.com.br',
      80,
      870,
      w - 160,
      125,
      '#0284C7'
    );
  }

  function renderIgFeed2() {
    const canvas = document.getElementById('canvas-ig-feed-2');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 1080;
    const h = 1080;

    drawTechBackground(ctx, w, h);
    drawBrandHeader(ctx, 80, 90, 1.0);

    drawPill(
      ctx,
      'SISTEMAS DE GESTÃO SOB MEDIDA',
      80,
      170,
      'rgba(16, 185, 129, 0.16)',
      'rgba(52, 211, 153, 0.45)',
      '#34D399',
      22
    );

    let y = drawWrappedText(
      ctx,
      'Organize estoque, pedidos e atendimentos em um só lugar.',
      80,
      255,
      w - 160,
      76,
      '800 62px "Inter", sans-serif',
      '#FFFFFF'
    );

    drawCheckList(
      ctx,
      [
        'Comércios, Lojas e Distribuidoras',
        'Clínicas, Consultórios e Agendamentos',
        'Oficinas, Ordens de Serviço e Frotas',
      ],
      80,
      y + 45,
      w - 160,
      30,
      24
    );

    drawCtaBar(
      ctx,
      'Teste as demonstrações gratuitas',
      'control4sistemas.com.br',
      80,
      870,
      w - 160,
      125,
      '#10B981'
    );
  }

  function renderIgStory1() {
    const canvas = document.getElementById('canvas-ig-story-1');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 1080;
    const h = 1920;

    drawTechBackground(ctx, w, h);
    drawBrandHeader(ctx, 90, 130, 1.15);

    drawPill(
      ctx,
      'AUTORIDADE NO GOOGLE',
      90,
      245,
      'rgba(2, 132, 199, 0.18)',
      'rgba(56, 189, 248, 0.5)',
      '#38BDF8',
      24
    );

    let y = drawWrappedText(
      ctx,
      'Sites Profissionais que geram clientes no WhatsApp',
      90,
      355,
      w - 180,
      96,
      '800 78px "Inter", sans-serif',
      '#FFFFFF'
    );

    y = drawWrappedText(
      ctx,
      'Chega de depender só de indicação boca a boca. Tenha presença profissional no Google.',
      90,
      y + 30,
      w - 180,
      54,
      '400 36px "Inter", sans-serif',
      '#94A3B8'
    );

    drawCheckList(
      ctx,
      [
        'Carregamento ultrarrápido no celular',
        'Otimizado para buscas locais',
        'Atendimento direto no seu WhatsApp',
      ],
      90,
      y + 70,
      w - 180,
      36,
      32
    );

    // Área inferior limpa (y: 1460..1920) reservada para figurinha de Link do Instagram
    ctx.save();
    ctx.font = '600 26px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'center';
    ctx.fillText('Acesse no link abaixo ↓', w / 2, 1430);
    ctx.restore();
  }

  function renderIgStory2() {
    const canvas = document.getElementById('canvas-ig-story-2');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 1080;
    const h = 1920;

    drawTechBackground(ctx, w, h);
    drawBrandHeader(ctx, 90, 130, 1.15);

    drawPill(
      ctx,
      'SISTEMA SOB MEDIDA',
      90,
      245,
      'rgba(16, 185, 129, 0.16)',
      'rgba(52, 211, 153, 0.45)',
      '#34D399',
      24
    );

    let y = drawWrappedText(
      ctx,
      'Pare de perder tempo com planilhas e papel',
      90,
      355,
      w - 180,
      96,
      '800 78px "Inter", sans-serif',
      '#FFFFFF'
    );

    y = drawWrappedText(
      ctx,
      'Painéis limpos e fáceis de usar para gerenciar sua empresa de qualquer lugar.',
      90,
      y + 30,
      w - 180,
      54,
      '400 36px "Inter", sans-serif',
      '#94A3B8'
    );

    drawCheckList(
      ctx,
      [
        'Estoque, Pedidos e Financeiro',
        'Agendamentos para Clínicas',
        'Ordens de Serviço para Oficinas',
      ],
      90,
      y + 70,
      w - 180,
      36,
      32
    );

    // Área inferior limpa (y: 1460..1920) reservada para figurinha de Link do Instagram
    ctx.save();
    ctx.font = '600 26px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'center';
    ctx.fillText('Veja as demonstrações no link ↓', w / 2, 1430);
    ctx.restore();
  }

  function renderFbBanner1() {
    const canvas = document.getElementById('canvas-fb-banner-1');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 1200;
    const h = 630;

    drawTechBackground(ctx, w, h);
    drawBrandHeader(ctx, 70, 75, 0.95);

    drawPill(
      ctx,
      'SITES & SISTEMAS SOB MEDIDA',
      70,
      140,
      'rgba(2, 132, 199, 0.18)',
      'rgba(56, 189, 248, 0.5)',
      '#38BDF8',
      18,
      20,
      10
    );

    let y = drawWrappedText(
      ctx,
      'Tecnologia prática para organizar sua empresa e vender mais.',
      70,
      210,
      720,
      62,
      '800 50px "Inter", sans-serif',
      '#FFFFFF'
    );

    drawWrappedText(
      ctx,
      'Sites Profissionais • Controle de Estoque • Clínicas • Oficinas • Frotas',
      70,
      y + 20,
      760,
      36,
      '500 24px "Inter", sans-serif',
      '#94A3B8'
    );

    // Card lateral direito com URL
    roundRectPath(ctx, 830, 140, 300, 350, 24);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.72)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = '#34D399';
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillText('DEMONSTRAÇÕES', 865, 200);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 32px "Inter", sans-serif';
    ctx.fillText('Teste grátis', 865, 250);
    ctx.fillText('direto no site', 865, 290);

    roundRectPath(ctx, 865, 365, 230, 62, 14);
    ctx.fillStyle = '#0284C7';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('control4sistemas.com.br', 980, 402);
    ctx.restore();

    // Rodapé sutil
    ctx.save();
    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('https://control4sistemas.com.br', 70, 565);
    ctx.restore();
  }

  function renderAllCanvases() {
    renderWaStatus1();
    renderWaStatus2();
    renderIgFeed1();
    renderIgFeed2();
    renderIgStory1();
    renderIgStory2();
    renderFbBanner1();
  }

  // ------------------------------------------------------------------------
  // Download de PNG em Alta Resolução
  // ------------------------------------------------------------------------
  function initDownloadButtons() {
    document.querySelectorAll('[data-download-canvas]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const canvasId = btn.getAttribute('data-download-canvas');
        const filename = btn.getAttribute('data-filename') || 'control4-arte.png';
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const triggerDownload = (href) => {
          const link = document.createElement('a');
          link.download = filename;
          link.href = href;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        if (canvas.toBlob) {
          canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            triggerDownload(url);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }, 'image/png');
        } else {
          triggerDownload(canvas.toDataURL('image/png'));
        }
      });
    });
  }

  // ------------------------------------------------------------------------
  // Menu Mobile & Inicialização
  // ------------------------------------------------------------------------
  function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      const isHidden = menu.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!isHidden));
    });
  }

  function initFromQueryParam() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const input = document.getElementById('partner-name-input');
    if (ref && input && !input.value) {
      input.value = ref.replace(/-/g, ' ');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    initMobileMenu();
    initFromQueryParam();
    updateDynamicContent();
    initTabs();
    initCopyButtons();
    initDownloadButtons();

    const input = document.getElementById('partner-name-input');
    const clearBtn = document.getElementById('clear-name-btn');

    if (input) {
      input.addEventListener('input', updateDynamicContent);
    }

    if (clearBtn && input) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        updateDynamicContent();
        input.focus();
      });
    }

    // Desenha imediatamente e redesenha quando as fontes carregarem
    renderAllCanvases();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(renderAllCanvases);
    }
  });
})();
