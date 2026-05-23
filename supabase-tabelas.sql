-- ============================================================
-- DESCANSA, MULHER! — Tabelas no Supabase
-- Cole este SQL no Supabase > SQL Editor > New query > Run
-- ============================================================

-- Desabafos (Minha Mente)
create table if not exists mind_entries (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  text        text not null,
  created_at  timestamptz default now()
);
alter table mind_entries enable row level security;
create policy "usuario ve seus dados" on mind_entries for all using (auth.uid() = user_id);

-- Tarefas fixas (Semana)
create table if not exists fixed_tasks (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  text        varchar(255) not null,
  days        varchar(20) not null,
  created_at  timestamptz default now()
);
alter table fixed_tasks enable row level security;
create policy "usuario ve seus dados" on fixed_tasks for all using (auth.uid() = user_id);

-- Tarefas fixas concluídas por dia
create table if not exists fixed_task_done (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  fixed_task_id   uuid references fixed_tasks(id) on delete cascade not null,
  date_key        date not null,
  unique (user_id, fixed_task_id, date_key)
);
alter table fixed_task_done enable row level security;
create policy "usuario ve seus dados" on fixed_task_done for all using (auth.uid() = user_id);

-- Tarefas pontuais por dia
create table if not exists pontual_tasks (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  text        varchar(255) not null,
  date_key    date not null,
  done        boolean default false,
  created_at  timestamptz default now()
);
alter table pontual_tasks enable row level security;
create policy "usuario ve seus dados" on pontual_tasks for all using (auth.uid() = user_id);

-- Categorias das Listas
create table if not exists categories (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  icon        varchar(10) default '✨',
  name        varchar(100) not null,
  created_at  timestamptz default now()
);
alter table categories enable row level security;
create policy "usuario ve seus dados" on categories for all using (auth.uid() = user_id);

-- Itens das Listas
create table if not exists category_items (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  text        varchar(255) not null,
  done        boolean default false,
  created_at  timestamptz default now()
);
alter table category_items enable row level security;
create policy "usuario ve seus dados" on category_items for all using (auth.uid() = user_id);
