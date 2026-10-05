/**
 * Banco inicial de perguntas.
 *
 * Coleção "leis": leis e emendas cuja DATA e PRESIDENTE SIGNATÁRIO
 * foram conferidos no texto oficial do Planalto em 05/10/2026
 * (cada link abaixo respondeu HTTP 200 e o rodapé "Brasília, <data> ... <PRESIDENTE>"
 * foi lido). Mesmo assim, passe por revisão humana antes de divulgar.
 *
 * Coleção "quem-disse" (padrão do /desafio): ver src/content/quem-disse.ts.
 */
import type { ClaimKind, Difficulty, SourceType } from "@/types/domain";
import { FATOS } from "./fatos";
import { QUEM_DISSE } from "./quem-disse";

export interface SeedQuestion {
  slug: string;
  title: string;
  question_text: string;
  category: string; // slug da categoria
  difficulty: Difficulty;
  period: string;
  short_explanation: string;
  long_explanation: string;
  legal_status: string | null;
  legal_status_kind: ClaimKind | null;
  claims: { kind: ClaimKind; text: string }[];
  tags: string[];
  /** 4 alternativas; a primeira posição NÃO precisa ser a correta (é embaralhado). */
  options: string[];
  /** Índice da correta, ou null na pegadinha (nenhuma correta → usa reveal_answer). */
  correct: number | null;
  reveal_answer?: string;
  collection: string;
  sources: {
    title: string;
    url: string;
    source_type: SourceType;
    publisher: string;
    publication_date: string | null;
    description?: string;
  }[];
  legislation: {
    title: string;
    article?: string;
    url?: string;
    description?: string;
    relevance?: string;
  }[];
  editorial_notes?: string;
  is_demo?: boolean;
}

export const SEED_CATEGORIES = [
  { slug: "liberdade-de-expressao", name: "Liberdade de expressão", emoji: "🗣️", sort_order: 1 },
  { slug: "justica-e-instituicoes", name: "Justiça e instituições", emoji: "⚖️", sort_order: 2 },
  { slug: "corrupcao-e-investigacoes", name: "Corrupção e investigações", emoji: "💰", sort_order: 3 },
  { slug: "soberania-e-relacoes-internacionais", name: "Soberania e relações internacionais", emoji: "🌎", sort_order: 4 },
  { slug: "politicas-publicas", name: "Políticas públicas", emoji: "🏛️", sort_order: 5 },
  { slug: "constituicao-e-leis", name: "Constituição e leis", emoji: "📜", sort_order: 6 },
  { slug: "economia", name: "Economia", emoji: "💼", sort_order: 7 },
  { slug: "meio-ambiente", name: "Meio ambiente", emoji: "🌳", sort_order: 8 },
  { slug: "direitos-e-liberdades", name: "Direitos e liberdades", emoji: "👥", sort_order: 9 },
  { slug: "estatais-e-empresas", name: "Estatais e empresas", emoji: "🏢", sort_order: 10 },
  { slug: "declaracoes", name: "Declarações controversas", emoji: "🎤", sort_order: 11 },
];

const G = {
  sarney: "Governo Sarney (1985–1990)",
  collor: "Governo Collor (1990–1992)",
  itamar: "Governo Itamar Franco (1992–1994)",
  fhc: "Governo FHC (1995–2002)",
  lula12: "Governo Lula (2003–2010)",
  dilma: "Governo Dilma (2011–2016)",
  temer: "Governo Temer (2016–2018)",
  bolsonaro: "Governo Bolsonaro (2019–2022)",
  lula3: "Governo Lula (2023–atual)",
};

const P = "https://www.planalto.gov.br/ccivil_03";
const NOTE = "Data e signatário conferidos no texto oficial do Planalto em 05/10/2026.";

function law(
  slug: string,
  q: Omit<SeedQuestion, "slug" | "claims" | "legal_status" | "legal_status_kind" | "editorial_notes" | "collection"> & {
    claims?: SeedQuestion["claims"];
    legal_status?: string;
  },
): SeedQuestion {
  return {
    ...q,
    slug,
    legal_status: q.legal_status ?? "Norma em vigor (verifique alterações posteriores no texto compilado).",
    legal_status_kind: "fato_documentado",
    claims: q.claims ?? [],
    editorial_notes: NOTE,
    collection: "leis",
  };
}

