# GABARITO — quiz de fatos da política brasileira

> **Pergunte. Verifique. Questione.**
> 5 perguntas aleatórias sobre acontecimentos documentados. Depois de cada resposta, o "dossiê" mostra o que aconteceu, a situação jurídica e as fontes originais para o usuário conferir.

Entrada via QR Code → identificação opcional → 5 perguntas → explicação + fontes → resultado.

---

## Stack

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Front + back | **Next.js 16** (App Router, Turbopack), React 19, **TypeScript** | Uma app só: páginas, rotas de API e server actions |
| Estilo | **Tailwind CSS v4** + tokens próprios em `src/app/globals.css` | Design system do cartaz (cores, tipografia, sombras duras) |
| Animação | **Motion** (`motion/react`) | Carimbo, transições, barra de progresso |
| Ícones | **lucide-react** | |
| Banco | **Supabase (PostgreSQL)** via `@supabase/supabase-js` (service role, só no servidor) | RLS fechado: o navegador nunca lê o banco |
| Validação | **Zod** | Todas as entradas (API e painel) |
| QR Code | `qrcode` | Gerado no painel, baixa em SVG |

Tipografia: **Archivo** (variável, eixo de largura — condensada 62% nos títulos de cartaz) + **IBM Plex Mono** (etiquetas e "documentos").

---

## Rodando local (sem banco — modo demonstração)

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem as variáveis do Supabase, o app usa um **banco em memória** com as perguntas de `src/content/seed.ts`. Dá para jogar o quiz e usar o painel `/admin` (senha de dev: `gabarito-dev`). Alterações somem ao reiniciar.

---

## Ligando no Supabase

1. Crie um projeto em https://supabase.com.
2. **SQL Editor →** cole e rode `supabase/migrations/0001_init.sql` (cria tabelas, enums, índices, view de estatística, RLS e as 10 categorias).
   - Com a CLI: `supabase link` e `supabase db push`.
3. Copie `.env.example` para `.env.local` e preencha:
   - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → *service_role*, **secreta**);
   - `ADMIN_SECRET` (mín. 12 caracteres: `openssl rand -base64 24`);
   - `NEXT_PUBLIC_APP_URL` (domínio final, usado no QR Code).
4. Popule o banco inicial:
   ```bash
   npm run db:seed
   ```
5. `npm run dev` — o aviso amarelo de "modo demonstração" some do painel.

### Tabelas

`categories` · `questions` · `question_options` · `sources` · `legislation` · `quiz_sessions` · `quiz_answers` · `editorial_reviews` + view `question_stats`.
Não existe tabela `users` de participantes de propósito (minimização de dados): a sessão guarda só um identificador aleatório (cookie) e, se a pessoa quiser, um apelido.

---

## Administrador

- `/admin` → pede a senha `ADMIN_SECRET`; troca por cookie httpOnly assinado (HMAC, 12 h). Rotas protegidas pelo `src/proxy.ts` **e** por checagem em cada server action.
- **Painel:** perguntas por status, sessões, conclusão/abandono, acerto médio, perguntas mais difíceis/fáceis.
- **Perguntas:** criar, editar, excluir, arquivar; alternativas, explicação curta/detalhada, classificação da informação, situação jurídica, fontes (primária/jornalística/análise/acadêmica), legislação, tags, data da última verificação, observações editoriais.
- **Fluxo editorial:** `Rascunho → Em revisão → (checklist de verificação) → Publicada`, com histórico de cada transição. Só **publicadas** entram no sorteio.
- **Anti-desinformação** (`src/server/editorial.ts`): bloqueia publicação sem fonte, sem data de verificação, sem classificação; termos sensíveis ("crime", "fraude", "censura"…) exigem situação jurídica; investigação/denúncia não pode ser descrita como condenação; "inconstitucional" exige norma citada.
- **Categorias** e **QR Code** (com campanha: `/desafio/sala-3b`).

---

## Como o quiz funciona por dentro

