/**
 * Coleção "quem-disse" — perguntas de FATOS (números e casos), pesquisadas em 05/10/2026.
 * Números do Banco Central vêm direto da API oficial (SGS, série 13762).
 */
import type { SeedQuestion } from "./seed";

const LULA3 = "Governo Lula (2023–atual)";
const NOTE = "Números e fontes conferidos em 05/10/2026.";

export const FATOS: SeedQuestion[] = [
  {
    slug: "fato-queimadas-amazonia-recorde",
    title: "Recorde de queimadas na Amazônia",
    question_text: "Em qual governo a Amazônia registrou o maior número de focos de queimada em 17 anos (desde 2007)?",
    category: "meio-ambiente",
    difficulty: "medio",
    period: "2024",
    short_explanation: "Foi em 2024, no governo Lula: 140.328 focos no bioma, segundo o INPE — 42% a mais que em 2023.",
    long_explanation:
      "O INPE contou 140.328 focos de queimada na Amazônia em 2024, o maior número desde 2007 (186.463). Em 2023 tinham sido 98.634. A temporada foi agravada por uma seca extrema ligada ao El Niño e às mudanças climáticas. Para ter o quadro completo: no mesmo período, a taxa de DESMATAMENTO medida pelo PRODES/INPE caiu — em 2024 ficou cerca de 46% abaixo de 2022.",
    legal_status: "Dado oficial de monitoramento por satélite (INPE).",
    legal_status_kind: "fato_documentado",
    claims: [
      { kind: "fato_documentado", text: "2024: 140.328 focos na Amazônia, maior número anual desde 2007 (INPE)." },
      { kind: "fato_documentado", text: "A taxa de desmatamento (PRODES) caiu em 2023, 2024 e 2025." },
      { kind: "controversia", text: "Governo atribui os incêndios à seca extrema; oposição aponta falha de prevenção e fiscalização." },
    ],
    tags: ["amazônia", "queimadas"],
    options: ["Governo Bolsonaro (2019–2022)", "Governo Temer (2016–2018)", "Governo Dilma (2011–2016)", "Governo FHC (1995–2002)"],
    correct: null,
    reveal_answer: LULA3,
    collection: "quem-disse",
    sources: [
      { title: "Amazônia tem o maior número de queimadas e incêndios em 17 anos", url: "https://www.folhape.com.br/noticias/amazonia-tem-o-maior-numero-de-queimadas-e-incendios-em-17-anos/378806/", source_type: "jornalistica", publisher: "Folha de Pernambuco (dados INPE)", publication_date: null },
      { title: "Amazônia registra o maior número de incêndios florestais em 17 anos", url: "https://olhardigital.com.br/2025/01/02/ciencia-e-espaco/amazonia-registra-o-maior-numero-de-incendios-florestais-em-17-anos/", source_type: "jornalistica", publisher: "Olhar Digital", publication_date: "2025-01-02" },
      { title: "Desmatamento cai na Amazônia e registra menor patamar em 11 anos, aponta INPE", url: "https://sbtnews.sbt.com.br/noticia/brasil/desmatamento-cai-na-amazonia-e-registra-menor-patamar-em-11-anos-aponta-inpe", source_type: "jornalistica", publisher: "SBT News", publication_date: null },
    ],
    legislation: [],
    editorial_notes: NOTE,
  },
  {
    slug: "fato-recorde-recuperacao-judicial",
    title: "Recorde de recuperações judiciais",
    question_text: "Em qual governo o Brasil bateu o recorde de pedidos de recuperação judicial de empresas da série da Serasa Experian (iniciada em 2005)?",
    category: "economia",
    difficulty: "dificil",
    period: "2024",
    short_explanation: "Foi em 2024, no governo Lula: 2.273 pedidos, alta de 61,8% sobre 2023 — o maior número da série histórica.",
    long_explanation:
      "Segundo a Serasa Experian, foram 2.273 pedidos de recuperação judicial em 2024, sendo 1.676 de micro e pequenas empresas. Para comparação: 1.387 em 2019, 1.179 em 2020, 891 em 2021 e 833 em 2022. Em 2025, o número de empresas em recuperação judicial subiu mais 12,9% (2.466). Economistas associam a alta ao crédito caro, com a Selic elevada — definida pelo Banco Central, que é autônomo.",
    legal_status: "Indicador privado de mercado (Serasa Experian), com base em dados dos tribunais.",
    legal_status_kind: "fato_documentado",
    claims: [{ kind: "fato_documentado", text: "2.273 pedidos em 2024, maior número desde o início da série, em 2005." }],
    tags: ["empresas", "economia", "crédito"],
    options: ["Governo Dilma (2011–2016)", "Governo Bolsonaro (2019–2022)", "Governo Temer (2016–2018)", "Governo FHC (1995–2002)"],
    correct: null,
    reveal_answer: LULA3,
    collection: "quem-disse",
    sources: [
      { title: "Brasil registra 2,2 mil pedidos de recuperação judicial em 2024, o maior número da série histórica", url: "https://www.serasaexperian.com.br/sala-de-imprensa/analise-de-dados/brasil-registra-22-mil-pedidos-de-recuperacao-judicial-em-2024-o-maior-numero-da-serie-historica-aponta-serasa-experian/", source_type: "primaria", publisher: "Serasa Experian", publication_date: "2025-01-28" },
      { title: "Pedidos de recuperação judicial caem 6,5% em 2022", url: "https://www.serasaexperian.com.br/sala-de-imprensa/analise-de-dados/pedidos-de-recuperacao-judicial-caem-65-em-2022-mostra-serasa-experian", source_type: "primaria", publisher: "Serasa Experian", publication_date: null },
      { title: "Recuperação judicial cresce em 2025 e atinge maior nº desde 2012", url: "https://www.infomoney.com.br/business/serasa-experian-recuperacao-judicial-cresce-em-2025-e-atinge-maior-no-desde-2012/", source_type: "jornalistica", publisher: "InfoMoney", publication_date: "2026-04-07" },
    ],
    legislation: [],
    editorial_notes: NOTE,
  },
  {
    slug: "fato-divida-bruta",
    title: "Dívida pública volta a subir",
    question_text: "Em qual governo a dívida bruta do governo geral saiu de 71,7% do PIB e passou de 82% do PIB?",
    category: "economia",
    difficulty: "dificil",
    period: "2023–2026",
    short_explanation: "No governo Lula: a dívida bruta era 71,7% do PIB em dezembro de 2022 e chegou a 82,9% em agosto de 2026 (Banco Central).",
    long_explanation:
      "Pela série oficial do Banco Central (SGS 13762), a dívida bruta do governo geral foi de 71,7% do PIB (dez/2022) para 73,8% (2023), 76,3% (2024), 78,6% (2025) e 82,9% (ago/2026). No governo Bolsonaro, a dívida saltou para 86,9% em 2020, ano da pandemia, e terminou o mandato abaixo de onde começou (75,3% em dez/2018). A inflação alta de 2021–22 ajudou a reduzir a razão; desde 2023, os juros altos pesam no crescimento da dívida.",
    legal_status: "Estatística oficial do Banco Central do Brasil.",
    legal_status_kind: "fato_documentado",
    claims: [{ kind: "fato_documentado", text: "DBGG: 71,68% (dez/2022) → 82,86% (ago/2026), série SGS 13762 do Banco Central." }],
    tags: ["dívida pública", "contas públicas"],
    options: ["Governo Bolsonaro (2019–2022)", "Governo Temer (2016–2018)", "Governo Dilma (2011–2016)", "Governo FHC (1995–2002)"],
    correct: null,
    reveal_answer: LULA3,
    collection: "quem-disse",
    sources: [
      { title: "Série 13762 — Dívida bruta do governo geral (% PIB)", url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.13762/dados?formato=json&dataInicial=01/12/2018", source_type: "primaria", publisher: "Banco Central do Brasil", publication_date: null },
      { title: "Dívida pública bruta do Brasil sobe e fecha 2025 em 78,7% do PIB, mostra BC", url: "https://diariodocomercio.com.br/economia/divida-publica-bruta-brasil-sobe-fecha-2025-787-pib-mostra-bc/", source_type: "jornalistica", publisher: "Diário do Comércio", publication_date: "2026-01-30" },
    ],
    legislation: [],
    editorial_notes: NOTE,
  },
  {
    slug: "fato-surgisphere-cloroquina",
    title: "Estudo da Lancet sobre hidroxicloroquina",
    question_text:
      "Em junho de 2020, a revista científica The Lancet retirou um estudo que associava a hidroxicloroquina a mais mortes por covid. Por quê?",
    category: "politicas-publicas",
    difficulty: "dificil",
    period: "2020",
    short_explanation:
      "Porque os dados vinham da Surgisphere, empresa americana de Sapan Desai, e não puderam ser verificados — os próprios autores pediram a retratação.",
    long_explanation:
      "O estudo usava dados que a Surgisphere dizia ter de 96 mil pacientes em centenas de hospitais. Reportagens (como a do Guardian) mostraram inconsistências, e três dos quatro autores não conseguiram auditar os dados; Desai não assinou a retratação. O artigo chegou a fazer a OMS pausar testes com o remédio. Importante: a fraude derrubou o estudo que apontava DANO, mas não provou que o remédio funciona. Ensaios clínicos grandes e controlados — como o RECOVERY, no Reino Unido, com mais de 4.700 pacientes — concluíram que a hidroxicloroquina não reduz mortes por covid.",
    legal_status: "Artigo científico retratado pela revista (não é processo judicial).",
    legal_status_kind: "fato_documentado",
    claims: [
      { kind: "fato_documentado", text: "The Lancet e o NEJM retrataram estudos baseados em dados da Surgisphere em 04/06/2020." },
      { kind: "fato_documentado", text: "O ensaio RECOVERY (NEJM, 2020) não encontrou redução de mortalidade com hidroxicloroquina." },
    ],
    tags: ["covid", "cloroquina", "ciência"],
    options: [
      "Os dados da empresa americana Surgisphere não puderam ser verificados",
      "O laboratório fabricante do remédio processou a revista",
      "A Anvisa proibiu a publicação no Brasil",
      "O estudo tinha sido escrito por um robô",
    ],
    correct: 0,
    collection: "quem-disse",
    sources: [
      { title: "Lancet, NEJM retract controversial COVID-19 studies based on Surgisphere data", url: "https://retractionwatch.com/2020/06/04/lancet-retracts-controversial-hydroxychloroquine-study/", source_type: "jornalistica", publisher: "Retraction Watch", publication_date: "2020-06-04" },
      { title: "RECOVERY (Hydroxychloroquine) — resumo do ensaio clínico", url: "https://www.acc.org/Latest-in-Cardiology/Clinical-Trials/2020/10/12/22/59/RECOVERY-Hydroxychloroquine", source_type: "academica", publisher: "American College of Cardiology", publication_date: "2020-10-12" },
    ],
    legislation: [],
    editorial_notes: NOTE,
  },
  {
    slug: "fato-serra-verde-terras-raras",
    title: "Venda da única mineradora de terras raras",
    question_text:
      "Em abril de 2026, a Serra Verde (GO), única mineradora de terras raras em operação no Brasil, foi comprada por uma empresa de qual país?",
    category: "soberania-e-relacoes-internacionais",
    difficulty: "medio",
    period: "2026",
    short_explanation: "Estados Unidos: a USA Rare Earth anunciou a compra por US$ 2,8 bilhões em 20/04/2026.",
    long_explanation:
      "As terras raras são minerais estratégicos para baterias, ímãs e equipamentos militares. Reportagem do Poder360 aponta que o governo federal não impôs condições de processamento, exportação ou controle de capital estrangeiro em três momentos: na concessão (2010), no empréstimo de US$ 465 milhões de um banco do governo americano (2025) e na venda (2026). O governo diz que foi um negócio entre empresas privadas — a mineradora já pertencia a fundos estrangeiros — e a Agência Lupa lembra que os minérios continuam sendo bens da União, sob regulação brasileira.",
    legal_status: "Transação privada; segundo a ANM, a troca de acionistas não exigia aprovação da agência.",
    legal_status_kind: "fato_documentado",
    claims: [
      { kind: "fato_documentado", text: "A USA Rare Earth anunciou a compra da Serra Verde em 20/04/2026." },
      { kind: "controversia", text: "Críticos: o governo deixou um ativo estratégico sem regras de soberania. Governo: negócio privado, sem interferência estatal." },
    ],
    tags: ["soberania", "mineração", "terras raras"],
    options: ["Estados Unidos", "China", "Canadá", "Austrália"],
    correct: 0,
    collection: "quem-disse",
    sources: [
      { title: "Governo Lula não quis regular venda de terras-raras em Goiás", url: "https://www.poder360.com.br/poder-infra/governo-lula-nao-quis-regular-venda-de-terras-raras-em-goias/", source_type: "jornalistica", publisher: "Poder360", publication_date: "2026-05-06" },
      { title: "Lula não vendeu a única mineradora de terras raras do Brasil aos EUA", url: "https://www.agencialupa.org/verificacao/2026/05/05/lula-terras-raras-brasil-eua/", source_type: "analise", publisher: "Agência Lupa", publication_date: "2026-05-05" },
    ],
    legislation: [],
    editorial_notes: NOTE,
  },
];
