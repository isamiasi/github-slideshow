-- Nguyễn Minh Hạ Studio: work table schema
create extension if not exists "pgcrypto";

create table if not exists public.work (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  emotion text not null,
  scene text not null,
  poem text not null,
  suno_prompt text not null,
  image_prompt text not null,
  shorts_script text not null,
  youtube_title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_created_at_idx on public.work (created_at desc);
create index if not exists work_emotion_idx on public.work (emotion);

alter table public.work enable row level security;

-- dev-friendly public read/write policy (tighten for production)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='work' and policyname='work_public_select'
  ) then
    create policy work_public_select on public.work for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='work' and policyname='work_public_insert'
  ) then
    create policy work_public_insert on public.work for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='work' and policyname='work_public_delete'
  ) then
    create policy work_public_delete on public.work for delete using (true);
  end if;
end $$;


create index if not exists work_updated_at_idx on public.work (updated_at desc);
