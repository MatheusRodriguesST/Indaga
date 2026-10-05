-- =====================================================================
-- GABARITO — schema inicial (Supabase / PostgreSQL)
-- Rode no SQL Editor do Supabase ou via `supabase db push`.
--
-- Segurança: RLS está LIGADO em todas as tabelas e NÃO há policies
-- para os papéis anon/authenticated. Ou seja, o navegador não lê nada
-- direto do banco — todo acesso passa pelo servidor Next.js usando a
-- service role key (que ignora RLS). Isso impede que a alternativa
-- correta vaze antes de o usuário responder.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- enums ----------
do $$ begin
  create type difficulty as enum ('facil', 'medio', 'dificil');
exception when duplicate_object then null; end $$;

do $$ begin
  create type editorial_status as enum ('rascunho', 'em_revisao', 'publicada', 'arquivada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type claim_kind as enum (
    'fato_documentado', 'alegacao', 'investigacao', 'denuncia', 'processo',
    'decisao_judicial', 'condenacao', 'absolvicao', 'controversia',
    'interpretacao', 'opiniao'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type source_type as enum ('primaria', 'jornalistica', 'analise', 'academica');
exception when duplicate_object then null; end $$;

-- ---------- categories ----------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  emoji       text not null default '📌',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- questions ----------
create table if not exists questions (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  title              text not null,
  question_text      text not null,
  category_id        uuid references categories(id) on delete set null,
  difficulty         difficulty not null default 'medio',
  period             text,
  short_explanation  text not null default '',
  long_explanation   text not null default '',
  legal_status       text,
  legal_status_kind  claim_kind,
  -- [{ "kind": "fato_documentado", "text": "..." }, ...]
  claims             jsonb not null default '[]'::jsonb,
  -- formato "pegadinha": nenhuma alternativa correta; esta é a resposta revelada
  reveal_answer      text,
  editorial_status   editorial_status not null default 'rascunho',
  editorial_notes    text,
  tags               text[] not null default '{}',
  is_demo            boolean not null default false,
  collection         text not null default 'quem-disse',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  last_verified_at   date
);
create index if not exists questions_status_idx on questions (editorial_status);
create index if not exists questions_category_idx on questions (category_id);
create index if not exists questions_collection_idx on questions (collection);

-- ---------- question_options ----------
create table if not exists question_options (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references questions(id) on delete cascade,
  option_label  char(1) not null check (option_label in ('A','B','C','D')),
  option_text   text not null,
  is_correct    boolean not null default false,
  unique (question_id, option_label)
);
-- no máximo UMA alternativa correta por pergunta
create unique index if not exists question_options_one_correct
  on question_options (question_id) where is_correct;

-- ---------- question_sources ----------
-- (nome com prefixo para não colidir com outra tabela "sources" no mesmo projeto)
create table if not exists question_sources (
  id                uuid primary key default gen_random_uuid(),
  question_id       uuid not null references questions(id) on delete cascade,
  title             text not null,
  url               text not null check (url ~* '^https?://'),
  source_type       source_type not null default 'jornalistica',
  publisher         text,
  publication_date  date,
  description       text,
  sort_order        int not null default 0
);
create index if not exists question_sources_question_idx on question_sources (question_id);

-- ---------- legislation ----------
create table if not exists legislation (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references questions(id) on delete cascade,
  title        text not null,
  article      text,
  url          text check (url is null or url ~* '^https?://'),
  description  text,
  relevance    text,
  sort_order   int not null default 0
);
create index if not exists legislation_question_idx on legislation (question_id);

-- ---------- quiz_sessions ----------
-- Minimização de dados: nada de IP, e-mail ou CPF. Apenas um identificador
-- aleatório gerado no navegador e, opcionalmente, um apelido.
create table if not exists quiz_sessions (
  id                    uuid primary key default gen_random_uuid(),
  anonymous_identifier  text not null,
  display_name          text check (display_name is null or char_length(display_name) <= 40),
  campaign              text,
  question_ids          uuid[] not null,
  option_order          jsonb not null default '{}'::jsonb,
  started_at            timestamptz not null default now(),
  completed_at          timestamptz,
  score                 int
);
create index if not exists quiz_sessions_started_idx on quiz_sessions (started_at desc);
create index if not exists quiz_sessions_campaign_idx on quiz_sessions (campaign);

-- ---------- quiz_answers ----------
create table if not exists quiz_answers (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references quiz_sessions(id) on delete cascade,
  question_id         uuid not null references questions(id) on delete cascade,
  selected_option_id  uuid not null references question_options(id) on delete cascade,
  is_correct          boolean not null,
  answered_at         timestamptz not null default now(),
  unique (session_id, question_id)   -- bloqueia resposta dupla
);
create index if not exists quiz_answers_question_idx on quiz_answers (question_id);

-- ---------- editorial_reviews ----------
create table if not exists editorial_reviews (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references questions(id) on delete cascade,
  from_status  editorial_status,
  to_status    editorial_status not null,
  note         text,
  created_at   timestamptz not null default now()
);
create index if not exists editorial_reviews_question_idx on editorial_reviews (question_id, created_at desc);

-- ---------- updated_at automático ----------
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists questions_touch on questions;
create trigger questions_touch before update on questions
  for each row execute function touch_updated_at();

-- ---------- estatísticas agregadas (sem dados pessoais) ----------
create or replace view question_stats as
select
  q.id                                   as question_id,
  q.slug,
  q.title,
  count(a.id)::int                       as answers,
  count(a.id) filter (where a.is_correct)::int as correct,
  case when count(a.id) = 0 then null
       else round(100.0 * count(a.id) filter (where a.is_correct) / count(a.id), 1)
  end                                    as accuracy
from questions q
left join quiz_answers a on a.question_id = q.id
group by q.id;

-- ---------- RLS: tudo fechado para o navegador ----------
alter table categories        enable row level security;
alter table questions         enable row level security;
alter table question_options  enable row level security;
alter table question_sources  enable row level security;
alter table legislation       enable row level security;
alter table quiz_sessions     enable row level security;
alter table quiz_answers      enable row level security;
alter table editorial_reviews enable row level security;

revoke all on question_stats from anon, authenticated;

-- ---------- categorias iniciais ----------
insert into categories (slug, name, emoji, sort_order) values
  ('liberdade-de-expressao', 'Liberdade de expressão',            '🗣️', 1),
  ('justica-e-instituicoes', 'Justiça e instituições',            '⚖️', 2),
  ('corrupcao-e-investigacoes', 'Corrupção e investigações',      '💰', 3),
  ('soberania-e-relacoes-internacionais', 'Soberania e relações internacionais', '🌎', 4),
  ('politicas-publicas',     'Políticas públicas',                '🏛️', 5),
  ('constituicao-e-leis',    'Constituição e leis',               '📜', 6),
  ('economia',               'Economia',                          '💼', 7),
  ('meio-ambiente',          'Meio ambiente',                     '🌳', 8),
  ('direitos-e-liberdades',  'Direitos e liberdades',             '👥', 9),
  ('estatais-e-empresas',    'Estatais e empresas',               '🏢', 10),
  ('declaracoes',            'Declarações controversas',          '🎤', 11)
on conflict (slug) do nothing;
