/**
 * Coleção "quem-disse" — formato pegadinha.
 *
 * Nenhuma das 4 alternativas é a correta: depois da resposta, o dossiê revela
 * quem realmente disse (ou assinou), com data, contexto e reportagem.
 *
 * Regras seguidas aqui:
 *  - frase reproduzida como publicada pelo veículo citado (sem "melhorar");
 *  - contexto completo, inclusive defesa, explicação ou pedido de desculpas;
 *  - notícia-crime/representação ≠ denúncia ≠ condenação.
 * Pesquisado em 05/10/2026. Revise os links antes de divulgar.
 */
import type { ClaimKind, Difficulty, SourceType } from "@/types/domain";
import type { SeedQuestion } from "./seed";

const LULA = "Luiz Inácio Lula da Silva (PT)";
const NOTE = "Frase, data e contexto conferidos na reportagem citada em 05/10/2026.";

type Src = { title: string; url: string; source_type?: SourceType; publisher: string; publication_date: string | null };

function said(
  slug: string,
  q: {
    title: string;
    quote: string;
    /** Complemento da pergunta (padrão: "Quem disse isso?") */
    ask?: string;
    period: string;
    difficulty?: Difficulty;
    options: [string, string, string, string];
    short: string;
    long: string;
    claims?: { kind: ClaimKind; text: string }[];
    legal_status?: string;
    sources: Src[];
    tags: string[];
  },
): SeedQuestion {
  return {
    slug,
    title: q.title,
    question_text: `“${q.quote}” ${q.ask ?? "Quem disse isso?"}`,
    category: "declaracoes",
    difficulty: q.difficulty ?? "medio",
    period: q.period,
    short_explanation: q.short,
    long_explanation: q.long,
    legal_status: q.legal_status ?? "Declaração pública registrada pela imprensa. Não envolve processo judicial.",
    legal_status_kind: "fato_documentado",
    claims: q.claims ?? [],
    tags: q.tags,
    options: q.options,
    correct: null,
    reveal_answer: LULA,
    collection: "quem-disse",
    sources: q.sources.map((s) => ({ source_type: "jornalistica", ...s })),
    legislation: [],
    editorial_notes: NOTE,
  };
}