export const LAW_QUESTIONS: SeedQuestion[] = [
  law("constituicao-1988", {
    title: "Promulgação da Constituição de 1988",
    question_text: "A Constituição Federal atual foi promulgada em 5 de outubro de 1988. Quem estava na Presidência da República?",
    category: "constituicao-e-leis",
    difficulty: "facil",
    period: "1988",
    short_explanation: "A Constituição foi promulgada pela Assembleia Nacional Constituinte em 5/10/1988, durante o governo José Sarney.",
    long_explanation:
      "A Constituição não é sancionada pelo presidente: ela foi elaborada e promulgada pela Assembleia Nacional Constituinte, presidida pelo deputado Ulysses Guimarães. Na data da promulgação, o presidente da República era José Sarney, que assumiu em 1985 após a morte de Tancredo Neves.",
    tags: ["constituição", "redemocratização"],
    options: [G.sarney, G.collor, G.itamar, "Governo Figueiredo (1979–1985)"],
    correct: 0,
    sources: [
      { title: "Constituição da República Federativa do Brasil de 1988", url: `${P}/constituicao/constituicao.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "1988-10-05" },
    ],
    legislation: [
      { title: "Constituição Federal de 1988", article: "Preâmbulo", url: `${P}/constituicao/constituicao.htm`, relevance: "É o próprio documento citado na pergunta." },
    ],
  }),
  law("real-circulacao-1994", {
    title: "Real começa a circular",
    question_text: "O Real passou a circular como moeda oficial em 1º de julho de 1994. Quem era o presidente nesse dia?",
    category: "economia",
    difficulty: "medio",
    period: "1994",
    short_explanation: "Em 1º/7/1994 o presidente era Itamar Franco. FHC havia sido ministro da Fazenda até março de 1994.",
    long_explanation:
      "O Plano Real foi lançado no governo Itamar Franco, com Fernando Henrique Cardoso como ministro da Fazenda até deixar o cargo para disputar a eleição. A moeda entrou em circulação em 1º de julho de 1994, inicialmente por medida provisória. A Lei nº 9.069, que consolidou o Plano Real, foi sancionada em 29/06/1995 — já no governo FHC. Por isso é comum associar o Real apenas a FHC.",
    claims: [
      { kind: "fato_documentado", text: "A Lei 9.069/1995 foi assinada por Fernando Henrique Cardoso em 29/06/1995." },
      { kind: "interpretacao", text: "A autoria política do Plano Real é disputada entre Itamar e FHC; ambos tiveram papel central." },
    ],
    tags: ["plano real", "moeda", "inflação"],
    options: [G.itamar, G.fhc, G.collor, G.sarney],
    correct: 0,
    sources: [
      { title: "Lei nº 9.069, de 29 de junho de 1995 (Plano Real)", url: `${P}/leis/l9069.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "1995-06-29" },
    ],
    legislation: [
      { title: "Lei nº 9.069/1995", article: "Art. 1º e 2º", url: `${P}/leis/l9069.htm`, relevance: "Define o Real e a data de 1º de julho de 1994." },
    ],
  }),
  law("lei-responsabilidade-fiscal", {
    title: "Lei de Responsabilidade Fiscal",
    question_text: "A Lei de Responsabilidade Fiscal (LC 101), que limita gastos com pessoal e endividamento de governos, foi sancionada em qual governo?",
    category: "economia",
    difficulty: "medio",
    period: "2000",
    short_explanation: "A LC 101 foi sancionada em 4/5/2000 por Fernando Henrique Cardoso.",
    long_explanation:
      "A Lei Complementar nº 101/2000 estabelece normas de finanças públicas para União, estados e municípios, como limites de gasto com pessoal e regras para endividamento. Foi assinada pelo presidente FHC e pelo ministro da Fazenda Pedro Malan.",
    tags: ["lrf", "contas públicas"],
    options: [G.fhc, G.lula12, G.itamar, G.dilma],
    correct: 0,
    sources: [
      { title: "Lei Complementar nº 101, de 4 de maio de 2000", url: `${P}/leis/lcp/lcp101.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2000-05-04" },
    ],
    legislation: [{ title: "Lei Complementar nº 101/2000", url: `${P}/leis/lcp/lcp101.htm` }],
  }),
  law("estatuto-do-desarmamento", {
    title: "Estatuto do Desarmamento",
    question_text: "O Estatuto do Desarmamento (Lei 10.826), que restringiu a posse e o porte de armas, foi sancionado em qual governo?",
    category: "direitos-e-liberdades",
    difficulty: "facil",
    period: "2003",
    short_explanation: "Sancionado em 22/12/2003 por Luiz Inácio Lula da Silva.",
    long_explanation:
      "A Lei nº 10.826/2003 regulamenta registro, posse, porte e comercialização de armas de fogo. Foi assinada por Lula e pelo ministro da Justiça Márcio Thomaz Bastos. Em 2005 houve referendo sobre a proibição do comércio de armas (art. 35), rejeitada pela maioria dos eleitores.",
    claims: [{ kind: "fato_documentado", text: "O art. 35 previa referendo popular sobre a proibição da venda de armas, realizado em 2005." }],
    tags: ["armas", "segurança pública"],
    options: [G.lula12, G.fhc, G.dilma, G.bolsonaro],
    correct: 0,
    sources: [
      { title: "Lei nº 10.826, de 22 de dezembro de 2003", url: `${P}/leis/2003/l10.826.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2003-12-22" },
    ],
    legislation: [{ title: "Lei nº 10.826/2003", article: "Art. 35", url: `${P}/leis/2003/l10.826.htm`, relevance: "Previa o referendo de 2005." }],
  }),
  law("lei-maria-da-penha", {
    title: "Lei Maria da Penha",
    question_text: "A Lei Maria da Penha (Lei 11.340), contra a violência doméstica e familiar contra a mulher, foi sancionada em qual governo?",
    category: "direitos-e-liberdades",
    difficulty: "facil",
    period: "2006",
    short_explanation: "Sancionada em 7/8/2006 por Lula.",
    long_explanation:
      "A Lei nº 11.340/2006 cria mecanismos para coibir a violência doméstica e familiar contra a mulher. Leva o nome de Maria da Penha Maia Fernandes, cujo caso foi levado à Comissão Interamericana de Direitos Humanos. Foi assinada por Lula e por Dilma Rousseff, então ministra-chefe da Casa Civil.",
    tags: ["mulheres", "violência doméstica"],
    options: [G.lula12, G.dilma, G.fhc, G.temer],
    correct: 0,
    sources: [
      { title: "Lei nº 11.340, de 7 de agosto de 2006", url: `${P}/_ato2004-2006/2006/lei/l11340.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2006-08-07" },
    ],
    legislation: [{ title: "Lei nº 11.340/2006", url: `${P}/_ato2004-2006/2006/lei/l11340.htm` }],
  }),
  law("lei-da-ficha-limpa", {
    title: "Lei da Ficha Limpa",
    question_text: "A Lei da Ficha Limpa (LC 135), que torna inelegíveis condenados por órgão colegiado, foi sancionada em qual governo?",
    category: "corrupcao-e-investigacoes",
    difficulty: "medio",
    period: "2010",
    short_explanation: "Sancionada em 4/6/2010 por Lula. Nasceu de um projeto de iniciativa popular.",
    long_explanation:
      "A Lei Complementar nº 135/2010 alterou a Lei de Inelegibilidades (LC 64/1990), passando a impedir a candidatura de condenados por decisão de órgão colegiado em diversos crimes, mesmo antes do trânsito em julgado. O projeto teve origem em iniciativa popular com mais de 1 milhão de assinaturas.",
    claims: [{ kind: "fato_documentado", text: "A lei alterou a LC 64/1990 (Lei de Inelegibilidades)." }],
    tags: ["eleições", "inelegibilidade"],
    options: [G.lula12, G.dilma, G.fhc, G.temer],
    correct: 0,
    sources: [
      { title: "Lei Complementar nº 135, de 4 de junho de 2010", url: `${P}/leis/lcp/lcp135.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2010-06-04" },
    ],
    legislation: [{ title: "Lei Complementar nº 135/2010", url: `${P}/leis/lcp/lcp135.htm` }],
  }),
  law("lei-de-acesso-a-informacao", {
    title: "Lei de Acesso à Informação",
    question_text: "A Lei de Acesso à Informação (Lei 12.527), que obriga órgãos públicos a responder pedidos de cidadãos, foi sancionada em qual governo?",
    category: "liberdade-de-expressao",
    difficulty: "medio",
    period: "2011",
    short_explanation: "Sancionada em 18/11/2011 por Dilma Rousseff.",
    long_explanation:
      "A Lei nº 12.527/2011 regulamenta o direito constitucional de acesso a informações públicas (art. 5º, XXXIII, da Constituição). Qualquer pessoa pode pedir informações a órgãos públicos, que têm prazo para responder.",
    tags: ["transparência", "lai"],
    options: [G.dilma, G.lula12, G.temer, G.fhc],
    correct: 0,
    sources: [
      { title: "Lei nº 12.527, de 18 de novembro de 2011", url: `${P}/_ato2011-2014/2011/lei/l12527.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2011-11-18" },
    ],
    legislation: [
      { title: "Constituição Federal", article: "Art. 5º, XXXIII", url: `${P}/constituicao/constituicao.htm`, description: "Todos têm direito a receber dos órgãos públicos informações de seu interesse particular, ou de interesse coletivo ou geral.", relevance: "É o direito que a LAI regulamenta." },
    ],
  }),
  law("lei-anticorrupcao", {
    title: "Lei Anticorrupção",
    question_text: "A Lei Anticorrupção (Lei 12.846), que responsabiliza empresas por atos contra a administração pública, foi sancionada em qual governo?",
    category: "corrupcao-e-investigacoes",
    difficulty: "dificil",
    period: "2013",
    short_explanation: "Sancionada em 1º/8/2013 por Dilma Rousseff.",
    long_explanation:
      "A Lei nº 12.846/2013 prevê a responsabilização objetiva, administrativa e civil, de pessoas jurídicas por atos lesivos à administração pública, e criou o acordo de leniência para empresas. Foi aprovada no contexto das manifestações de junho de 2013.",
    claims: [{ kind: "interpretacao", text: "Analistas associam a aprovação ao contexto das manifestações de junho de 2013." }],
    tags: ["empresas", "leniência"],
    options: [G.dilma, G.lula12, G.temer, G.bolsonaro],
    correct: 0,
    sources: [
      { title: "Lei nº 12.846, de 1º de agosto de 2013", url: `${P}/_ato2011-2014/2013/lei/l12846.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2013-08-01" },
    ],
    legislation: [{ title: "Lei nº 12.846/2013", article: "Art. 16 (acordo de leniência)", url: `${P}/_ato2011-2014/2013/lei/l12846.htm` }],
  }),
  law("lei-organizacoes-criminosas", {
    title: "Lei das Organizações Criminosas (colaboração premiada)",
    question_text: "A lei que definiu organização criminosa e detalhou a colaboração premiada — instrumento muito usado na Lava Jato — foi sancionada em qual governo?",
    category: "justica-e-instituicoes",
    difficulty: "dificil",
    period: "2013",
    short_explanation: "A Lei 12.850 foi sancionada em 2/8/2013 por Dilma Rousseff.",
    long_explanation:
      "A Lei nº 12.850/2013 define organização criminosa e regulamenta meios de obtenção de prova, entre eles a colaboração premiada (arts. 4º a 7º). A Operação Lava Jato começou em 2014 e usou amplamente esses acordos.",
    claims: [{ kind: "fato_documentado", text: "A Operação Lava Jato teve início em março de 2014, após a sanção da lei." }],
    tags: ["delação", "lava jato"],
    options: [G.dilma, G.temer, G.lula12, G.bolsonaro],
    correct: 0,
    sources: [
      { title: "Lei nº 12.850, de 2 de agosto de 2013", url: `${P}/_ato2011-2014/2013/lei/l12850.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2013-08-02" },
    ],
    legislation: [{ title: "Lei nº 12.850/2013", article: "Arts. 4º a 7º", url: `${P}/_ato2011-2014/2013/lei/l12850.htm`, relevance: "Regras da colaboração premiada." }],
  }),
  law("marco-civil-da-internet", {
    title: "Marco Civil da Internet",
    question_text: "O Marco Civil da Internet (Lei 12.965), que estabelece direitos e deveres no uso da internet no Brasil, foi sancionado em qual governo?",
    category: "liberdade-de-expressao",
    difficulty: "medio",
    period: "2014",
    short_explanation: "Sancionado em 23/4/2014 por Dilma Rousseff.",
    long_explanation:
      "A Lei nº 12.965/2014 estabelece princípios como neutralidade de rede e regras de responsabilidade de provedores por conteúdo de terceiros. O art. 19 — que trata da responsabilização de plataformas — foi objeto de julgamento no STF anos depois.",
    claims: [{ kind: "decisao_judicial", text: "O art. 19 foi analisado pelo STF em julgamento sobre responsabilidade das plataformas (consulte a fonte oficial do STF para o estado atual)." }],
    tags: ["internet", "plataformas"],
    options: [G.dilma, G.lula12, G.temer, G.bolsonaro],
    correct: 0,
    sources: [
      { title: "Lei nº 12.965, de 23 de abril de 2014", url: `${P}/_ato2011-2014/2014/lei/l12965.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2014-04-23" },
    ],
    legislation: [{ title: "Lei nº 12.965/2014", article: "Art. 19", url: `${P}/_ato2011-2014/2014/lei/l12965.htm`, relevance: "Responsabilidade de provedores por conteúdo de terceiros." }],
  }),
  law("lei-antiterrorismo", {
    title: "Lei Antiterrorismo",
    question_text: "A Lei Antiterrorismo (Lei 13.260), que tipificou o crime de terrorismo no Brasil, foi sancionada em qual governo?",
    category: "justica-e-instituicoes",
    difficulty: "dificil",
    period: "2016",
    short_explanation: "Sancionada em 16/3/2016 por Dilma Rousseff.",
    long_explanation:
      "A Lei nº 13.260/2016 regulamenta o inciso XLIII do art. 5º da Constituição, define terrorismo e trata de investigação e processo. O texto exclui expressamente manifestações políticas e movimentos sociais (art. 2º, § 2º), ponto que foi debatido durante a tramitação.",
    claims: [{ kind: "controversia", text: "Movimentos sociais criticaram o projeto durante a tramitação; o texto final incluiu ressalva no art. 2º, § 2º." }],
    tags: ["terrorismo", "olimpíadas"],
    options: [G.dilma, G.temer, G.bolsonaro, G.lula12],
    correct: 0,
    sources: [
      { title: "Lei nº 13.260, de 16 de março de 2016", url: `${P}/_ato2015-2018/2016/lei/l13260.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2016-03-16" },
    ],
    legislation: [{ title: "Lei nº 13.260/2016", article: "Art. 2º, § 2º", url: `${P}/_ato2015-2018/2016/lei/l13260.htm`, relevance: "Ressalva sobre manifestações e movimentos sociais." }],
  }),
  law("lei-das-estatais", {
    title: "Lei das Estatais",
    question_text: "A Lei das Estatais (Lei 13.303), com regras de governança e indicação de diretores de empresas públicas, foi sancionada em qual governo?",
    category: "estatais-e-empresas",
    difficulty: "dificil",
    period: "2016",
    short_explanation: "Sancionada em 30/6/2016 por Michel Temer, então presidente interino.",
    long_explanation:
      "A Lei nº 13.303/2016 trata do estatuto jurídico das empresas públicas e sociedades de economia mista, incluindo requisitos e vedações para indicação de administradores. Em 30/6/2016, Dilma Rousseff estava afastada pelo processo de impeachment e Temer exercia a Presidência interinamente.",
    claims: [{ kind: "fato_documentado", text: "Na data da sanção, Temer exercia a Presidência como interino; o impeachment foi concluído em 31/8/2016." }],
    tags: ["estatais", "governança"],
    options: [G.temer, G.dilma, G.bolsonaro, G.lula3],
    correct: 0,
    sources: [
      { title: "Lei nº 13.303, de 30 de junho de 2016", url: `${P}/_ato2015-2018/2016/lei/l13303.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2016-06-30" },
    ],
    legislation: [{ title: "Lei nº 13.303/2016", article: "Art. 17", url: `${P}/_ato2015-2018/2016/lei/l13303.htm`, relevance: "Requisitos e vedações para administradores." }],
  }),
  law("teto-de-gastos", {
    title: "Teto de gastos (EC 95)",
    question_text: "A Emenda Constitucional do teto de gastos (EC 95) foi promulgada em qual governo?",
    category: "economia",
    difficulty: "medio",
    period: "2016",
    short_explanation: "Promulgada em 15/12/2016, durante o governo Temer.",
    long_explanation:
      "Emendas constitucionais não passam por sanção presidencial: são promulgadas pelas Mesas da Câmara e do Senado. A EC 95, proposta pelo governo Temer, instituiu o Novo Regime Fiscal, limitando o crescimento das despesas primárias. Foi depois substituída pelo regime da LC 200/2023.",
    claims: [{ kind: "fato_documentado", text: "A proposta foi enviada pelo Executivo; a promulgação é ato do Congresso." }],
    tags: ["teto", "contas públicas"],
    options: [G.temer, G.dilma, G.bolsonaro, G.fhc],
    correct: 0,
    sources: [
      { title: "Emenda Constitucional nº 95, de 15 de dezembro de 2016", url: `${P}/constituicao/emendas/emc/emc95.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2016-12-15" },
    ],
    legislation: [{ title: "EC nº 95/2016", url: `${P}/constituicao/emendas/emc/emc95.htm` }],
  }),
  law("reforma-trabalhista", {
    title: "Reforma Trabalhista",
    question_text: "A Reforma Trabalhista (Lei 13.467), que alterou mais de cem pontos da CLT, foi sancionada em qual governo?",
    category: "economia",
    difficulty: "facil",
    period: "2017",
    short_explanation: "Sancionada em 13/7/2017 por Michel Temer.",
    long_explanation:
      "A Lei nº 13.467/2017 alterou a CLT em temas como prevalência do negociado sobre o legislado, trabalho intermitente e fim da contribuição sindical obrigatória.",
    tags: ["clt", "trabalho"],
    options: [G.temer, G.bolsonaro, G.dilma, G.lula3],
    correct: 0,
    sources: [
      { title: "Lei nº 13.467, de 13 de julho de 2017", url: `${P}/_ato2015-2018/2017/lei/l13467.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2017-07-13" },
    ],
    legislation: [{ title: "Lei nº 13.467/2017", url: `${P}/_ato2015-2018/2017/lei/l13467.htm` }],
  }),
  law("lgpd", {
    title: "Lei Geral de Proteção de Dados",
    question_text: "A LGPD (Lei 13.709), que regula o tratamento de dados pessoais, foi sancionada em qual governo?",
    category: "direitos-e-liberdades",
    difficulty: "medio",
    period: "2018",
    short_explanation: "Sancionada em 14/8/2018 por Michel Temer.",
    long_explanation:
      "A Lei nº 13.709/2018 estabelece regras para coleta e tratamento de dados pessoais por empresas e pelo poder público. Entrou em vigor de forma escalonada nos anos seguintes.",
    tags: ["dados", "privacidade"],
    options: [G.temer, G.bolsonaro, G.dilma, G.lula3],
    correct: 0,
    sources: [
      { title: "Lei nº 13.709, de 14 de agosto de 2018", url: `${P}/_ato2015-2018/2018/lei/l13709.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2018-08-14" },
    ],
    legislation: [{ title: "Lei nº 13.709/2018", url: `${P}/_ato2015-2018/2018/lei/l13709.htm` }],
  }),
  law("abuso-de-autoridade", {
    title: "Nova Lei de Abuso de Autoridade",
    question_text: "A nova Lei de Abuso de Autoridade (Lei 13.869) foi sancionada em qual governo?",
    category: "justica-e-instituicoes",
    difficulty: "dificil",
    period: "2019",
    short_explanation: "Sancionada com vetos em 5/9/2019 por Jair Bolsonaro.",
    long_explanation:
      "A Lei nº 13.869/2019 define crimes de abuso de autoridade cometidos por agentes públicos. O presidente vetou parte dos dispositivos; o Congresso derrubou vetos posteriormente. A lei foi assinada também pelo então ministro da Justiça, Sergio Moro.",
    claims: [{ kind: "fato_documentado", text: "A lei foi sancionada com vetos parciais, e parte deles foi derrubada pelo Congresso." }],
    tags: ["abuso de autoridade", "vetos"],
    options: [G.bolsonaro, G.temer, G.dilma, G.lula3],
    correct: 0,
    sources: [
      { title: "Lei nº 13.869, de 5 de setembro de 2019", url: `${P}/_ato2019-2022/2019/lei/l13869.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2019-09-05" },
    ],
    legislation: [{ title: "Lei nº 13.869/2019", url: `${P}/_ato2019-2022/2019/lei/l13869.htm` }],
  }),
  law("reforma-da-previdencia", {
    title: "Reforma da Previdência (EC 103)",
    question_text: "A Reforma da Previdência que fixou idade mínima de aposentadoria (EC 103) foi promulgada em qual governo?",
    category: "economia",
    difficulty: "facil",
    period: "2019",
    short_explanation: "Promulgada pelo Congresso em 12/11/2019, durante o governo Bolsonaro.",
    long_explanation:
      "A EC 103/2019 alterou o sistema de previdência, instituindo idade mínima e novas regras de cálculo. Como toda emenda, foi promulgada pelas Mesas da Câmara e do Senado, não sancionada pelo presidente.",
    tags: ["previdência", "aposentadoria"],
    options: [G.bolsonaro, G.temer, G.dilma, G.lula3],
    correct: 0,
    sources: [
      { title: "Emenda Constitucional nº 103, de 12 de novembro de 2019", url: `${P}/constituicao/emendas/emc/emc103.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2019-11-12" },
    ],
    legislation: [{ title: "EC nº 103/2019", url: `${P}/constituicao/emendas/emc/emc103.htm` }],
  }),
  law("pacote-anticrime", {
    title: "Pacote Anticrime",
    question_text: "O Pacote Anticrime (Lei 13.964), que criou a figura do juiz das garantias, foi sancionado em qual governo?",
    category: "justica-e-instituicoes",
    difficulty: "medio",
    period: "2019",
    short_explanation: "Sancionado em 24/12/2019 por Jair Bolsonaro.",
    long_explanation:
      "A Lei nº 13.964/2019 alterou a legislação penal e processual penal. O texto aprovado pelo Congresso incluiu o juiz das garantias, que não constava da proposta original do Ministério da Justiça. A implementação do juiz das garantias foi questionada no STF.",
    claims: [{ kind: "decisao_judicial", text: "A constitucionalidade do juiz das garantias foi discutida no STF (consulte a decisão oficial para o estado atual)." }],
    tags: ["processo penal", "juiz das garantias"],
    options: [G.bolsonaro, G.temer, G.lula3, G.dilma],
    correct: 0,
    sources: [
      { title: "Lei nº 13.964, de 24 de dezembro de 2019", url: `${P}/_ato2019-2022/2019/lei/l13964.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2019-12-24" },
    ],
    legislation: [{ title: "Lei nº 13.964/2019", url: `${P}/_ato2019-2022/2019/lei/l13964.htm` }],
  }),
  law("marco-do-saneamento", {
    title: "Novo Marco do Saneamento",
    question_text: "O Novo Marco Legal do Saneamento Básico (Lei 14.026), que abriu espaço para concessões privadas, foi sancionado em qual governo?",
    category: "estatais-e-empresas",
    difficulty: "medio",
    period: "2020",
    short_explanation: "Sancionado em 15/7/2020 por Jair Bolsonaro.",
    long_explanation:
      "A Lei nº 14.026/2020 atualizou o marco legal do saneamento, com metas de universalização e regras que favorecem licitação e concorrência na prestação dos serviços.",
    tags: ["saneamento", "concessões"],
    options: [G.bolsonaro, G.temer, G.lula3, G.dilma],
    correct: 0,
    sources: [
      { title: "Lei nº 14.026, de 15 de julho de 2020", url: `${P}/_ato2019-2022/2020/lei/l14026.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2020-07-15" },
    ],
    legislation: [{ title: "Lei nº 14.026/2020", url: `${P}/_ato2019-2022/2020/lei/l14026.htm` }],
  }),
  law("autonomia-banco-central", {
    title: "Autonomia do Banco Central",
    question_text: "A lei que deu autonomia formal ao Banco Central, com mandatos fixos para a diretoria (LC 179), foi sancionada em qual governo?",
    category: "economia",
    difficulty: "medio",
    period: "2021",
    short_explanation: "Sancionada em 24/2/2021 por Jair Bolsonaro.",
    long_explanation:
      "A Lei Complementar nº 179/2021 define objetivos do Banco Central e estabelece mandatos para presidente e diretores, não coincidentes com o mandato do presidente da República.",
    tags: ["banco central", "juros"],
    options: [G.bolsonaro, G.temer, G.lula3, G.fhc],
    correct: 0,
    sources: [
      { title: "Lei Complementar nº 179, de 24 de fevereiro de 2021", url: `${P}/leis/lcp/lcp179.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2021-02-24" },
    ],
    legislation: [{ title: "Lei Complementar nº 179/2021", url: `${P}/leis/lcp/lcp179.htm` }],
  }),
  law("arcabouco-fiscal", {
    title: "Arcabouço fiscal",
    question_text: "O novo arcabouço fiscal (LC 200), que substituiu o teto de gastos, foi sancionado em qual governo?",
    category: "economia",
    difficulty: "medio",
    period: "2023",
    short_explanation: "Sancionado em 30/8/2023 por Lula.",
    long_explanation:
      "A Lei Complementar nº 200/2023 instituiu o Regime Fiscal Sustentável, com limites de crescimento de despesa vinculados à receita e metas de resultado primário. Foi assinada por Lula e pelo ministro da Fazenda Fernando Haddad.",
    tags: ["contas públicas", "regra fiscal"],
    options: [G.lula3, G.bolsonaro, G.temer, G.dilma],
    correct: 0,
    sources: [
      { title: "Lei Complementar nº 200, de 30 de agosto de 2023", url: `${P}/leis/lcp/lcp200.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2023-08-30" },
    ],
    legislation: [{ title: "Lei Complementar nº 200/2023", url: `${P}/leis/lcp/lcp200.htm` }],
  }),
  law("reforma-tributaria", {
    title: "Reforma Tributária (EC 132)",
    question_text: "A Reforma Tributária sobre o consumo, que criou IBS e CBS (EC 132), foi promulgada em qual governo?",
    category: "economia",
    difficulty: "medio",
    period: "2023",
    short_explanation: "Promulgada pelo Congresso em 20/12/2023, durante o terceiro governo Lula.",
    long_explanation:
      "A EC 132/2023 substitui tributos sobre consumo (PIS, Cofins, IPI, ICMS e ISS) por um IVA dual: CBS (federal) e IBS (estados e municípios), com transição longa. Como emenda, foi promulgada pelas Mesas do Congresso.",
    tags: ["impostos", "iva"],
    options: [G.lula3, G.bolsonaro, G.temer, G.dilma],
    correct: 0,
    sources: [
      { title: "Emenda Constitucional nº 132, de 20 de dezembro de 2023", url: `${P}/constituicao/emendas/emc/emc132.htm`, source_type: "primaria", publisher: "Planalto", publication_date: "2023-12-20" },
    ],
    legislation: [{ title: "EC nº 132/2023", url: `${P}/constituicao/emendas/emc/emc132.htm` }],
  }),
];

export const SEED_QUESTIONS: SeedQuestion[] = [...QUEM_DISSE, ...FATOS, ...LAW_QUESTIONS];