- `POST /api/sessions` sorteia no servidor (`src/server/quiz.ts`): prefere perguntas que o navegador **não viu recentemente** (lista em `localStorage`), tenta não repetir categoria, embaralha a ordem das perguntas e das alternativas e grava a seleção.
- O navegador recebe as perguntas **sem a resposta correta**.
- `POST /api/sessions/:id/answer` valida no servidor, impede responder duas vezes e só então devolve gabarito, explicação e fontes.
- Recarregou a página? `GET /api/sessions/:id` retoma de onde parou.
- Segurança: Zod em tudo, Content-Type JSON + checagem de Origin (CSRF), rate limit por IP, React escapa todo texto (XSS), nenhum segredo no front, cookies `secure` em produção.
- Quantidade por desafio: `NEXT_PUBLIC_QUIZ_SIZE`.

---

## Conteúdo

| Arquivo | Coleção | O que é |
| --- | --- | --- |
| `src/content/quem-disse.ts` | `quem-disse` (padrão do `/desafio`) | 19 frases + a "taxa das blusinhas" no formato **pegadinha**: nenhuma alternativa é a correta e a resposta revelada é o Lula |
| `src/content/fatos.ts` | `quem-disse` | 5 fatos: queimadas 2024, recorde de recuperações judiciais, dívida bruta, caso Surgisphere/cloroquina, venda da Serra Verde |
| `src/content/seed.ts` | `leis` (`/desafio/leis`) | 22 leis federais: quem sancionou |
| `src/content/numeros.ts` | — | dados dos gráficos (tela de resultado e `/banco`) |

Tudo foi pesquisado e conferido em 05/10/2026, com link para a reportagem ou o documento oficial. **Abra os links antes de divulgar.** Para mudar a coleção padrão, use a variável `QUIZ_COLLECTION`.

Para atualizar a dívida pública (série 13762 do Banco Central):

```bash
curl "https://api.bcb.gov.br/dados/serie/bcdata.sgs.13762/dados?formato=json&dataInicial=01/12/2018"
```

---

## Marca

Nome provisório: **GABARITO** (troque em `src/config/brand.ts`). Outras opções:

- **Gabarito** — curto, cara de escola/prova, neutro.
- **Contraprova** — "a prova que confere a prova".
- **Quem Assinou?** — direto ao formato das perguntas.
- **Na Fonte** — reforça o "confira o documento".

---

## Deploy (Vercel + Supabase)

1. **Supabase:** crie o projeto, rode `supabase/migrations/0001_init.sql` no SQL Editor e depois `npm run db:seed` localmente (com o `.env.local` preenchido).
2. **Vercel:** em vercel.com → *Add New → Project* → importe o repositório do GitHub. O Next.js é detectado sozinho.
3. **Environment Variables** (Production):

   | Variável | Valor |
   | --- | --- |
   | `SUPABASE_URL` | URL do projeto Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | chave *service_role* (secreta) |
   | `ADMIN_SECRET` | senha do `/admin`, mínimo 12 caracteres |
   | `NEXT_PUBLIC_APP_URL` | o domínio da Vercel, ex.: `https://gabarito.vercel.app` |

   A integração **Supabase** do Vercel Marketplace também funciona: ela cria `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`, que o app aceita.
4. **Deploy.** Depois abra `/admin/qr`, gere o QR Code e imprima.

**Sem Supabase:** em produção o app recusa subir sem banco. Com `ALLOW_MEMORY_MODE=true` ele sobe, mas na Vercel cada instância tem a própria memória e partidas podem "sumir" no meio. Use só para teste.

> O rate limit é em memória (por instância). Para muito tráfego, troque por Upstash Redis em `src/lib/rate-limit.ts`.

---

## Estrutura

```
src/
  app/
    page.tsx                 landing (cartaz)
    desafio/                 quiz (+ /desafio/[campanha])
    api/sessions/            criar sessão, retomar, responder
    admin/                   login, painel, perguntas, categorias, QR
    opengraph-image.tsx      imagem de compartilhamento
  components/
    brand/  ui/  quiz/  admin/
  server/
    quiz.ts                  sorteio, validação, revelação
    editorial.ts             regras de publicação / anti-desinformação
    auth.ts                  cookie de admin
    repo/                    Supabase | memória
  content/seed.ts            banco inicial
  config/brand.ts            nome, slogan, tamanho do quiz
  types/domain.ts
supabase/migrations/0001_init.sql
scripts/seed.ts
```