export const QUEM_DISSE: SeedQuestion[] = [
  said("quem-disse-coronavirus-monstro", {
    title: "“Ainda bem” que surgiu o coronavírus",
    quote: "Ainda bem que a natureza, contra a vontade da humanidade, criou esse monstro chamado coronavírus.",
    period: "2020",
    options: ["Jair Bolsonaro", "Olavo de Carvalho", "Eduardo Bolsonaro", "Damares Alves"],
    short: "Foi Lula, então ex-presidente, em entrevista à CartaCapital publicada em 19/05/2020, no início da pandemia.",
    long:
      "Lula usava a pandemia para criticar a agenda de privatizações: disse que o vírus estava fazendo “os cegos enxergarem” que só o Estado é capaz de resolver certas crises. A frase repercutiu mal e, no dia seguinte (20/05/2020), ele pediu desculpas: “Usei uma frase totalmente infeliz”. Disse que deveria ter falado “infelizmente” em vez de “ainda bem”.",
    claims: [
      { kind: "fato_documentado", text: "Declaração dada em entrevista à CartaCapital (maio de 2020)." },
      { kind: "fato_documentado", text: "No dia seguinte, Lula pediu desculpas publicamente pela frase." },
    ],
    sources: [
      { title: "Lula pede desculpas após ter enaltecido a natureza pela criação do “monstro” do coronavírus", url: "https://jornaldebrasilia.com.br/noticias/politica-e-poder/lula-pede-desculpas-apos-ter-enaltecido-a-natureza-pela-criacao-do-monstro-do-coronavirus/", publisher: "Jornal de Brasília", publication_date: "2020-05-20" },
      { title: "Lula pede desculpas por usar frase “infeliz” ao falar sobre coronavírus", url: "https://www.agazeta.com.br/brasil/lula-pede-desculpas-por-usar-frase-infeliz-ao-falar-sobre-coronavirus-0520", publisher: "A Gazeta", publication_date: "2020-05-20" },
    ],
    tags: ["pandemia", "covid"],
  }),

  said("quem-disse-pelotas", {
    title: "Piada sobre Pelotas",
    quote: "Pelotas é cidade polo, né? […] exportador de v…",
    ask: "Na campanha de 2000, um político foi filmado completando a frase com um termo ofensivo a homossexuais. Quem foi?",
    period: "2000",
    difficulty: "dificil",
    options: ["Paulo Maluf", "Enéas Carneiro", "Jair Bolsonaro", "Roberto Jefferson"],
    short: "Foi Lula, em 2000, brincando com Fernando Marroni, candidato do PT a prefeito de Pelotas (RS), sem saber que estava sendo filmado.",
    long:
      "O vídeo foi exibido primeiro em Pelotas pela candidata adversária Leila Fetter (PPB) e depois três vezes no horário eleitoral de Paulo Maluf em São Paulo. O PT disse que a gravação havia sido “roubada”, e a Justiça Eleitoral suspendeu sua exibição em Pelotas. A reportagem do Diário do Grande ABC reproduz a frase com o termo ofensivo abreviado.",
    claims: [{ kind: "fato_documentado", text: "O vídeo foi exibido no horário eleitoral de Paulo Maluf em outubro de 2000." }],
    sources: [
      { title: "SP: piada de Lula sobre gays marca fim do horário eleitoral", url: "https://www.dgabc.com.br/Noticia/148561/sp-piada-de-lula-sobre-gays-marca-fim-do-horario-eleitoral", publisher: "Diário do Grande ABC", publication_date: "2000-10-27" },
    ],
    tags: ["homofobia", "eleição 2000"],
  }),

  said("quem-disse-sem-dente-e-negro", {
    title: "“Um cara sem dente e ainda negro”",
    quote: "Um cara sem dente e ainda negro.",
    ask: "Quem disse isso ao comentar a foto de uma revista do governo?",
    period: "2025",
    options: ["Jair Bolsonaro", "Flávio Bolsonaro", "Nikolas Ferreira", "Pablo Marçal"],
    short: "Foi Lula, em 21/08/2025, em Sorocaba (SP), na entrega de unidades odontológicas móveis.",
    long:
      "Lula contava que mandou tirar de uma revista de divulgação do governo, levada a um congresso na Alemanha, a foto de um homem negro sem dentes. Na sequência perguntou: “Você não acha que isso é preconceito?” — ou seja, ele dizia criticar a escolha da imagem. A forma como se expressou foi vista como racista por parlamentares de oposição. A ministra da Igualdade Racial, Anielle Franco, defendeu a fala como crítica ao estigma sobre pessoas negras.",
    claims: [
      { kind: "controversia", text: "Governo e aliados: crítica ao preconceito na escolha da foto. Oposição: fala racista." },
      { kind: "alegacao", text: "O deputado Helio Lopes (PL-RJ) apresentou notícia-crime à PGR acusando o presidente de racismo." },
    ],
    legal_status: "Notícia-crime apresentada por deputado à PGR. Isso é uma representação, não uma denúncia nem uma condenação.",
    sources: [
      { title: "“Um cara sem dente e ainda negro”, reclama Lula de foto do governo", url: "https://www.poder360.com.br/poder-governo/um-cara-sem-dente-e-ainda-negro-reclama-lula-de-foto-do-governo/", publisher: "Poder360", publication_date: "2025-08-23" },
      { title: "Lula é alvo de notícia-crime por fala vista como racista pela oposição", url: "https://www.gazetadopovo.com.br/republica/lula-alvo-noticia-crime-fala-vista-racista-oposicao/", publisher: "Gazeta do Povo", publication_date: null },
    ],
    tags: ["racismo", "propaganda"],
  }),

  said("quem-disse-batuque", {
    title: "“Afrodescendente gosta de um batuque”",
    quote: "Uma afrodescendente assim gosta de um batuque, de um tambor.",
    ask: "Quem disse isso a uma jovem negra premiada, num evento numa fábrica?",
    period: "2024",
    options: ["Jair Bolsonaro", "Eduardo Bolsonaro", "Hamilton Mourão", "Damares Alves"],
    short: "Foi Lula, em 02/02/2024, na fábrica da Volkswagen em São Bernardo do Campo (SP).",
    long:
      "Lula chamou ao palco Luiza Eduarda Leôncio, eleita a melhor aprendiz da montadora, e contou que tinha imaginado que ela estava ali para cantar ou tocar algo, “porque uma afrodescendente assim gosta de um batuque, de um tambor”. A Secom disse que o presidente estava exemplificando estereótipos para criticá-los, já que a jovem estava ali por mérito profissional. Parlamentares de oposição acusaram racismo.",
    claims: [
      { kind: "controversia", text: "Secom: exemplo de estereótipo para criticá-lo. Oposição: fala racista." },
      { kind: "alegacao", text: "O deputado Paulo Bilynskyj (PL-SP) apresentou notícia-crime à PGR." },
    ],
    legal_status: "Notícia-crime apresentada por deputado. Não é denúncia nem condenação.",
    sources: [
      { title: "“Uma afrodescendente assim gosta de um batuque”, diz Lula em SP", url: "https://www.poder360.com.br/governo/uma-afrodescendente-assim-gosta-de-um-batuque-diz-lula-em-sp/", publisher: "Poder360", publication_date: "2024-02-03" },
      { title: "Lula é denunciado por dizer que jovem negra “gosta de um batuque”", url: "https://www.poder360.com.br/justica/lula-e-denunciado-por-dizer-que-jovem-negra-gosta-de-um-batuque/", publisher: "Poder360", publication_date: null },
    ],
    tags: ["racismo", "estereótipo"],
  }),

  said("quem-disse-gratidao-escravidao", {
    title: "Gratidão pelo que foi produzido na escravidão",
    quote: "Temos profunda gratidão ao continente africano por tudo o que foi produzido durante 350 anos de escravidão no nosso país.",
    period: "2023",
    options: ["Jair Bolsonaro", "Hamilton Mourão", "Ernesto Araújo", "Damares Alves"],
    short: "Foi Lula, em 19/07/2023, em Praia, Cabo Verde, depois de se reunir com o presidente José Maria Neves.",
    long:
      "A parada em Cabo Verde foi para abastecer o avião na volta da cúpula UE-Celac. Lula disse que o Brasil tem uma dívida com a África pelos séculos de escravidão e que ela deveria ser paga com formação e educação de estudantes africanos. A escolha das palavras (“gratidão” pelo que foi “produzido”) foi criticada; o então ministro Silvio Almeida defendeu o presidente.",
    claims: [{ kind: "controversia", text: "Defensores: reconhecimento da dívida histórica. Críticos: frase tratou a escravidão como “produção”." }],
    sources: [
      { title: "Somos gratos à África pelo que foi produzido na escravidão, diz Lula", url: "https://www.poder360.com.br/governo/somos-gratos-a-africa-pelo-que-foi-produzido-na-escravidao-diz-lula/", publisher: "Poder360", publication_date: "2023-07-19" },
      { title: "Silvio Almeida defende Lula em declaração sobre escravidão", url: "https://www.poder360.com.br/governo/silvio-almeida-defende-lula-em-declaracao-sobre-escravidao/", publisher: "Poder360", publication_date: null },
    ],
    tags: ["escravidão", "áfrica"],
  }),

  said("quem-disse-corintiano", {
    title: "Violência doméstica e futebol",
    quote: "Se o cara é corintiano, tudo bem, como eu, mas eu não fico nervoso quando perco.",
    ask: "Quem disse isso ao comentar um estudo sobre aumento da violência contra a mulher depois de jogos de futebol?",
    period: "2024",
    options: ["Jair Bolsonaro", "Michel Temer", "Flávio Bolsonaro", "Tarcísio de Freitas"],
    short: "Foi Lula, em 16/07/2024, numa reunião no Palácio do Planalto.",
    long:
      "Lula comentava uma pesquisa que mostra aumento de agressões a mulheres depois de partidas de futebol e fez a brincadeira sobre o próprio time. Em 18/07/2024 a Secom afirmou que “em nenhum momento o presidente Lula endossa ou endossou a violência contra as mulheres”. Dias depois, ele disse que daria início a uma “guerra” contra a violência doméstica.",
    claims: [{ kind: "fato_documentado", text: "A Secom divulgou nota negando que o presidente tenha endossado violência contra mulheres." }],
    sources: [
      { title: "Secom diz que Lula não endossou violência contra mulheres", url: "https://www.poder360.com.br/governo/secom-diz-que-lula-nao-endossou-violencia-contra-mulheres/", publisher: "Poder360", publication_date: "2024-07-18" },
    ],
    tags: ["mulheres", "violência doméstica"],
  }),

  said("quem-disse-bater-em-mulher", {
    title: "“Vá bater em outro lugar”",
    quote: "Quer bater em mulher, vá bater em outro lugar, mas não dentro da sua casa ou no Brasil.",
    period: "2022",
    options: ["Jair Bolsonaro", "Roberto Jefferson", "Eduardo Bolsonaro", "Enéas Carneiro"],
    short: "Foi Lula, candidato, em comício no Vale do Anhangabaú (São Paulo), em 20/08/2022.",
    long:
      "Lula falava da Lei Maria da Penha (sancionada por ele em 2006) e dizia que a mão do homem foi feita para trabalhar e fazer carinho, não para bater em mulher. A conclusão da frase foi criticada como machista e virou munição na campanha. A presidente do PT, Gleisi Hoffmann, chamou-a de “frase mal colocada”.",
    claims: [{ kind: "controversia", text: "Aliados: frase mal colocada num discurso contra a violência. Críticos: fala machista." }],
    sources: [
      { title: "“Quer bater em mulher, vá para outro lugar”, diz Lula", url: "https://www.poder360.com.br/eleicoes/quer-bater-em-mulher-va-para-outro-lugar-diz-lula", publisher: "Poder360", publication_date: "2022-08-20" },
    ],
    tags: ["mulheres", "eleição 2022"],
  }),

  said("quem-disse-batom", {
    title: "Batom e o pai",
    quote: "Não vai ficar dependente: ‘ah, eu preciso do meu pai me dar 5 reais para comprar batom’.",
    ask: "Quem disse isso falando sobre mulheres que não têm profissão?",
    period: "2024",
    options: ["Jair Bolsonaro", "Michel Temer", "Damares Alves", "Hamilton Mourão"],
    short: "Foi Lula, em 12/03/2024, no Planalto, no anúncio de 100 novos campi de institutos federais.",
    long:
      "Lula defendia que ter uma profissão dá independência financeira às mulheres. No mesmo trecho mencionou também precisar do pai para comprar calcinha. A forma de falar repercutiu negativamente nas redes.",
    sources: [
      { title: "“Mais apaixonado por amante”, “parar de ter filho”: as gafes de Lula no terceiro mandato", url: "https://www.folhape.com.br/politica/mais-apaixonado-por-amante-parar-de-ter-filho-as-gafes-de-lula/383294/", publisher: "Folha de Pernambuco", publication_date: "2025-01-09" },
      { title: "Relembre declarações controversas e lapsos de Lula no 3º mandato", url: "https://www.poder360.com.br/poder-gente/relembre-declaracoes-controversas-e-lapsos-de-lula-no-3o-mandato/", publisher: "Poder360", publication_date: null },
    ],
    tags: ["mulheres"],
  }),

  said("quem-disse-ajudante-geral", {
    title: "Ninguém quer namorar ajudante geral",
    quote: "Nenhuma mulher quer namorar com um cara que mostra a carteira profissional […] e tem a profissão ajudante geral.",
    period: "2024",
    options: ["Jair Bolsonaro", "Pablo Marçal", "Paulo Guedes", "Eduardo Bolsonaro"],
    short: "Foi Lula, em 07/02/2024, na inauguração de um ginásio do IFRJ no Complexo do Alemão (Rio de Janeiro).",
    long: "Ele usava o exemplo para defender a importância do estudo e da qualificação profissional para quem trabalha em fábrica.",
    sources: [
      { title: "Lula diz que “nenhuma mulher quer namorar” um ajudante geral", url: "https://www.cnnbrasil.com.br/politica/lula-diz-que-nenhuma-mulher-quer-namorar-um-ajudante-geral/", publisher: "CNN Brasil", publication_date: "2024-02-07" },
    ],
    tags: ["trabalho", "mulheres"],
  }),

  said("quem-disse-amante-da-democracia", {
    title: "Amante da democracia",
    quote: "Eu sou um amante da democracia. Não sou nem marido, eu sou amante, porque, na maioria das vezes, os amantes são mais apaixonados pela amante do que pelas mulheres.",
    period: "2025",
    options: ["Michel Temer", "Jair Bolsonaro", "Flávio Bolsonaro", "Fernando Collor"],
    short: "Foi Lula, em 08/01/2025, no Planalto, na cerimônia de dois anos dos ataques de 8 de janeiro.",
    long: "Foi um comentário improvisado no discurso sobre a defesa da democracia.",
    sources: [
      { title: "“Mais apaixonado por amante”, “parar de ter filho”: as gafes de Lula no terceiro mandato", url: "https://www.folhape.com.br/politica/mais-apaixonado-por-amante-parar-de-ter-filho-as-gafes-de-lula/383294/", publisher: "Folha de Pernambuco", publication_date: "2025-01-09" },
    ],
    tags: ["8 de janeiro", "mulheres"],
  }),

  said("quem-disse-parar-de-ter-filho", {
    title: "“Parar de ter filho”",
    quote: "A primeira coisa que você tem que fazer é parar de ter filho.",
    ask: "Quem disse isso a uma mãe de 25 anos com três filhos, numa entrega de casas populares?",
    period: "2024",
    options: ["Jair Bolsonaro", "Damares Alves", "Michelle Bolsonaro", "Paulo Guedes"],
    short: "Foi Lula, em junho de 2024, numa entrega do Minha Casa, Minha Vida em Fortaleza (CE).",
    long: "O comentário foi feito em público, durante a cerimônia, dirigido a uma das beneficiárias do programa.",
    sources: [
      { title: "“Mais apaixonado por amante”, “parar de ter filho”: as gafes de Lula no terceiro mandato", url: "https://www.folhape.com.br/politica/mais-apaixonado-por-amante-parar-de-ter-filho-as-gafes-de-lula/383294/", publisher: "Folha de Pernambuco", publication_date: "2025-01-09" },
    ],
    tags: ["mulheres", "habitação"],
  }),

  said("quem-disse-tanta-gente-negra-rs", {
    title: "Surpresa com gente negra no RS",
    quote: "Eu não tinha noção que aqui tinha tanta gente negra.",
    ask: "Quem disse isso durante uma visita ao Rio Grande do Sul?",
    period: "2024",
    options: ["Jair Bolsonaro", "Hamilton Mourão", "Onyx Lorenzoni", "Eduardo Leite"],
    short: "Foi Lula, em maio de 2024, numa visita ao Rio Grande do Sul durante as enchentes.",
    long: "O comentário foi dirigido à primeira-dama Janja enquanto o presidente anunciava ações de socorro às vítimas.",
    sources: [
      { title: "“Mais apaixonado por amante”, “parar de ter filho”: as gafes de Lula no terceiro mandato", url: "https://www.folhape.com.br/politica/mais-apaixonado-por-amante-parar-de-ter-filho-as-gafes-de-lula/383294/", publisher: "Folha de Pernambuco", publication_date: "2025-01-09" },
    ],
    tags: ["racismo", "enchentes"],
  }),

  said("quem-disse-traficantes-vitimas", {
    title: "Traficantes “vítimas dos usuários”",
    quote: "Os usuários são responsáveis pelos traficantes, que são vítimas dos usuários também.",
    period: "2025",
    options: ["Dilma Rousseff", "Fernando Henrique Cardoso", "Jair Bolsonaro", "Flávio Dino"],
    short: "Foi Lula, em 24/10/2025, em Jacarta (Indonésia), falando a jornalistas.",
    long:
      "Lula comentava as ações militares do governo Trump no Caribe, perto da Venezuela, ditas de combate ao narcotráfico, e disse que talvez fosse mais fácil combater o consumo interno. Horas depois, escreveu nas redes que a frase foi “mal colocada” e que sua posição “é muito clara contra os traficantes e o crime organizado”.",
    claims: [{ kind: "fato_documentado", text: "No mesmo dia, Lula se retratou e chamou a frase de “mal colocada”." }],
    sources: [
      { title: "Traficantes “são vítimas dos usuários” de drogas, diz Lula", url: "https://www.poder360.com.br/poder-governo/traficantes-sao-vitimas-dos-usuarios-de-drogas-diz-lula/", publisher: "Poder360", publication_date: "2025-10-24" },
      { title: "Lula diz que frase sobre traficantes serem vítimas de usuários foi mal colocada", url: "https://www.dgabc.com.br/Noticia/4265138/lula-diz-que-frase-sobre-traficantes-serem-vitimas-de-usuarios-foi-mal-colocada", publisher: "Diário do Grande ABC", publication_date: null },
    ],
    tags: ["drogas", "segurança pública"],
  }),

  said("quem-disse-gaza-hitler", {
    title: "Gaza comparada ao Holocausto",
    quote: "O que está acontecendo na Faixa de Gaza com o povo palestino não existe em nenhum outro momento histórico. Aliás, existiu, quando Hitler resolveu matar os judeus.",
    period: "2024",
    options: ["Dilma Rousseff", "Guilherme Boulos", "Ciro Gomes", "Jair Bolsonaro"],
    short: "Foi Lula, em 18/02/2024, em entrevista em Adis Abeba (Etiópia), após a cúpula da União Africana.",
    long:
      "A comparação provocou uma crise diplomática: Israel declarou Lula “persona non grata” e os dois países chamaram seus embaixadores para consultas. O premiê Benjamin Netanyahu disse que comparar Israel aos nazistas “cruza uma linha vermelha”.",
    claims: [{ kind: "fato_documentado", text: "Israel declarou Lula persona non grata após a declaração." }],
    sources: [
      { title: "“Trivialização do Holocausto”. Israel revoltado com Lula após acusações de genocídio", url: "https://rr.pt/noticia/mundo/2024/02/18/trivializacao-do-holocausto-israel-revoltado-com-lula-apos-acusacoes-de-genocidio/367299/", publisher: "Rádio Renascença", publication_date: "2024-02-18" },
      { title: "Netanyahu slams Brazil’s Lula for likening Gaza war to Holocaust", url: "https://www.businessday.co.za/bd/world/middle-east/2024-02-18-netanyahu-slams-brazils-lula-for-likening-gaza-war-to-holocaust/", publisher: "BusinessDay", publication_date: "2024-02-18" },
    ],
    tags: ["israel", "política externa"],
  }),

  said("quem-disse-democracia-relativa", {
    title: "Democracia é relativa",
    quote: "O conceito de democracia é relativo para você e para mim.",
    ask: "Quem disse isso ao ser questionado sobre a Venezuela?",
    period: "2023",
    options: ["Dilma Rousseff", "Jair Bolsonaro", "Ciro Gomes", "Eduardo Bolsonaro"],
    short: "Foi Lula, em 29/06/2023, em entrevista à Rádio Gaúcha.",
    long:
      "Perguntado por que parte da esquerda defende o regime de Nicolás Maduro, Lula disse também que “a Venezuela tem mais eleições do que o Brasil” e que gosta da democracia porque ela o levou três vezes à Presidência. O ministro do STF Gilmar Mendes rebateu: “o conceito de democracia não é relativo”.",
    sources: [
      { title: "Conceito de democracia é relativo, diz Lula sobre Venezuela", url: "https://www.poder360.com.br/governo/conceito-de-democracia-e-relativo-diz-lula-sobre-venezuela/", publisher: "Poder360", publication_date: "2023-06-30" },
      { title: "“Conceito de democracia não é relativo”, diz Gilmar Mendes", url: "https://www.poder360.com.br/justica/conceito-de-democracia-nao-e-relativo-diz-gilmar-mendes/", publisher: "Poder360", publication_date: null },
    ],
    tags: ["venezuela", "democracia"],
  }),

  said("quem-disse-olhos-azuis", {
    title: "Crise de gente branca de olhos azuis",
    quote: "É uma crise causada, fomentada, por comportamentos irracionais de gente branca, de olhos azuis, que antes da crise parecia que sabia tudo e que agora demonstram não saber nada.",
    period: "2009",
    difficulty: "dificil",
    options: ["Dilma Rousseff", "Enéas Carneiro", "Ciro Gomes", "Jair Bolsonaro"],
    short: "Foi Lula, presidente, em 26/03/2009, em entrevista coletiva no Palácio da Alvorada ao lado do premiê britânico Gordon Brown.",
    long:
      "Lula falava da crise financeira de 2008 e dizia que os pobres, negros e indígenas não deveriam pagar pela crise “feita pelos ricos”. A transcrição oficial da Secretaria de Imprensa da Presidência registra a frase; na mesma coletiva, um jornalista perguntou a Gordon Brown sobre a declaração.",
    claims: [{ kind: "fato_documentado", text: "A frase consta da transcrição oficial da entrevista, publicada pela Secretaria de Imprensa." }],
    sources: [
      { title: "Entrevista coletiva do presidente Lula e do primeiro-ministro Gordon Brown (transcrição)", url: "https://siac.fpabramo.org.br/uploads/acaoinstitucional/Entrevista_Presidente_Lula_2009_03_26.pdf", source_type: "primaria", publisher: "Presidência da República — Secretaria de Imprensa (acervo Fundação Perseu Abramo)", publication_date: "2009-03-26" },
    ],
    tags: ["crise de 2008", "racismo"],
  }),

  said("quem-disse-zelensky", {
    title: "Zelensky tão culpado quanto Putin",
    quote: "Esse cara é tão responsável quanto o Putin pela guerra.",
    ask: "Quem disse isso sobre Volodymyr Zelensky, presidente da Ucrânia?",
    period: "2022",
    options: ["Jair Bolsonaro", "Dilma Rousseff", "Eduardo Bolsonaro", "Ciro Gomes"],
    short: "Foi Lula, então pré-candidato, em entrevista à revista Time publicada em maio de 2022.",
    long:
      "A frase é a tradução do que a Time publicou em inglês: “This guy is as responsible as Putin for the war”. Na entrevista, que virou capa da revista, Lula disse que Zelensky “quis a guerra” e que deveria ter negociado com a Rússia para evitá-la.",
    sources: [
      { title: "Brazil’s Lula says Ukraine leader Zelensky shares blame for war", url: "https://batimes.com.ar/news/latin-america/brazils-lula-says-ukraine-leader-zelensky-shares-blame-for-war.phtml", publisher: "Buenos Aires Times (Reuters)", publication_date: "2022-05-04" },
      { title: "Zelensky é tão responsável quanto Putin, diz Lula, capa da “Time”", url: "https://www.cnnbrasil.com.br/politica/zelensky-e-tao-responsavel-quanto-putin-diz-lula-capa-da-time/", publisher: "CNN Brasil", publication_date: "2022-05-04" },
    ],
    tags: ["ucrânia", "rússia", "política externa"],
  }),

  said("quem-disse-decreto-mentira", {
    title: "Decreto contra a mentira",
    quote: "Se eu pudesse eu faria um decreto: é proibido mentir, quem mentir vai ser preso.",
    period: "2024",
    options: ["Jair Bolsonaro", "Alexandre de Moraes", "Flávio Dino", "Dilma Rousseff"],
    short: "Foi Lula, em 12/04/2024, num evento em frigorífico da JBS em Mato Grosso do Sul.",
    long:
      "O evento marcava a abertura de exportações de carne para a China. A fala ocorreu no debate sobre fake news e regulação das redes sociais. Foi uma frase hipotética: não houve decreto nem proposta formal.",
    claims: [{ kind: "fato_documentado", text: "Nenhum decreto foi editado; a frase foi hipotética." }],
    sources: [
      { title: "Lula diz que, se pudesse, assinaria um decreto para proibir mentira: “quem mentir vai preso”", url: "https://sbtnews.sbt.com.br/noticia/politica/lula-diz-que-se-pudesse-assinaria-um-decreto-para-proibir-mentira-quem-mentir-vai-preso", publisher: "SBT News", publication_date: "2024-04-12" },
    ],
    tags: ["liberdade de expressão", "fake news"],
  }),

  said("quem-disse-mulherzinha-fmi", {
    title: "A “mulherzinha” do FMI",
    quote: "E lá eu encontro com uma mulherzinha, presidente do FMI, diretora-geral do FMI.",
    ask: "Quem se referiu assim a Kristalina Georgieva, chefe do Fundo Monetário Internacional?",
    period: "2025",
    options: ["Jair Bolsonaro", "Paulo Guedes", "Eduardo Bolsonaro", "Pablo Marçal"],
    short: "Foi Lula, em 08/04/2025, num encontro da indústria da construção em São Paulo.",
    long: "Lula relembrava um encontro com Georgieva em Hiroshima, em 2023, em que ela teria previsto crescimento de só 0,8% para o Brasil — que acabou crescendo mais. A forma de se referir à chefe do FMI foi criticada como machista.",
    sources: [
      { title: "Lula chama diretora-geral do FMI de “mulherzinha”", url: "https://www.folhape.com.br/noticia/amp/404060/lula-chama-diretora-geral-do-fmi-de-mulherzinha/", publisher: "Folha de Pernambuco", publication_date: "2025-04-08" },
    ],
    tags: ["mulheres", "economia"],
  }),

  {
    slug: "quem-sancionou-taxa-das-blusinhas",
    title: "Taxa das blusinhas",
    question_text:
      "Quem sancionou a lei que criou a “taxa das blusinhas” — 20% de imposto federal sobre compras internacionais de até US$ 50 (Shein, Shopee, AliExpress)?",
    category: "economia",
    difficulty: "medio",
    period: "2024",
    short_explanation: "Foi Lula, que sancionou a Lei nº 14.902 em 27/06/2024. A cobrança começou em 1º/08/2024.",
    long_explanation:
      "A taxa foi incluída pelo Congresso no projeto do Programa Mover (incentivo à indústria automotiva), a pedido de entidades do varejo e da indústria têxtil que reclamavam de concorrência desleal. Lula sancionou o texto com o art. 32, que acabou com a isenção para remessas de até US$ 50. Além dos 20% federais, os estados cobram ICMS. Em 2026, o próprio governo anunciou o fim da cobrança federal nessa faixa.",
    legal_status: "Lei sancionada em 2024; a cobrança federal na faixa de até US$ 50 foi encerrada em 2026 — confira a situação atual.",
    legal_status_kind: "fato_documentado",
    claims: [
      { kind: "fato_documentado", text: "A Lei 14.902/2024 foi assinada por Lula, Fernando Haddad e outros ministros." },
      { kind: "fato_documentado", text: "O dispositivo da taxa foi incluído durante a tramitação no Congresso." },
    ],
    tags: ["impostos", "compras internacionais"],
    options: ["Jair Bolsonaro", "Michel Temer", "Dilma Rousseff", "Fernando Henrique Cardoso"],
    correct: null,
    reveal_answer: LULA,
    collection: "quem-disse",
    sources: [
      { title: "Lei nº 14.902, de 27 de junho de 2024", url: "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm", source_type: "primaria", publisher: "Planalto", publication_date: "2024-06-27" },
      { title: "“Taxa das Blusinhas” agora é lei", url: "https://www12.senado.leg.br/radio/1/noticia/2024/08/14/201ctaxa-das-blusinhas201d-agora-e-lei", source_type: "jornalistica", publisher: "Rádio Senado", publication_date: "2024-08-14" },
      { title: "Lula anuncia fim da “taxa das blusinhas”", url: "https://diariodonordeste.verdesmares.com.br/negocios/lula-anuncia-fim-da-taxa-das-blusinhas-isentando-cobranca-sobre-compras-internacionais-1.3763627", source_type: "jornalistica", publisher: "Diário do Nordeste", publication_date: null },
    ],
    legislation: [
      { title: "Lei nº 14.902/2024 (Programa Mover)", article: "Art. 32", url: "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm", relevance: "Alterou o Decreto-Lei 1.804/1980 e acabou com a isenção de imposto de importação para remessas de até US$ 50." },
    ],
    editorial_notes: "Lei, data e signatário conferidos no Planalto em 05/10/2026.",
  },
];
