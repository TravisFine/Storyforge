-- Run once in your FREE Supabase project's SQL Editor.
-- Create your personal user in Authentication > Users; keep public signup disabled.
create table if not exists public.storyforge_workspaces (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  revision uuid not null,
  data jsonb not null,
  previous_data jsonb,
  updated_at timestamptz not null default now()
);
alter table public.storyforge_workspaces enable row level security;
drop policy if exists "Owner reads workspace" on public.storyforge_workspaces;
create policy "Owner reads workspace" on public.storyforge_workspaces for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists "Owner creates workspace" on public.storyforge_workspaces;
create policy "Owner creates workspace" on public.storyforge_workspaces for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "Owner updates workspace" on public.storyforge_workspaces;
create policy "Owner updates workspace" on public.storyforge_workspaces for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
revoke all on public.storyforge_workspaces from anon;
grant select, insert, update on public.storyforge_workspaces to authenticated;

-- Compare-and-swap prevents concurrent devices from overwriting unseen changes.
create or replace function public.storyforge_save(p_expected uuid, p_revision uuid, p_data jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if p_data->>'schema' is distinct from '1' or jsonb_typeof(p_data->'projects') is distinct from 'array' then
    raise exception 'Invalid workspace';
  end if;
  if p_expected is null then
    insert into public.storyforge_workspaces(owner_id,revision,data)
      values(auth.uid(),p_revision,p_data) on conflict(owner_id) do nothing;
  else
    update public.storyforge_workspaces set previous_data=data,data=p_data,revision=p_revision,updated_at=now()
      where owner_id=auth.uid() and revision=p_expected;
  end if;
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;
revoke all on function public.storyforge_save(uuid,uuid,jsonb) from public,anon;
grant execute on function public.storyforge_save(uuid,uuid,jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('storyforge-images','storyforge-images',false,10485760,array['image/webp','image/png','image/jpeg','image/gif'])
on conflict(id) do nothing;
drop policy if exists "Owner uploads Storyforge images" on storage.objects;
create policy "Owner uploads Storyforge images" on storage.objects for insert to authenticated
with check(bucket_id='storyforge-images' and (storage.foldername(name))[1]=(select auth.uid()::text));
drop policy if exists "Owner reads Storyforge images" on storage.objects;
create policy "Owner reads Storyforge images" on storage.objects for select to authenticated
using(bucket_id='storyforge-images' and (storage.foldername(name))[1]=(select auth.uid()::text));
