/**
 * Números da página /banco. Cada série tem fonte e data de consulta.
 * Consultado em 05/10/2026. Para atualizar a dívida, rode:
 *   curl "https://api.bcb.gov.br/dados/serie/bcdata.sgs.13762/dados?formato=json&dataInicial=01/12/2018"
 */

export type Gov = "bolsonaro" | "lula";

export interface Point {
  label: string;
  value: number;
  gov: Gov;
  note?: string;
}

export interface Series {
  id: string;
  title: string;
  unit: string;
  /** Casas decimais para exibir. */
  decimals: number;
  headline: { value: string; text: string };
  points: Point[];
  /** Anos de pandemia, destacados no gráfico. */
  pandemic?: string[];
  context: string;
  sources: { title: string; url: string; publisher: string }[];
}

export const GOV_LABEL: Record<Gov, string> = {
  bolsonaro: "Bolsonaro (2019–2022)",
  lula: "Lula 3 (2023– )",
};

export const SERIES: Series[] = [
  {
    id: "divida",
    title: "Dívida bruta do governo geral",
    unit: "% do PIB",
    decimals: 1,
    headline: { value: "+11,2 p.p.", text: "de alta da dívida desde que Lula assumiu (71,7% → 82,9% do PIB)" },
    points: [
      { label: "2018", value: 75.27, gov: "bolsonaro", note: "Dívida recebida por Bolsonaro (dez/2018)" },
      { label: "2019", value: 74.44, gov: "bolsonaro" },
      { label: "2020", value: 86.94, gov: "bolsonaro", note: "Pandemia: auxílio emergencial e queda do PIB" },
      { label: "2021", value: 77.31, gov: "bolsonaro" },
      { label: "2022", value: 71.68, gov: "bolsonaro", note: "Dívida entregue por Bolsonaro" },
      { label: "2023", value: 73.83, gov: "lula" },
      { label: "2024", value: 76.27, gov: "lula" },
      { label: "2025", value: 78.64, gov: "lula" },
      { label: "ago/26", value: 82.86, gov: "lula", note: "Último dado disponível" },
    ],
    pandemic: ["2020", "2021"],
    context:
      "Mesmo com a pandemia, Bolsonaro entregou a dívida abaixo de onde a recebeu (75,3% → 71,7%). A inflação alta de 2021–22 ajudou nessa queda; desde 2023, os juros altos pesam na alta.",
    sources: [
      { title: "Série 13762 — DBGG (% PIB), dados de dezembro de cada ano", url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.13762/dados?formato=json&dataInicial=01/12/2018", publisher: "Banco Central do Brasil" },
      { title: "Dívida pública bruta fecha 2025 em 78,7% do PIB", url: "https://diariodocomercio.com.br/economia/divida-publica-bruta-brasil-sobe-fecha-2025-787-pib-mostra-bc/", publisher: "Diário do Comércio" },
    ],
  },
  {
    id: "rj",
    title: "Pedidos de recuperação judicial",
    unit: "pedidos por ano",
    decimals: 0,
    headline: { value: "2.273", text: "pedidos em 2024 — recorde da série iniciada em 2005" },
    points: [
      { label: "2019", value: 1387, gov: "bolsonaro" },
      { label: "2020", value: 1179, gov: "bolsonaro" },
      { label: "2021", value: 891, gov: "bolsonaro" },
      { label: "2022", value: 833, gov: "bolsonaro" },
      { label: "2023", value: 1405, gov: "lula" },
      { label: "2024", value: 2273, gov: "lula", note: "Recorde histórico" },
    ],
    pandemic: ["2020", "2021"],
    context:
      "Em 2025, o número de empresas em recuperação judicial subiu mais 12,9% (2.466 empresas, maior desde 2012). Na pandemia, programas de crédito emergencial seguraram os pedidos; em 2023–24, o crédito caro pesou.",
    sources: [
      { title: "Pedidos de recuperação judicial em 2024: maior número da série", url: "https://www.serasaexperian.com.br/sala-de-imprensa/analise-de-dados/brasil-registra-22-mil-pedidos-de-recuperacao-judicial-em-2024-o-maior-numero-da-serie-historica-aponta-serasa-experian/", publisher: "Serasa Experian" },
      { title: "Pedidos de recuperação judicial caem 6,5% em 2022", url: "https://www.serasaexperian.com.br/sala-de-imprensa/analise-de-dados/pedidos-de-recuperacao-judicial-caem-65-em-2022-mostra-serasa-experian", publisher: "Serasa Experian" },
      { title: "Pedidos de recuperação judicial caem 24,4% em 2021", url: "https://www.serasaexperian.com.br/sala-de-imprensa/indicadores/pedidos-de-recuperacao-judicial-caem-244-em-2021-ponta-serasa-experian/", publisher: "Serasa Experian" },
      { title: "Recuperação judicial tem queda de 15% em 2020", url: "https://www.serasaexperian.com.br/sala-de-imprensa/noticias/recuperacao-judicial-tem-queda-de-15-em-2020-revela-serasa-experian/", publisher: "Serasa Experian" },
      { title: "Recuperação judicial cresce em 2025 e atinge maior nº desde 2012", url: "https://www.infomoney.com.br/business/serasa-experian-recuperacao-judicial-cresce-em-2025-e-atinge-maior-no-desde-2012/", publisher: "InfoMoney" },
    ],
  },
  {
    id: "inadimplencia",
    title: "Brasileiros inadimplentes (nome sujo)",
    unit: "milhões de pessoas",
    decimals: 1,
    headline: { value: "81,2 mi", text: "de inadimplentes no fim de 2025 — quase metade (49,7%) dos adultos" },
    points: [
      { label: "dez/22", value: 69.4, gov: "bolsonaro", note: "Fim do governo Bolsonaro" },
      { label: "dez/25", value: 81.2, gov: "lula", note: "Recorde histórico" },
    ],
    context: "Alta de 11,8 milhões de pessoas em três anos. As dívidas negativadas somavam cerca de R$ 511 bilhões no fim de 2025.",
    sources: [
      { title: "Inadimplência registra a primeira queda depois de 11 meses de alta (dado de dez/2022)", url: "https://www.serasa.com.br/imprensa/inadimplencia-no-pais-registra-a-primeira-queda-depois-de-11-meses-de-alta/", publisher: "Serasa" },
      { title: "Brasil fechou o ano com 50% da população adulta inadimplente", url: "https://monitormercantil.com.br/brasil-fechou-ano-com-50-da-populacao-adulta-inadimplente/", publisher: "Monitor Mercantil (dados Serasa)" },
    ],
  },
];

export const PANDEMIA = {
  pib2020: "-3,3%",
  text: "Em 2020, a covid-19 fechou comércio, escolas e fronteiras no mundo inteiro. O PIB brasileiro caiu 3,3% — menos que a média mundial (-4,1%) — e a dívida subiu para pagar auxílio emergencial e socorro a empresas. Ainda assim, em 2022 a dívida já estava abaixo do nível pré-pandemia.",
  sources: [
    { title: "IBGE revisa queda do PIB de 2020 para 3,3%", url: "https://www.opovo.com.br/noticias/economia/2022/11/04/ibge-revisa-queda-do-pib-de-2020-para-33.html", publisher: "O Povo (dados IBGE)" },
  ],
};
