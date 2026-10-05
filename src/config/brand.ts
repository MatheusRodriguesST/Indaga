/**
 * Marca do projeto. Nome provisório — veja as opções no README
 * (seção "Marca"). Trocar aqui reflete em todo o site.
 */
export const BRAND = {
  name: "GABARITO",
  tagline: "Pergunte. Verifique. Questione.",
  description:
    "5 perguntas sobre acontecimentos documentados da política brasileira. Responda, descubra e confira as fontes.",
} as const;

export const QUIZ_CONFIG = {
  /** Quantidade de perguntas por desafio (seção 43 — configurável). */
  quizSize: Number(process.env.NEXT_PUBLIC_QUIZ_SIZE ?? 5),
  /**
   * Coleção sorteada em /desafio. "quem-disse" = frases e medidas;
   * "leis" = quem sancionou cada lei. Vazio = todas as publicadas.
   * /desafio/<coleção> joga uma coleção específica (ex.: /desafio/leis).
   */
  collection: process.env.QUIZ_COLLECTION ?? "quem-disse",
  /** Quantas perguntas recentes o navegador lembra para evitar repetição. */
  recentMemory: 30,
} as const;
