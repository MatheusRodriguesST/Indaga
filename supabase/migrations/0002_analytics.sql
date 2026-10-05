-- =====================================================================
-- Estatísticas de uso: eventos do funil + dispositivo/origem da sessão.
-- Sem IP, sem e-mail: só um identificador aleatório (cookie) por navegador.
-- =====================================================================

alter table quiz_sessions add column if not exists device text;   -- celular | tablet | computador
alter table quiz_sessions add column if not exists referrer text; -- domínio de origem (ex.: instagram.com)

create table if not exists quiz_events (
  id                    uuid primary key default gen_random_uuid(),
  session_id            uuid references quiz_sessions(id) on delete set null,
  anonymous_identifier  text,
  type                  text not null check (type in (
                          'landing_view',   -- abriu a página inicial
                          'quiz_view',      -- abriu /desafio
                          'numbers_view',   -- os gráficos apareceram na tela do resultado
                          'banco_view',     -- abriu /banco
                          'source_click',   -- clicou num link de fonte
                          'share_click',    -- clicou em compartilhar
                          'restart_click'   -- jogou de novo
                        )),
  path                  text,
  campaign              text,
  device                text,
  meta                  jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now()
);
create index if not exists quiz_events_type_idx on quiz_events (type, created_at desc);
create index if not exists quiz_events_session_idx on quiz_events (session_id);
create index if not exists quiz_events_created_idx on quiz_events (created_at desc);

alter table quiz_events enable row level security;
