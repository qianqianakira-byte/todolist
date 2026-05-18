create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  avatar_color text not null default '#ec4899',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friendships_no_self_check check (requester_id <> addressee_id)
);

create unique index if not exists friendships_active_pair_unique
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id))
  where status in ('pending', 'accepted');

create index if not exists todos_owner_id_idx on public.todos(owner_id);
create index if not exists friendships_requester_id_idx on public.friendships(requester_id);
create index if not exists friendships_addressee_id_idx on public.friendships(addressee_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists todos_set_updated_at on public.todos;
create trigger todos_set_updated_at
before update on public.todos
for each row execute function public.set_updated_at();

drop trigger if exists friendships_set_updated_at on public.friendships;
create trigger friendships_set_updated_at
before update on public.friendships
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_friendship_participant_changes()
returns trigger
language plpgsql
as $$
begin
  if old.requester_id <> new.requester_id or old.addressee_id <> new.addressee_id then
    raise exception 'friendship participants cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists friendships_prevent_participant_changes on public.friendships;
create trigger friendships_prevent_participant_changes
before update on public.friendships
for each row execute function public.prevent_friendship_participant_changes();

alter table public.profiles enable row level security;
alter table public.todos enable row level security;
alter table public.friendships enable row level security;

drop policy if exists "Authenticated users can search profiles" on public.profiles;
create policy "Authenticated users can search profiles"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can read own and accepted friends todos" on public.todos;
create policy "Users can read own and accepted friends todos"
on public.todos for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.addressee_id = owner_id)
        or (f.addressee_id = auth.uid() and f.requester_id = owner_id)
      )
  )
);

drop policy if exists "Users can create their own todos" on public.todos;
create policy "Users can create their own todos"
on public.todos for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "Users can update their own todos" on public.todos;
create policy "Users can update their own todos"
on public.todos for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Users can delete their own todos" on public.todos;
create policy "Users can delete their own todos"
on public.todos for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Users can read their friendship rows" on public.friendships;
create policy "Users can read their friendship rows"
on public.friendships for select
to authenticated
using (requester_id = auth.uid() or addressee_id = auth.uid());

drop policy if exists "Users can send friend requests" on public.friendships;
create policy "Users can send friend requests"
on public.friendships for insert
to authenticated
with check (
  requester_id = auth.uid()
  and addressee_id <> auth.uid()
  and status = 'pending'
);

drop policy if exists "Addressees can accept or reject requests" on public.friendships;
create policy "Addressees can accept or reject requests"
on public.friendships for update
to authenticated
using (addressee_id = auth.uid() and status = 'pending')
with check (addressee_id = auth.uid() and status in ('accepted', 'rejected'));

do $$
begin
  alter publication supabase_realtime add table public.todos;
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.friendships;
exception
  when duplicate_object then null;
end;
$$;
