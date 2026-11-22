/**
 * Control 4 Sistemas — Gerador Inteligente de Loterias da Caixa
 * - Modalidades ordenadas por maior prêmio e popularidade
 * - Último sorteio com valor pago + atualização via API pública (com fallback local)
 * - Números mais sorteados (Quentes), menos sorteados (Frios) e campeões em cada casa
 * - Volante interativo + Bilhete Digital em Canvas PNG + Compartilhamento com propaganda Control 4
 */
(function () {
  'use strict';

  const API_BASE = 'https://loteriascaixa-api.herokuapp.com/api';
  const SITE_URL = 'https://www.control4sistemas.com.br/loterias';

  const MESES_SORTE = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const TIMES_CORACAO = [
    'Flamengo/RJ', 'Corinthians/SP', 'Palmeiras/SP', 'São Paulo/SP', 'Santos/SP',
    'Grêmio/RS', 'Internacional/RS', 'Atlético/MG', 'Cruzeiro/MG', 'Botafogo/RJ',
    'Vasco da Gama/RJ', 'Fluminense/RJ', 'Bahia/BA', 'Fortaleza/CE', 'Athletico/PR',
    'Ceará/CE', 'Sport/PE', 'Vitória/BA', 'Goiás/GO', 'Coritiba/PR',
  ];

  /**
   * Base de modalidades ordenada pelos maiores prêmios e popularidade no Brasil.
   */
  const LOTERIAS = [
    {
      id: 'megasena',
      apiSlug: 'megasena',
      nome: 'Mega-Sena',
      tagline: 'Maior prêmio do Brasil',
      cor: '#10B981',
      corTexto: 'text-emerald-700',
      corBg: 'bg-emerald-600',
      corSoft: 'bg-emerald-50 border-emerald-200',
      minNum: 1,
      maxNum: 60,
      minPick: 6,
      maxPick: 20,
      defaultPick: 6,
      baseCost: 5.0,
      gridCols: 10,
      ultimoSorteio: {
        concurso: 2948,
        data: '19/11/2026',
        dezenas: [10, 17, 28, 37, 44, 53],
        acumulado: true,
        valorPagoPrincipal: 'Acumulou (0 ganhadores na Sena)',
        detalheRateio: 'Quina pagou R$ 48.920,15 para 84 apostas • Quadra pagou R$ 912,40',
        estimativaProximo: 'R$ 95.000.000,00',
        fonte: 'Base local de referência',
      },
      maisSorteados: [
        { num: 10, qtd: 334 }, { num: 53, qtd: 325 }, { num: 5, qtd: 314 },
        { num: 33, qtd: 311 }, { num: 37, qtd: 309 }, { num: 23, qtd: 307 },
        { num: 4, qtd: 305 }, { num: 42, qtd: 304 }, { num: 30, qtd: 302 },
        { num: 27, qtd: 301 },
      ],
      menosSorteados: [
        { num: 26, qtd: 234 }, { num: 21, qtd: 238 }, { num: 55, qtd: 243 },
        { num: 15, qtd: 246 }, { num: 22, qtd: 251 }, { num: 3, qtd: 254 },
        { num: 48, qtd: 256 }, { num: 31, qtd: 258 }, { num: 7, qtd: 259 },
        { num: 40, qtd: 260 },
      ],
      porCasa: [
        { casa: '1ª Casa', lideres: [4, 5, 1] },
        { casa: '2ª Casa', lideres: [10, 13, 17] },
        { casa: '3ª Casa', lideres: [23, 27, 28] },
        { casa: '4ª Casa', lideres: [33, 37, 35] },
        { casa: '5ª Casa', lideres: [42, 44, 46] },
        { casa: '6ª Casa', lideres: [53, 56, 58] },
      ],
    },
    {
      id: 'maismilionaria',
      apiSlug: 'maismilionaria',
      nome: '+Milionária',
      tagline: 'Prêmio mínimo R$ 10M',
      cor: '#0284C7',
      corTexto: 'text-sky-700',
      corBg: 'bg-sky-600',
      corSoft: 'bg-sky-50 border-sky-200',
      minNum: 1,
      maxNum: 50,
      minPick: 6,
      maxPick: 12,
      defaultPick: 6,
      baseCost: 6.0,
      gridCols: 10,
      extraType: 'trevos',
      extraCount: 2,
      extraMax: 6,
      ultimoSorteio: {
        concurso: 302,
        data: '18/11/2026',
        dezenas: [6, 14, 22, 31, 40, 48],
        trevos: [2, 5],
        acumulado: true,
        valorPagoPrincipal: 'Acumulou (0 ganhadores 6+2)',
        detalheRateio: 'Faixa 6 acertos + 1/0 trevo pagou R$ 215.400,00 para 2 apostas',
        estimativaProximo: 'R$ 168.000.000,00',
        fonte: 'Base local de referência',
      },
      maisSorteados: [
        { num: 12, qtd: 48 }, { num: 24, qtd: 46 }, { num: 6, qtd: 45 },
        { num: 35, qtd: 44 }, { num: 41, qtd: 43 }, { num: 19, qtd: 42 },
        { num: 3, qtd: 41 }, { num: 29, qtd: 40 }, { num: 47, qtd: 39 },
        { num: 14, qtd: 39 },
      ],
      menosSorteados: [
        { num: 38, qtd: 21 }, { num: 9, qtd: 22 }, { num: 45, qtd: 23 },
        { num: 17, qtd: 24 }, { num: 2, qtd: 25 }, { num: 33, qtd: 25 },
        { num: 49, qtd: 26 }, { num: 21, qtd: 26 }, { num: 8, qtd: 27 },
        { num: 27, qtd: 27 },
      ],
      porCasa: [
        { casa: '1ª Casa', lideres: [3, 6, 4] },
        { casa: '2ª Casa', lideres: [12, 14, 11] },
        { casa: '3ª Casa', lideres: [19, 22, 24] },
        { casa: '4ª Casa', lideres: [29, 31, 35] },
        { casa: '5ª Casa', lideres: [40, 41, 39] },
        { casa: '6ª Casa', lideres: [47, 48, 50] },
        { casa: 'Trevos', lideres: [2, 5, 4] },
      ],
    },
    {
      id: 'lotofacil',
      apiSlug: 'lotofacil',
      nome: 'Lotofácil',
      tagline: 'Mais fácil de ganhar',
      cor: '#9333EA',
      corTexto: 'text-purple-700',
      corBg: 'bg-purple-600',
      corSoft: 'bg-purple-50 border-purple-200',
      minNum: 1,
      maxNum: 25,
      minPick: 15,
      maxPick: 20,
      defaultPick: 15,
      baseCost: 3.0,
      gridCols: 5,
      ultimoSorteio: {
        concurso: 3542,
        data: '21/11/2026',
        dezenas: [1, 2, 4, 5, 7, 9, 10, 12, 13, 15, 18, 20, 22, 24, 25],
        acumulado: false,
        valorPagoPrincipal: 'R$ 1.842.310,50 (2 ganhadores)',
        detalheRateio: '14 acertos pagou R$ 1.690,20 para 245 apostas',
        estimativaProximo: 'R$ 1.700.000,00',
        fonte: 'Base local de referência',
      },
      maisSorteados: [
        { num: 20, qtd: 2154 }, { num: 10, qtd: 2142 }, { num: 25, qtd: 2138 },
        { num: 11, qtd: 2125 }, { num: 13, qtd: 2118 }, { num: 24, qtd: 2110 },
        { num: 14, qtd: 2104 }, { num: 3, qtd: 2098 }, { num: 5, qtd: 2095 },
        { num: 4, qtd: 2090 },
      ],
      menosSorteados: [
        { num: 16, qtd: 1962 }, { num: 8, qtd: 1974 }, { num: 6, qtd: 1981 },
        { num: 23, qtd: 1988 }, { num: 17, qtd: 1995 }, { num: 21, qtd: 2002 },
        { num: 7, qtd: 2009 }, { num: 19, qtd: 2015 }, { num: 12, qtd: 2021 },
        { num: 22, qtd: 2028 },
      ],
      porCasa: [
        { casa: '1ª a 3ª Casa', lideres: [1, 2, 3] },
        { casa: '4ª a 6ª Casa', lideres: [4, 5, 7] },
        { casa: '7ª a 9ª Casa', lideres: [10, 11, 13] },
        { casa: '10ª a 12ª Casa', lideres: [14, 15, 18] },
        { casa: '13ª a 15ª Casa', lideres: [20, 24, 25] },
      ],
    },
    {
      id: 'quina',
      apiSlug: 'quina',
      nome: 'Quina',
      tagline: 'Sorteios diários',
      cor: '#4F46E5',
      corTexto: 'text-indigo-700',
      corBg: 'bg-indigo-600',
      corSoft: 'bg-indigo-50 border-indigo-200',
      minNum: 1,
      maxNum: 80,
      minPick: 5,
      maxPick: 15,
      defaultPick: 5,
      baseCost: 2.5,
      gridCols: 10,
      ultimoSorteio: {
        concurso: 6884,
        data: '21/11/2026',
        dezenas: [4, 19, 39, 52, 73],
        acumulado: true,
        valorPagoPrincipal: 'Acumulou (0 ganhadores na Quina)',
        detalheRateio: 'Quadra pagou R$ 7.840,60 para 62 apostas • Terno pagou R$ 104,20',
        estimativaProximo: 'R$ 11.500.000,00',
        fonte: 'Base local de referência',
      },
      maisSorteados: [
        { num: 4, qtd: 468 }, { num: 49, qtd: 462 }, { num: 26, qtd: 458 },
        { num: 52, qtd: 455 }, { num: 44, qtd: 451 }, { num: 39, qtd: 448 },
        { num: 31, qtd: 446 }, { num: 16, qtd: 444 }, { num: 53, qtd: 441 },
        { num: 73, qtd: 439 },
      ],
      menosSorteados: [
        { num: 3, qtd: 368 }, { num: 47, qtd: 372 }, { num: 68, qtd: 376 },
        { num: 25, qtd: 379 }, { num: 76, qtd: 382 }, { num: 20, qtd: 384 },
        { num: 58, qtd: 386 }, { num: 30, qtd: 388 }, { num: 11, qtd: 390 },
        { num: 65, qtd: 392 },
      ],
      porCasa: [
        { casa: '1ª Casa', lideres: [4, 5, 8] },
        { casa: '2ª Casa', lideres: [16, 19, 26] },
        { casa: '3ª Casa', lideres: [31, 39, 44] },
        { casa: '4ª Casa', lideres: [49, 52, 53] },
        { casa: '5ª Casa', lideres: [73, 75, 79] },
      ],
    },
    {
      id: 'lotomania',
      apiSlug: 'lotomania',
      nome: 'Lotomania',
      tagline: 'Ganha até com 0 acertos',
      cor: '#EA580C',
      corTexto: 'text-orange-700',
      corBg: 'bg-orange-600',
      corSoft: 'bg-orange-50 border-orange-200',
      minNum: 0,
      maxNum: 99,
      minPick: 50,
      maxPick: 50,
      defaultPick: 50,
      baseCost: 3.0,
      gridCols: 10,
      ultimoSorteio: {
        concurso: 2852,
        data: '20/11/2026',
        dezenas: [1, 4, 9, 12, 17, 23, 28, 31, 36, 41, 45, 49, 54, 58, 63, 67, 72, 79, 86, 94],
        acumulado: false,
        valorPagoPrincipal: 'R$ 5.420.180,00 (1 ganhador)',
        detalheRateio: '19 acertos pagou R$ 42.150,00 para 5 apostas',
        estimativaProximo: 'R$ 600.000,00',
        fonte: 'Base local de referência',
      },
      maisSorteados: [
        { num: 47, qtd: 584 }, { num: 43, qtd: 579 }, { num: 41, qtd: 576 },
        { num: 17, qtd: 574 }, { num: 49, qtd: 571 }, { num: 92, qtd: 568 },
        { num: 24, qtd: 565 }, { num: 73, qtd: 563 }, { num: 31, qtd: 560 },
        { num: 6, qtd: 558 },
      ],
      menosSorteados: [
        { num: 96, qtd: 482 }, { num: 83, qtd: 487 }, { num: 52, qtd: 491 },
        { num: 98, qtd: 494 }, { num: 39, qtd: 496 }, { num: 21, qtd: 498 },
        { num: 69, qtd: 500 }, { num: 0, qtd: 502 }, { num: 13, qtd: 504 },
        { num: 77, qtd: 506 },
      ],
      porCasa: [
        { casa: 'Casa 00–19', lideres: [6, 17, 12] },
        { casa: 'Casa 20–39', lideres: [24, 31, 28] },
        { casa: 'Casa 40–59', lideres: [47, 43, 41] },
        { casa: 'Casa 60–79', lideres: [73, 67, 72] },
        { casa: 'Casa 80–99', lideres: [92, 86, 94] },
      ],
    },
    {
      id: 'timemania',
      apiSlug: 'timemania',
      nome: 'Timemania',
      tagline: '10 dezenas + Time',
      cor: '#CA8A04',
      corTexto: 'text-amber-700',
      corBg: 'bg-amber-500',
      corSoft: 'bg-amber-50 border-amber-200',
      minNum: 1,
      maxNum: 80,
      minPick: 10,
      maxPick: 10,
      defaultPick: 10,
      baseCost: 3.5,
      gridCols: 10,
      extraType: 'time',
      ultimoSorteio: {
        concurso: 2321,
        data: '21/11/2026',
        dezenas: [7, 15, 22, 34, 48, 59, 66],
        timeCoracao: 'Flamengo/RJ',
        acumulado: true,
        valorPagoPrincipal: 'Acumulou (0 ganhadores nos 7 acertos)',
        detalheRateio: 'Time do Coração (Flamengo/RJ) pagou R$ 8,50 para 11.420 apostas',
        estimativaProximo: 'R$ 14.200.000,00',
        fonte: 'Base local de referência',
      },
      maisSorteados: [
        { num: 20, qtd: 218 }, { num: 72, qtd: 215 }, { num: 61, qtd: 212 },
        { num: 7, qtd: 210 }, { num: 66, qtd: 208 }, { num: 50, qtd: 206 },
        { num: 21, qtd: 205 }, { num: 34, qtd: 203 }, { num: 59, qtd: 201 },
        { num: 48, qtd: 200 },
      ],
      menosSorteados: [
        { num: 5, qtd: 148 }, { num: 37, qtd: 152 }, { num: 78, qtd: 155 },
        { num: 13, qtd: 157 }, { num: 42, qtd: 159 }, { num: 29, qtd: 161 },
        { num: 64, qtd: 163 }, { num: 18, qtd: 165 }, { num: 70, qtd: 166 },
        { num: 2, qtd: 168 },
      ],
      porCasa: [
        { casa: '1ª Casa', lideres: [7, 3, 9] },
        { casa: '2ª Casa', lideres: [15, 20, 21] },
        { casa: '3ª Casa', lideres: [22, 34, 31] },
        { casa: '4ª Casa', lideres: [48, 50, 46] },
        { casa: '5ª a 7ª Casa', lideres: [59, 61, 72] },
      ],
    },
    {
      id: 'duplasena',
      apiSlug: 'duplasena',
      nome: 'Dupla Sena',
      tagline: '2 sorteios por bilhete',
      cor: '#E11D48',
      corTexto: 'text-rose-700',
      corBg: 'bg-rose-600',
      corSoft: 'bg-rose-50 border-rose-200',
      minNum: 1,
      maxNum: 50,
      minPick: 6,
      maxPick: 15,
      defaultPick: 6,
      baseCost: 2.5,
      gridCols: 10,
      ultimoSorteio: {
        concurso: 2889,
        data: '20/11/2026',
        dezenas: [5, 14, 21, 33, 42, 49],
        acumulado: true,
        valorPagoPrincipal: 'Acumulou no 1º Sorteio',
        detalheRateio: 'Quina do 1º sorteio pagou R$ 4.120,00 • 2º sorteio teve 18 quinas',
        estimativaProximo: 'R$ 3.800.000,00',
        fonte: 'Base local de referência',
      },
      maisSorteados: [
        { num: 39, qtd: 378 }, { num: 14, qtd: 374 }, { num: 33, qtd: 370 },
        { num: 5, qtd: 368 }, { num: 45, qtd: 365 }, { num: 21, qtd: 362 },
        { num: 42, qtd: 360 }, { num: 19, qtd: 358 }, { num: 11, qtd: 356 },
        { num: 49, qtd: 354 },
      ],
      menosSorteados: [
        { num: 15, qtd: 289 }, { num: 26, qtd: 294 }, { num: 40, qtd: 298 },
        { num: 8, qtd: 301 }, { num: 36, qtd: 303 }, { num: 2, qtd: 305 },
        { num: 44, qtd: 307 }, { num: 28, qtd: 309 }, { num: 12, qtd: 311 },
        { num: 47, qtd: 312 },
      ],
      porCasa: [
        { casa: '1ª Casa', lideres: [5, 4, 7] },
        { casa: '2ª Casa', lideres: [11, 14, 16] },
        { casa: '3ª Casa', lideres: [19, 21, 24] },
        { casa: '4ª Casa', lideres: [33, 35, 31] },
        { casa: '5ª Casa', lideres: [39, 42, 41] },
        { casa: '6ª Casa', lideres: [45, 49, 48] },
      ],
    },
    {
      id: 'diadesorte',
      apiSlug: 'diadesorte',
      nome: 'Dia de Sorte',
      tagline: '7 números + Mês da Sorte',
      cor: '#D97706',
      corTexto: 'text-amber-800',
      corBg: 'bg-amber-600',
      corSoft: 'bg-amber-50 border-amber-200',
      minNum: 1,
      maxNum: 31,
      minPick: 7,
      maxPick: 15,
      defaultPick: 7,
      baseCost: 2.5,
      gridCols: 8,
      extraType: 'mes',
      ultimoSorteio: {
        concurso: 1142,
        data: '21/11/2026',
        dezenas: [3, 8, 12, 18, 22, 27, 30],
        mesSorte: 'Outubro',
        acumulado: false,
        valorPagoPrincipal: 'R$ 920.450,00 (1 ganhador)',
        detalheRateio: 'Mês da Sorte (Outubro) pagou R$ 2,50 para 64.120 apostas',
        estimativaProximo: 'R$ 350.000,00',
        fonte: 'Base local de referência',
      },
      maisSorteados: [
        { num: 10, qtd: 278 }, { num: 18, qtd: 274 }, { num: 7, qtd: 271 },
        { num: 22, qtd: 268 }, { num: 3, qtd: 265 }, { num: 14, qtd: 263 },
        { num: 27, qtd: 261 }, { num: 12, qtd: 259 }, { num: 25, qtd: 257 },
        { num: 30, qtd: 255 },
      ],
      menosSorteados: [
        { num: 26, qtd: 204 }, { num: 1, qtd: 208 }, { num: 19, qtd: 212 },
        { num: 29, qtd: 215 }, { num: 15, qtd: 217 }, { num: 6, qtd: 219 },
        { num: 31, qtd: 221 }, { num: 11, qtd: 223 }, { num: 23, qtd: 225 },
        { num: 4, qtd: 226 },
      ],
      porCasa: [
        { casa: '1ª Casa', lideres: [3, 2, 5] },
        { casa: '2ª Casa', lideres: [7, 8, 10] },
        { casa: '3ª Casa', lideres: [10, 12, 14] },
        { casa: '4ª Casa', lideres: [14, 18, 16] },
        { casa: '5ª Casa', lideres: [18, 22, 20] },
        { casa: '6ª Casa', lideres: [25, 27, 24] },
        { casa: '7ª Casa', lideres: [27, 30, 31] },
      ],
    },
    {
      id: 'supersete',
      apiSlug: 'supersete',
      nome: 'Super Sete',
      tagline: '7 colunas de 0 a 9',
      cor: '#65A30D',
      corTexto: 'text-lime-700',
      corBg: 'bg-lime-600',
      corSoft: 'bg-lime-50 border-lime-200',
      minNum: 0,
      maxNum: 9,
      minPick: 7,
      maxPick: 7,
      defaultPick: 7,
      baseCost: 2.5,
      isColumnar: true,
      ultimoSorteio: {
        concurso: 774,
        data: '20/11/2026',
        dezenas: [3, 7, 1, 9, 4, 0, 8],
        acumulado: true,
        valorPagoPrincipal: 'Acumulou (0 ganhadores nas 7 colunas)',
        detalheRateio: '6 acertos pagou R$ 18.400,00 para 3 apostas',
        estimativaProximo: 'R$ 2.100.000,00',
        fonte: 'Base local de referência',
      },
      maisSorteados: [
        { num: 7, qtd: 84 }, { num: 3, qtd: 81 }, { num: 9, qtd: 79 },
        { num: 1, qtd: 77 }, { num: 4, qtd: 75 }, { num: 0, qtd: 74 },
        { num: 8, qtd: 72 }, { num: 5, qtd: 70 }, { num: 2, qtd: 69 },
        { num: 6, qtd: 67 },
      ],
      menosSorteados: [
        { num: 6, qtd: 67 }, { num: 2, qtd: 69 }, { num: 5, qtd: 70 },
        { num: 8, qtd: 72 }, { num: 0, qtd: 74 }, { num: 4, qtd: 75 },
        { num: 1, qtd: 77 }, { num: 9, qtd: 79 }, { num: 3, qtd: 81 },
        { num: 7, qtd: 84 },
      ],
      porCasa: [
        { casa: 'Coluna 1', lideres: [3, 7, 1] },
        { casa: 'Coluna 2', lideres: [7, 2, 9] },
        { casa: 'Coluna 3', lideres: [1, 5, 4] },
        { casa: 'Coluna 4', lideres: [9, 3, 6] },
        { casa: 'Coluna 5', lideres: [4, 8, 0] },
        { casa: 'Coluna 6', lideres: [0, 7, 3] },
        { casa: 'Coluna 7', lideres: [8, 9, 5] },
      ],
    },
  ];

  // Estado atual da aplicação
  const state = {
    activeId: 'megasena',
    pickCount: 6,
    gamesCount: 1,
    strategy: 'equilibrado',
    games: [], // array de arrays de números
    trevos: [2, 5],
    extraLabel: '', // Time do coração ou Mês da sorte
    ticketCode: '',
  };

  // Referências DOM
  const els = {
    tabs: document.getElementById('lottery-tabs'),
    lastDrawCard: document.getElementById('last-draw-card'),
    btnRefreshApi: document.getElementById('btn-refresh-api'),
    refreshIcon: document.getElementById('refresh-icon'),
    inputDezenas: document.getElementById('input-dezenas'),
    dezenasCountLabel: document.getElementById('dezenas-count-label'),
    dezenasMinLabel: document.getElementById('dezenas-min-label'),
    dezenasMaxLabel: document.getElementById('dezenas-max-label'),
    selectStrategy: document.getElementById('select-strategy'),
    gamesCountBtns: document.querySelectorAll('.games-count-btn'),
    btnGenerate: document.getElementById('btn-generate-numbers'),
    btnClear: document.getElementById('btn-clear-volante'),
    volanteGrid: document.getElementById('volante-grid'),
    volanteExtras: document.getElementById('volante-extras'),
    volanteStatus: document.getElementById('volante-selection-status'),
    currentStats: document.getElementById('current-game-stats'),
    betCostBadge: document.getElementById('bet-cost-badge'),
    generatorSubtitle: document.getElementById('generator-subtitle'),
    ticketPreview: document.getElementById('ticket-preview'),
    ticketCodeBadge: document.getElementById('ticket-code-badge'),
    btnDownloadTicket: document.getElementById('btn-download-ticket'),
    btnShareWhatsapp: document.getElementById('btn-share-whatsapp'),
    btnShareNative: document.getElementById('btn-share-native'),
    btnShareX: document.getElementById('btn-share-x'),
    btnCopyTicket: document.getElementById('btn-copy-ticket'),
    copyTicketLabel: document.getElementById('copy-ticket-label'),
    shareFeedback: document.getElementById('share-feedback'),
    statsTitle: document.getElementById('stats-section-title'),
    hotList: document.getElementById('hot-numbers-list'),
    coldList: document.getElementById('cold-numbers-list'),
    housesGrid: document.getElementById('houses-grid'),
    housesSubtitle: document.getElementById('houses-subtitle'),
    btnApplyHouseChampions: document.getElementById('btn-apply-house-champions'),
    canvas: document.getElementById('ticket-canvas'),
    strategyBenefitBox: document.getElementById('strategy-benefit-box'),
    inputConcursoBusca: document.getElementById('input-concurso-busca'),
    btnBuscarConcurso: document.getElementById('btn-buscar-concurso'),
    btnPrevConcurso: document.getElementById('btn-prev-concurso'),
    btnNextConcurso: document.getElementById('btn-next-concurso'),
    consultaResultadoBox: document.getElementById('consulta-resultado-box'),
    inputConferirNumeros: document.getElementById('input-conferir-numeros'),
    btnConferirAposta: document.getElementById('btn-conferir-aposta'),
    btnUsarJogoGerado: document.getElementById('btn-usar-jogo-gerado'),
    conferidorResultadoBox: document.getElementById('conferidor-resultado-box'),
  };

  const STRATEGY_INFO = {
    equilibrado:
      '<strong>Equilibrado:</strong> mistura metade pares e metade ímpares. <strong>Benefício:</strong> evita jogos desbalanceados (só pares ou só ímpares), que raramente saem nos sorteios.',
    quentes:
      '<strong>Mais Sorteados:</strong> prioriza as dezenas que mais saíram na história. <strong>Benefício:</strong> ideal para quem gosta de seguir a tendência dos números campeões.',
    frios:
      '<strong>Menos Sorteados:</strong> prioriza dezenas que saíram menos vezes até hoje. <strong>Benefício:</strong> útil para quem aposta que os números atrasados vão sair para equilibrar.',
    casas:
      '<strong>Campeões de Cada Casa:</strong> escolhe os líderes da 1ª até a última posição do sorteio. <strong>Benefício:</strong> espalha sua aposta pelo volante inteiro sem concentrar em um canto só.',
    aleatorio:
      '<strong>Surpresinha Pura:</strong> sorteio 100% aleatório sem filtros. <strong>Benefício:</strong> rapidez total para quem prefere deixar na mão da sorte.',
  };

  function getActiveGame() {
    return LOTERIAS.find((g) => g.id === state.activeId) || LOTERIAS[0];
  }

  function formatNum(n, isColumnar) {
    return isColumnar ? String(n) : String(n).padStart(2, '0');
  }

  function formatBRL(val) {
    if (typeof val !== 'number' || Number.isNaN(val)) return 'R$ 0,00';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function factorial(n) {
    let res = 1;
    for (let i = 2; i <= n; i += 1) res *= i;
    return res;
  }

  function combinations(n, k) {
    if (k > n || k < 0) return 0;
    return Math.round(factorial(n) / (factorial(k) * factorial(n - k)));
  }

  function estimateBetCost(game, pickCount, gamesCount) {
    if (game.isColumnar || game.minPick === game.maxPick) {
      return game.baseCost * gamesCount;
    }
    const mult = combinations(pickCount, game.minPick);
    return game.baseCost * mult * gamesCount;
  }

  function generateTicketCode(game) {
    const prefix = game.id.slice(0, 2).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `C4-${prefix}-${rand}`;
  }

  function showFeedback(msg) {
    els.shareFeedback.textContent = msg;
    els.shareFeedback.classList.remove('hidden');
    clearTimeout(showFeedback._timer);
    showFeedback._timer = setTimeout(() => {
      els.shareFeedback.classList.add('hidden');
    }, 3500);
  }

  /* -------------------------------------------------------------------------
   * GERAÇÃO DE NÚMEROS POR ESTRATÉGIA
   * ------------------------------------------------------------------------- */
  function pickRandomFromPool(pool, count) {
    const copy = [...pool];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  }

  function generateSingleCombination(game, pickCount, strategy) {
    if (game.isColumnar) {
      // Super Sete: 7 colunas, 1 dígito (0..9) por coluna
      const cols = [];
      for (let c = 0; c < 7; c += 1) {
        if (strategy === 'casas' && game.porCasa[c]) {
          const leaders = game.porCasa[c].lideres;
          cols.push(leaders[Math.floor(Math.random() * leaders.length)]);
        } else if (strategy === 'quentes') {
          const hot = game.maisSorteados.slice(0, 5).map((x) => x.num);
          cols.push(hot[Math.floor(Math.random() * hot.length)]);
        } else if (strategy === 'frios') {
          const cold = game.menosSorteados.slice(0, 5).map((x) => x.num);
          cols.push(cold[Math.floor(Math.random() * cold.length)]);
        } else {
          cols.push(Math.floor(Math.random() * 10));
        }
      }
      return cols;
    }

    const fullPool = [];
    for (let i = game.minNum; i <= game.maxNum; i += 1) {
      fullPool.push(i);
    }

    let chosen = new Set();

    if (strategy === 'quentes') {
      const hotPool = game.maisSorteados.map((x) => x.num);
      const hotTake = Math.min(Math.ceil(pickCount * 0.65), hotPool.length);
      pickRandomFromPool(hotPool, hotTake).forEach((n) => chosen.add(n));
    } else if (strategy === 'frios') {
      const coldPool = game.menosSorteados.map((x) => x.num);
      const coldTake = Math.min(Math.ceil(pickCount * 0.65), coldPool.length);
      pickRandomFromPool(coldPool, coldTake).forEach((n) => chosen.add(n));
    } else if (strategy === 'casas') {
      game.porCasa.forEach((casa) => {
        if (chosen.size < pickCount && casa.lideres && casa.lideres.length) {
          const valid = casa.lideres.filter((n) => n >= game.minNum && n <= game.maxNum);
          if (valid.length) {
            chosen.add(valid[Math.floor(Math.random() * valid.length)]);
          }
        }
      });
    } else if (strategy === 'equilibrado') {
      const evens = fullPool.filter((n) => n % 2 === 0);
      const odds = fullPool.filter((n) => n % 2 !== 0);
      const evenTarget = Math.floor(pickCount / 2);
      const oddTarget = pickCount - evenTarget;
      pickRandomFromPool(evens, evenTarget).forEach((n) => chosen.add(n));
      pickRandomFromPool(odds, oddTarget).forEach((n) => chosen.add(n));
    }

    // Completa o restante aleatoriamente sem repetir
    const remaining = fullPool.filter((n) => !chosen.has(n));
    const needed = pickCount - chosen.size;
    if (needed > 0) {
      pickRandomFromPool(remaining, needed).forEach((n) => chosen.add(n));
    }

    return Array.from(chosen).sort((a, b) => a - b);
  }

  function generateAllGames() {
    const game = getActiveGame();
    const list = [];
    for (let i = 0; i < state.gamesCount; i += 1) {
      list.push(generateSingleCombination(game, state.pickCount, state.strategy));
    }
    state.games = list;

    if (game.extraType === 'trevos') {
      state.trevos = pickRandomFromPool([1, 2, 3, 4, 5, 6], 2).sort((a, b) => a - b);
    } else if (game.extraType === 'time') {
      state.extraLabel = TIMES_CORACAO[Math.floor(Math.random() * TIMES_CORACAO.length)];
    } else if (game.extraType === 'mes') {
      state.extraLabel = MESES_SORTE[Math.floor(Math.random() * MESES_SORTE.length)];
    } else {
      state.extraLabel = '';
    }

    state.ticketCode = generateTicketCode(game);
    renderVolante();
    renderTicket();
  }

  /* -------------------------------------------------------------------------
   * RENDERIZAÇÃO DAS ABAS, ÚLTIMO SORTEIO, VOLANTE, ESTATÍSTICAS E BILHETE
   * ------------------------------------------------------------------------- */
  function renderTabs() {
    els.tabs.innerHTML = LOTERIAS.map((g, idx) => {
      const isActive = g.id === state.activeId;
      return `
        <button
          type="button"
          role="tab"
          aria-selected="${isActive ? 'true' : 'false'}"
          data-lottery-id="${g.id}"
          class="lottery-tab snap-start shrink-0 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
            isActive
              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }"
        >
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full shrink-0" style="background-color: ${g.cor}"></span>
            <span class="text-xs sm:text-sm font-bold whitespace-nowrap">${idx + 1}. ${g.nome}</span>
          </div>
          <span class="block text-[10px] font-mono mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}">
            ${g.tagline}
          </span>
        </button>
      `;
    }).join('');

    els.tabs.querySelectorAll('.lottery-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectLottery(btn.getAttribute('data-lottery-id'));
      });
    });
  }

  function renderLastDraw() {
    const g = getActiveGame();
    const u = g.ultimoSorteio;

    const ballsHtml = u.dezenas
      .map(
        (n) => `
        <span
          class="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full font-mono text-sm sm:text-base font-bold text-white shadow-sm"
          style="background-color: ${g.cor}"
        >${formatNum(n, g.isColumnar)}</span>`
      )
      .join('');

    let extraBadge = '';
    if (u.trevos && u.trevos.length) {
      extraBadge = `
        <div class="flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-200">
          <span class="text-[11px] font-mono uppercase text-slate-500 mr-1">Trevos:</span>
          ${u.trevos
            .map(
              (t) =>
                `<span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 border border-sky-300 font-mono text-xs font-bold text-sky-800">🍀${t}</span>`
            )
            .join('')}
        </div>`;
    } else if (u.timeCoracao) {
      extraBadge = `<span class="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900">⚽ ${u.timeCoracao}</span>`;
    } else if (u.mesSorte) {
      extraBadge = `<span class="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900">📅 ${u.mesSorte}</span>`;
    }

    els.lastDrawCard.innerHTML = `
      <div class="p-6 sm:p-7 grid lg:grid-cols-12 gap-6 items-center">
        <div class="lg:col-span-7 space-y-4">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-bold text-white" style="background-color: ${g.cor}">
              ${g.nome}
            </span>
            <span class="font-mono text-xs font-semibold text-slate-700">
              Concurso #${u.concurso} • ${u.data}
            </span>
            <span class="text-[11px] font-mono text-slate-400">(${u.fonte})</span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            ${ballsHtml}
            ${extraBadge}
          </div>

          <p class="text-xs text-slate-600 leading-relaxed">${u.detalheRateio}</p>
        </div>

        <div class="lg:col-span-5 grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
              Quanto pagou no último sorteio
            </span>
            <span class="text-base sm:text-lg font-extrabold text-slate-900 mt-1 block">
              ${u.valorPagoPrincipal}
            </span>
          </div>
          <div class="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <span class="text-[11px] font-mono uppercase tracking-wider text-emerald-700 block">
              Estimativa Próximo Sorteio
            </span>
            <span class="text-lg sm:text-xl font-extrabold text-emerald-800 mt-1 block">
              ${u.estimativaProximo}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  function renderVolante() {
    const g = getActiveGame();
    const game1 = state.games[0] || [];

    els.volanteStatus.textContent = `${game1.length} / ${state.pickCount} selecionados`;
    const cost = estimateBetCost(g, state.pickCount, state.gamesCount);
    els.betCostBadge.textContent = `Aposta est.: ${formatBRL(cost)}`;

    if (g.isColumnar) {
      // Super Sete: 7 colunas verticais de 0 a 9
      let html = '<div class="grid grid-cols-7 gap-1.5 sm:gap-2">';
      for (let col = 0; col < 7; col += 1) {
        html += `<div class="space-y-1 text-center">
          <div class="text-[10px] font-mono font-bold text-slate-500 pb-1">C${col + 1}</div>`;
        for (let d = 0; d <= 9; d += 1) {
          const selected = game1[col] === d;
          html += `
            <button
              type="button"
              data-col="${col}"
              data-num="${d}"
              class="volante-col-btn w-full h-8 rounded-lg font-mono text-xs font-bold transition-all border ${
                selected
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }"
              style="${selected ? `background-color: ${g.cor}` : ''}"
            >${d}</button>`;
        }
        html += '</div>';
      }
      html += '</div>';
      els.volanteGrid.innerHTML = html;

      els.volanteGrid.querySelectorAll('.volante-col-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const col = Number(btn.getAttribute('data-col'));
          const num = Number(btn.getAttribute('data-num'));
          if (!state.games[0]) state.games[0] = [0, 0, 0, 0, 0, 0, 0];
          state.games[0][col] = num;
          renderVolante();
          renderTicket();
        });
      });
    } else {
      const colsClass = g.gridCols === 5 ? 'grid-cols-5' : g.gridCols === 8 ? 'grid-cols-8' : 'grid-cols-10';
      const selectedSet = new Set(game1);
      let html = `<div class="grid ${colsClass} gap-1.5">`;
      for (let n = g.minNum; n <= g.maxNum; n += 1) {
        const isSelected = selectedSet.has(n);
        html += `
          <button
            type="button"
            data-num="${n}"
            class="volante-num-btn h-8 sm:h-9 rounded-lg font-mono text-xs font-bold transition-all border ${
              isSelected
                ? 'text-white border-transparent shadow-sm scale-[1.03]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
            }"
            style="${isSelected ? `background-color: ${g.cor}` : ''}"
          >${formatNum(n, false)}</button>`;
      }
      html += '</div>';
      els.volanteGrid.innerHTML = html;

      els.volanteGrid.querySelectorAll('.volante-num-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          toggleNumberInGame1(Number(btn.getAttribute('data-num')));
        });
      });
    }

    // Extras (Trevos, Time, Mês)
    if (g.extraType === 'trevos') {
      els.volanteExtras.classList.remove('hidden');
      const tSet = new Set(state.trevos);
      els.volanteExtras.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-semibold text-slate-700">Trevos da Sorte (escolha 2):</span>
          <div class="flex gap-1.5">
            ${[1, 2, 3, 4, 5, 6]
              .map(
                (t) => `
              <button type="button" data-trevo="${t}" class="trevo-btn h-8 w-8 rounded-lg font-mono text-xs font-bold border ${
                tSet.has(t) ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200'
              }">🍀${t}</button>`
              )
              .join('')}
          </div>
        </div>`;
      els.volanteExtras.querySelectorAll('.trevo-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = Number(btn.getAttribute('data-trevo'));
          if (state.trevos.includes(val)) {
            if (state.trevos.length > 1) state.trevos = state.trevos.filter((x) => x !== val);
          } else {
            if (state.trevos.length >= 2) state.trevos.shift();
            state.trevos.push(val);
            state.trevos.sort((a, b) => a - b);
          }
          renderVolante();
          renderTicket();
        });
      });
    } else if (g.extraType === 'time' || g.extraType === 'mes') {
      els.volanteExtras.classList.remove('hidden');
      const options = g.extraType === 'time' ? TIMES_CORACAO : MESES_SORTE;
      const label = g.extraType === 'time' ? 'Time do Coração:' : 'Mês da Sorte:';
      els.volanteExtras.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3">
          <label for="select-extra-item" class="text-xs font-semibold text-slate-700">${label}</label>
          <select id="select-extra-item" class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800">
            ${options.map((opt) => `<option value="${opt}" ${opt === state.extraLabel ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
        </div>`;
      document.getElementById('select-extra-item').addEventListener('change', (e) => {
        state.extraLabel = e.target.value;
        renderTicket();
      });
    } else {
      els.volanteExtras.classList.add('hidden');
      els.volanteExtras.innerHTML = '';
    }

    // Estatísticas do Jogo 1
    const pares = game1.filter((n) => n % 2 === 0).length;
    const impares = game1.length - pares;
    const soma = game1.reduce((acc, n) => acc + n, 0);

    els.currentStats.innerHTML = `
      <div class="rounded-lg border border-slate-200 bg-white p-2.5">
        <span class="text-[10px] font-mono uppercase text-slate-400 block">Pares / Ímpares</span>
        <span class="text-xs font-mono font-bold text-slate-800">${pares}P / ${impares}I</span>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-2.5">
        <span class="text-[10px] font-mono uppercase text-slate-400 block">Soma das Dezenas</span>
        <span class="text-xs font-mono font-bold text-slate-800">${soma}</span>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-2.5">
        <span class="text-[10px] font-mono uppercase text-slate-400 block">Jogos no Bilhete</span>
        <span class="text-xs font-mono font-bold text-slate-800">${state.games.length}</span>
      </div>
    `;
  }

  function toggleNumberInGame1(num) {
    const g = getActiveGame();
    if (g.isColumnar) return;
    if (!state.games[0]) state.games[0] = [];
    const arr = state.games[0];
    const idx = arr.indexOf(num);
    if (idx >= 0) {
      arr.splice(idx, 1);
    } else {
      if (arr.length >= state.pickCount) {
        arr.shift();
      }
      arr.push(num);
      arr.sort((a, b) => a - b);
    }
    renderVolante();
    renderTicket();
  }

  function renderStats() {
    const g = getActiveGame();
    els.statsTitle.textContent = `Frequência dos Números — ${g.nome}`;

    const maxHot = Math.max(...g.maisSorteados.map((x) => x.qtd), 1);
    els.hotList.innerHTML = g.maisSorteados
      .map((item) => {
        const pct = Math.round((item.qtd / maxHot) * 100);
        return `
          <button
            type="button"
            data-stat-num="${item.num}"
            class="stat-num-btn w-full flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors text-left"
            title="Clique para usar no volante"
          >
            <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-xs font-bold text-white">
              ${formatNum(item.num, g.isColumnar)}
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Dezena ${formatNum(item.num, g.isColumnar)}</span>
                <span class="font-mono font-bold text-emerald-700">${item.qtd}x</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div class="h-full rounded-full bg-emerald-500" style="width: ${pct}%"></div>
              </div>
            </div>
          </button>`;
      })
      .join('');

    const maxCold = Math.max(...g.menosSorteados.map((x) => x.qtd), 1);
    els.coldList.innerHTML = g.menosSorteados
      .map((item) => {
        const pct = Math.round((item.qtd / maxCold) * 100);
        return `
          <button
            type="button"
            data-stat-num="${item.num}"
            class="stat-num-btn w-full flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 hover:border-sky-300 hover:bg-sky-50/40 transition-colors text-left"
            title="Clique para usar no volante"
          >
            <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 font-mono text-xs font-bold text-white">
              ${formatNum(item.num, g.isColumnar)}
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Dezena ${formatNum(item.num, g.isColumnar)}</span>
                <span class="font-mono font-bold text-sky-700">${item.qtd}x</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div class="h-full rounded-full bg-sky-500" style="width: ${pct}%"></div>
              </div>
            </div>
          </button>`;
      })
      .join('');

    document.querySelectorAll('.stat-num-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!g.isColumnar) {
          toggleNumberInGame1(Number(btn.getAttribute('data-stat-num')));
          showFeedback('Dezena alternada no Jogo #1 do seu volante!');
        }
      });
    });

    // Mais sorteados em cada casa
    els.housesSubtitle.textContent = g.isColumnar
      ? 'Os 3 dígitos mais sorteados em cada coluna do Super Sete.'
      : `Os 3 números que mais aparecem em cada casa/posição da ${g.nome}.`;

    const gridColsClass = g.porCasa.length >= 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-5';
    els.housesGrid.className = `grid sm:grid-cols-2 md:grid-cols-3 ${gridColsClass} gap-3`;

    els.housesGrid.innerHTML = g.porCasa
      .map(
        (casa) => `
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5">
          <span class="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            ${casa.casa}
          </span>
          <div class="flex items-center gap-1.5">
            ${casa.lideres
              .map(
                (num, i) => `
              <span
                class="inline-flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold ${
                  i === 0 ? 'text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700'
                }"
                style="${i === 0 ? `background-color: ${g.cor}` : ''}"
                title="${i + 1}º mais sorteado nesta casa"
              >${formatNum(num, g.isColumnar)}</span>`
              )
              .join('')}
          </div>
        </div>`
      )
      .join('');
  }

  function renderTicket() {
    const g = getActiveGame();
    els.ticketCodeBadge.textContent = state.ticketCode;

    const strategyLabels = {
      equilibrado: 'Equilibrado',
      quentes: 'Mais Sorteados',
      frios: 'Menos Sorteados',
      casas: 'Campeões por Casa',
      aleatorio: 'Surpresinha',
    };

    const gamesHtml = state.games
      .map((nums, idx) => {
        const balls = nums
          .map(
            (n) => `
            <span
              class="inline-flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-bold text-white"
              style="background-color: ${g.cor}"
            >${formatNum(n, g.isColumnar)}</span>`
          )
          .join('');
        return `
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-1.5">
            <div class="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>JOGO #${idx + 1}</span>
              <span>${nums.length} ${g.isColumnar ? 'colunas' : 'dezenas'}</span>
            </div>
            <div class="flex flex-wrap gap-1">${balls}</div>
          </div>`;
      })
      .join('');

    let extraTicketInfo = '';
    if (g.extraType === 'trevos') {
      extraTicketInfo = `<div class="text-xs font-mono font-bold text-sky-700">🍀 Trevos: ${state.trevos.join(' e ')}</div>`;
    } else if (state.extraLabel) {
      extraTicketInfo = `<div class="text-xs font-mono font-bold text-amber-700">★ ${state.extraLabel}</div>`;
    }

    els.ticketPreview.innerHTML = `
      <div class="flex items-center justify-between border-b border-dashed border-slate-300 pb-3">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Bilhete Digital • Concurso #${g.ultimoSorteio.concurso + 1}</span>
          <h3 class="text-base font-extrabold text-slate-900">${g.nome}</h3>
        </div>
        <span class="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-mono font-semibold text-slate-600">
          ${strategyLabels[state.strategy] || 'Personalizado'}
        </span>
      </div>

      <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
        ${gamesHtml}
        ${extraTicketInfo}
      </div>

      <!-- Propaganda Control 4 Sistemas no Bilhete -->
      <div class="rounded-lg bg-slate-900 text-white p-3 space-y-1 border-t-2" style="border-color: ${g.cor}">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[11px] font-bold tracking-wider">
            <span class="text-emerald-400">●</span> CONTROL 4 <span class="text-sky-400">//</span> SISTEMAS
          </span>
          <span class="text-[10px] font-mono text-slate-400">control4sistemas.com.br</span>
        </div>
        <p class="text-[11px] text-slate-300 leading-snug">
          Sistemas de gestão sob medida para sua empresa. WhatsApp: (12) 98860-0746
        </p>
      </div>
    `;
  }

  /* -------------------------------------------------------------------------
   * EXPORTAÇÃO DO BILHETE PARA IMAGEM PNG (CANVAS 1080x1350) & COMPARTILHAMENTO
   * ------------------------------------------------------------------------- */
  function drawTicketToCanvas() {
    const g = getActiveGame();
    const canvas = els.canvas;
    const ctx = canvas.getContext('2d');
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    // Fundo claro limpo
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, W, H);

    // Faixa superior colorida da modalidade
    ctx.fillStyle = g.cor;
    ctx.fillRect(0, 0, W, 210);

    // Título no header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px Inter, sans-serif';
    ctx.fillText(g.nome.toUpperCase(), 70, 105);

    ctx.font = '600 24px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(`BILHETE DIGITAL • CONCURSO #${g.ultimoSorteio.concurso + 1} • ${state.ticketCode}`, 70, 158);

    // Cartão branco central
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, 56, 245, W - 112, 810, 28, true, false);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 3;
    roundRect(ctx, 56, 245, W - 112, 810, 28, false, true);

    let y = 315;
    state.games.forEach((nums, idx) => {
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`JOGO #${idx + 1} (${nums.length} ${g.isColumnar ? 'colunas' : 'dezenas'})`, 95, y);
      y += 28;

      const ballR = nums.length > 20 ? 22 : 30;
      const gap = nums.length > 20 ? 54 : 74;
      const perRow = nums.length > 20 ? 15 : 10;

      nums.forEach((n, i) => {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const cx = 95 + ballR + col * gap;
        const cy = y + ballR + row * (ballR * 2 + 14);

        ctx.beginPath();
        ctx.arc(cx, cy, ballR, 0, Math.PI * 2);
        ctx.fillStyle = g.cor;
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${nums.length > 20 ? 20 : 25}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatNum(n, g.isColumnar), cx, cy + 1);
      });

      const totalRows = Math.ceil(nums.length / perRow);
      y += totalRows * (ballR * 2 + 14) + 34;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    });

    if (g.extraType === 'trevos') {
      ctx.fillStyle = '#0369A1';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`TREVOS DA SORTE: ${state.trevos.join(' e ')}`, 95, Math.min(y + 15, 1010));
    } else if (state.extraLabel) {
      ctx.fillStyle = '#B45309';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`EXTRA: ${state.extraLabel}`, 95, Math.min(y + 15, 1010));
    }

    // Rodapé Propagandístico Control 4 Sistemas
    ctx.fillStyle = '#0F172A';
    roundRect(ctx, 56, 1085, W - 112, 210, 24, true, false);

    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(105, 1148, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px monospace';
    ctx.fillText('CONTROL 4 // SISTEMAS', 130, 1160);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '500 24px Inter, sans-serif';
    ctx.fillText('Sistemas web sob medida para gestão financeira, estoque e pedidos.', 95, 1212);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('control4sistemas.com.br/loterias   •   WhatsApp: (12) 98860-0746', 95, 1258);

    return canvas;
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function buildShareText() {
    const g = getActiveGame();
    const lines = [
      `🍀 *Meu Bilhete da ${g.nome}* (${state.ticketCode})`,
      `Prêmio estimado: ${g.ultimoSorteio.estimativaProximo}`,
      '',
    ];

    state.games.forEach((nums, i) => {
      lines.push(`Jogo #${i + 1}: ${nums.map((n) => formatNum(n, g.isColumnar)).join(' - ')}`);
    });

    if (g.extraType === 'trevos') {
      lines.push(`Trevos: ${state.trevos.join(' e ')}`);
    } else if (state.extraLabel) {
      lines.push(`Extra: ${state.extraLabel}`);
    }

    lines.push('');
    lines.push('🚀 Gerado gratuitamente na *Control 4 Sistemas*');
    lines.push('Sistemas de gestão sob medida para sua empresa!');
    lines.push(`👉 Gere o seu também: ${SITE_URL}`);
    return lines.join('\n');
  }

  function downloadTicketPng() {
    const g = getActiveGame();
    const canvas = drawTicketToCanvas();
    const link = document.createElement('a');
    link.download = `bilhete-${g.id}-control4.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showFeedback('Bilhete PNG gerado e baixado com sucesso!');
  }

  async function shareNative() {
    const g = getActiveGame();
    const text = buildShareText();
    const canvas = drawTicketToCanvas();

    if (navigator.share) {
      try {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], `bilhete-${g.id}-control4.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Bilhete ${g.nome} — Control 4 Sistemas`,
            text,
            files: [file],
          });
          return;
        }
        await navigator.share({
          title: `Bilhete ${g.nome} — Control 4 Sistemas`,
          text,
          url: SITE_URL,
        });
        return;
      } catch {
        // usuário cancelou ou não suportado
      }
    }
    downloadTicketPng();
  }

  /* -------------------------------------------------------------------------
   * ATUALIZAÇÃO AO VIVO VIA API PÚBLICA DA LOTERIA
   * ------------------------------------------------------------------------- */
  async function refreshFromApi() {
    const g = getActiveGame();
    els.refreshIcon.classList.add('animate-spin');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_BASE}/${g.apiSlug}/latest`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      if (data && data.concurso && Array.isArray(data.dezenas)) {
        const premiacao0 = Array.isArray(data.premiacoes) && data.premiacoes[0] ? data.premiacoes[0] : null;
        const ganhadores = premiacao0 ? premiacao0.ganhadores : 0;
        const valorPremio = premiacao0 ? premiacao0.valorPremio : 0;

        g.ultimoSorteio = {
          concurso: data.concurso,
          data: data.data || g.ultimoSorteio.data,
          dezenas: data.dezenas.map((d) => Number(d)),
          trevos: Array.isArray(data.trevos) ? data.trevos.map((t) => Number(t)) : undefined,
          timeCoracao: data.timeCoracao || undefined,
          mesSorte: data.mesSorte || undefined,
          acumulado: Boolean(data.acumulou),
          valorPagoPrincipal: data.acumulou
            ? 'Acumulou (0 ganhadores na faixa principal)'
            : `${formatBRL(valorPremio)} (${ganhadores} ganhador${ganhadores === 1 ? '' : 'es'})`,
          detalheRateio:
            Array.isArray(data.premiacoes) && data.premiacoes[1]
              ? `${data.premiacoes[1].descricao}: ${formatBRL(data.premiacoes[1].valorPremio)} (${data.premiacoes[1].ganhadores} apostas)`
              : g.ultimoSorteio.detalheRateio,
          estimativaProximo: data.valorEstimadoProximoConcurso
            ? formatBRL(data.valorEstimadoProximoConcurso)
            : g.ultimoSorteio.estimativaProximo,
          fonte: 'API Caixa ao vivo',
        };
        renderLastDraw();
        renderTicket();
        showFeedback(`Concurso #${data.concurso} da ${g.nome} atualizado!`);
      }
    } catch {
      showFeedback('Usando base local (API externa indisponível no momento).');
    } finally {
      els.refreshIcon.classList.remove('animate-spin');
    }
  }

  /* -------------------------------------------------------------------------
   * CONSULTA DE RESULTADOS POR CONCURSO & CONFERIDOR DE APOSTA
   * ------------------------------------------------------------------------- */
  function renderStrategyBenefit() {
    if (!els.strategyBenefitBox) return;
    els.strategyBenefitBox.innerHTML = STRATEGY_INFO[state.strategy] || STRATEGY_INFO.equilibrado;
  }

  function renderConsultedDraw(drawObj) {
    if (!els.consultaResultadoBox) return;
    const g = getActiveGame();
    const d = drawObj || g.ultimoSorteio;
    state.consultedDraw = d;
    if (els.inputConcursoBusca) {
      els.inputConcursoBusca.value = d.concurso;
    }

    const ballsHtml = d.dezenas
      .map(
        (n) => `
        <span
          class="inline-flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold text-white shadow-sm"
          style="background-color: ${g.cor}"
        >${formatNum(n, g.isColumnar)}</span>`
      )
      .join('');

    els.consultaResultadoBox.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="font-mono text-xs font-bold text-slate-900">
          ${g.nome} • Concurso #${d.concurso}
        </span>
        <span class="font-mono text-[11px] text-slate-500">${d.data} (${d.fonte})</span>
      </div>
      <div class="flex flex-wrap gap-1.5">${ballsHtml}</div>
      <div class="text-xs text-slate-700 space-y-1 pt-1 border-t border-slate-200">
        <div><strong>Faixa principal:</strong> ${d.valorPagoPrincipal}</div>
        <div class="text-slate-500">${d.detalheRateio}</div>
      </div>
    `;
  }

  async function fetchConcurso(concursoNum) {
    const g = getActiveGame();
    const num = Number(concursoNum);
    if (!num || num < 1) return;

    if (num === g.ultimoSorteio.concurso) {
      renderConsultedDraw(g.ultimoSorteio);
      checkUserNumbers();
      return;
    }

    els.consultaResultadoBox.innerHTML =
      '<div class="text-xs font-mono text-slate-500 py-2">Buscando concurso #' + num + '...</div>';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_BASE}/${g.apiSlug}/${num}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      if (data && data.concurso && Array.isArray(data.dezenas)) {
        const premiacao0 = Array.isArray(data.premiacoes) && data.premiacoes[0] ? data.premiacoes[0] : null;
        const ganhadores = premiacao0 ? premiacao0.ganhadores : 0;
        const valorPremio = premiacao0 ? premiacao0.valorPremio : 0;
        const parsed = {
          concurso: data.concurso,
          data: data.data || '-',
          dezenas: data.dezenas.map((x) => Number(x)),
          valorPagoPrincipal: data.acumulou
            ? 'Acumulou (0 ganhadores na faixa principal)'
            : `${formatBRL(valorPremio)} (${ganhadores} ganhador${ganhadores === 1 ? '' : 'es'})`,
          detalheRateio:
            Array.isArray(data.premiacoes) && data.premiacoes[1]
              ? `${data.premiacoes[1].descricao}: ${formatBRL(data.premiacoes[1].valorPremio)} (${data.premiacoes[1].ganhadores} apostas)`
              : 'Consulte o rateio completo no portal Caixa.',
          fonte: 'API Caixa ao vivo',
        };
        renderConsultedDraw(parsed);
        checkUserNumbers();
        return;
      }
      throw new Error('Dados inválidos');
    } catch {
      els.consultaResultadoBox.innerHTML = `
        <div class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Não foi possível carregar o concurso <strong>#${num}</strong> online agora. Mostrando o último concurso salvo abaixo.
        </div>`;
      setTimeout(() => {
        renderConsultedDraw(g.ultimoSorteio);
      }, 2200);
    }
  }

  function checkUserNumbers() {
    if (!els.inputConferirNumeros || !els.conferidorResultadoBox) return;
    const raw = els.inputConferirNumeros.value.trim();
    if (!raw) {
      els.conferidorResultadoBox.innerHTML =
        'Digite seus números acima ou clique em <strong>"Puxar meu Jogo #1"</strong> para ver quantos acertos você fez.';
      return;
    }

    const g = getActiveGame();
    const targetDraw = state.consultedDraw || g.ultimoSorteio;
    const userNums = raw
      .split(/[\s,;.-]+/)
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map((s) => Number(s))
      .filter((n) => !Number.isNaN(n) && n >= g.minNum && n <= g.maxNum);

    const uniqueUserNums = g.isColumnar ? userNums.slice(0, 7) : Array.from(new Set(userNums));
    if (!uniqueUserNums.length) {
      els.conferidorResultadoBox.innerHTML =
        '<span class="text-rose-600 font-semibold">Nenhum número válido encontrado para ' + g.nome + '.</span>';
      return;
    }

    let matches = [];
    if (g.isColumnar) {
      matches = uniqueUserNums.filter((n, idx) => targetDraw.dezenas[idx] === n);
    } else {
      const drawnSet = new Set(targetDraw.dezenas);
      matches = uniqueUserNums.filter((n) => drawnSet.has(n));
    }

    const badges = uniqueUserNums
      .map((n, idx) => {
        const hit = g.isColumnar ? targetDraw.dezenas[idx] === n : targetDraw.dezenas.includes(n);
        return `<span class="inline-flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold ${
          hit ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-500'
        }">${formatNum(n, g.isColumnar)}</span>`;
      })
      .join('');

    els.conferidorResultadoBox.innerHTML = `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-900">
            Resultado no Concurso #${targetDraw.concurso}:
          </span>
          <span class="rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
            matches.length >= 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
          }">
            ${matches.length} acerto${matches.length === 1 ? '' : 's'}
          </span>
        </div>
        <div class="flex flex-wrap gap-1.5">${badges}</div>
        <p class="text-[11px] text-slate-500">
          Os números em <strong>verde</strong> foram sorteados neste concurso.
        </p>
      </div>
    `;
  }

  /* -------------------------------------------------------------------------
   * SELEÇÃO DE MODALIDADE & EVENTOS
   * ------------------------------------------------------------------------- */
  function selectLottery(id) {
    state.activeId = id;
    const g = getActiveGame();
    state.pickCount = g.defaultPick;

    els.inputDezenas.min = g.minPick;
    els.inputDezenas.max = g.maxPick;
    els.inputDezenas.value = g.defaultPick;
    els.inputDezenas.disabled = g.minPick === g.maxPick;
    els.dezenasMinLabel.textContent = `Mín: ${g.minPick}`;
    els.dezenasMaxLabel.textContent = `Máx: ${g.maxPick}`;
    els.dezenasCountLabel.textContent = g.isColumnar ? '7 colunas' : `${g.defaultPick} dezenas`;
    els.generatorSubtitle.textContent = `${g.nome}: escolha entre ${g.minPick} e ${g.maxPick} ${g.isColumnar ? 'colunas' : 'dezenas'}.`;

    renderTabs();
    renderLastDraw();
    renderConsultedDraw(g.ultimoSorteio);
    renderStrategyBenefit();
    renderStats();
    generateAllGames();
  }

  function bindEvents() {
    els.inputDezenas.addEventListener('input', (e) => {
      const g = getActiveGame();
      state.pickCount = Number(e.target.value);
      els.dezenasCountLabel.textContent = g.isColumnar ? '7 colunas' : `${state.pickCount} dezenas`;
      generateAllGames();
    });

    els.selectStrategy.addEventListener('change', (e) => {
      state.strategy = e.target.value;
      renderStrategyBenefit();
      generateAllGames();
    });

    if (els.btnBuscarConcurso) {
      els.btnBuscarConcurso.addEventListener('click', () => {
        fetchConcurso(els.inputConcursoBusca.value);
      });
    }
    if (els.btnPrevConcurso) {
      els.btnPrevConcurso.addEventListener('click', () => {
        const current = Number(els.inputConcursoBusca.value) || getActiveGame().ultimoSorteio.concurso;
        if (current > 1) fetchConcurso(current - 1);
      });
    }
    if (els.btnNextConcurso) {
      els.btnNextConcurso.addEventListener('click', () => {
        const current = Number(els.inputConcursoBusca.value) || getActiveGame().ultimoSorteio.concurso;
        fetchConcurso(current + 1);
      });
    }
    if (els.btnConferirAposta) {
      els.btnConferirAposta.addEventListener('click', checkUserNumbers);
    }
    if (els.btnUsarJogoGerado) {
      els.btnUsarJogoGerado.addEventListener('click', () => {
        const g = getActiveGame();
        const game1 = state.games[0] || [];
        els.inputConferirNumeros.value = game1.map((n) => formatNum(n, g.isColumnar)).join(' ');
        checkUserNumbers();
      });
    }

    els.gamesCountBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.gamesCount = Number(btn.getAttribute('data-games'));
        els.gamesCountBtns.forEach((b) => {
          const active = Number(b.getAttribute('data-games')) === state.gamesCount;
          b.className = `games-count-btn rounded-md px-3 py-1 text-xs font-mono font-bold ${
            active ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`;
        });
        generateAllGames();
      });
    });

    els.btnGenerate.addEventListener('click', generateAllGames);

    els.btnClear.addEventListener('click', () => {
      const g = getActiveGame();
      state.games[0] = g.isColumnar ? [0, 0, 0, 0, 0, 0, 0] : [];
      renderVolante();
      renderTicket();
    });

    els.btnApplyHouseChampions.addEventListener('click', () => {
      els.selectStrategy.value = 'casas';
      state.strategy = 'casas';
      generateAllGames();
      showFeedback('Jogo gerado com os números campeões de cada casa!');
    });

    els.btnRefreshApi.addEventListener('click', refreshFromApi);
    els.btnDownloadTicket.addEventListener('click', downloadTicketPng);

    els.btnShareWhatsapp.addEventListener('click', () => {
      const url = `https://wa.me/?text=${encodeURIComponent(buildShareText())}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    els.btnShareX.addEventListener('click', () => {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText())}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    els.btnShareNative.addEventListener('click', shareNative);

    els.btnCopyTicket.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(buildShareText());
        els.copyTicketLabel.textContent = 'Copiado!';
        showFeedback('Texto do bilhete com propaganda Control 4 copiado!');
        setTimeout(() => {
          els.copyTicketLabel.textContent = 'Copiar Texto';
        }, 2200);
      } catch {
        showFeedback('Não foi possível copiar automaticamente.');
      }
    });
  }

  // Inicialização
  bindEvents();
  selectLottery('megasena');
})();
