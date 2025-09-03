-- PinkAnt Upgraded Schema (run in Supabase SQL editor)
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) AUTH-BOUND PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  banner_url text,
  pronouns text,
  short_bio text,
  interests text[],
  location text,
  visibility text default 'community',
  role text default 'user',
  is_org boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) POSTS / COMMENTS / LIKES
CREATE TABLE IF NOT EXISTS public.posts (
  id bigint generated always as identity primary key,
  author uuid references public.profiles(id) on delete cascade,
  title text,
  body text,
  tags text[],
  visibility text default 'community',
  images text[],
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id bigint generated always as identity primary key,
  post_id bigint references public.posts(id) on delete cascade,
  author uuid references public.profiles(id) on delete cascade,
  body text not null,
  parent_id bigint references public.comments(id) on delete cascade,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  post_id bigint references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- 3) DMs
CREATE TABLE IF NOT EXISTS public.dm_threads (
  id uuid primary key default gen_random_uuid(),
  a uuid references public.profiles(id) on delete cascade,
  b uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (a, b)
);

CREATE TABLE IF NOT EXISTS public.dm_messages (
  id bigint generated always as identity primary key,
  thread_id uuid references public.dm_threads(id) on delete cascade,
  sender uuid references public.profiles(id) on delete cascade,
  body text,
  read_by uuid[] default '{}',
  created_at timestamptz default now()
);

-- 4) ORGS
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner uuid references public.profiles(id) on delete cascade,
  name text not null unique,
  verified boolean default false,
  avatar_url text,
  banner_url text,
  bio text,
  created_at timestamptz default now()
);

-- 5) WALLETS & LEDGER
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid primary key default gen_random_uuid(),
  owner_profile uuid references public.profiles(id) on delete cascade,
  owner_org uuid references public.organizations(id) on delete set null,
  balance_cents bigint default 0 check (balance_cents >= 0),
  currency text default 'USD',
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid references public.wallets(id) on delete cascade,
  type text not null,         -- deposit | transfer_in | transfer_out | withdrawal | grant_in | fee
  amount_cents bigint not null check (amount_cents > 0),
  description text,
  external_ref text,
  pending boolean default true,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.transfers (
  id uuid primary key default gen_random_uuid(),
  from_wallet uuid references public.wallets(id) on delete cascade,
  to_wallet uuid references public.wallets(id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0),
  note text,
  created_at timestamptz default now()
);

-- 6) FLAGS / MODERATION
CREATE TABLE IF NOT EXISTS public.flags (
  id uuid primary key default gen_random_uuid(),
  reporter uuid references public.profiles(id) on delete cascade,
  target_type text not null,  -- post | comment | user | org
  target_id text not null,
  reason text,
  status text default 'open', -- open | reviewing | actioned | dismissed
  created_at timestamptz default now()
);

-- 7) NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient uuid references public.profiles(id) on delete cascade,
  type text not null,         -- comment | like | dm | donation | grant | system
  payload jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.dm_threads enable row level security;
alter table public.dm_messages enable row level security;
alter table public.organizations enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.transfers enable row level security;
alter table public.flags enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy if not exists "read profiles by community visibility"
  on public.profiles for select
  using (
    visibility in ('public','community')
    or auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin','superadmin'))
  );

create policy if not exists "update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Posts
create policy if not exists "read posts visible to user"
  on public.posts for select
  using (
    visibility in ('public','community') or author = auth.uid()
  );
create policy if not exists "insert own posts"
  on public.posts for insert
  with check (author = auth.uid());
create policy if not exists "edit or delete own posts"
  on public.posts for update using (author = auth.uid());
create policy if not exists "moderators can manage posts"
  on public.posts for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator','admin','superadmin')));

-- Comments
create policy if not exists "read comments for visible posts"
  on public.comments for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id and (p.visibility in ('public','community') or p.author = auth.uid())
    )
  );
create policy if not exists "insert own comments"
  on public.comments for insert with check (author = auth.uid());
create policy if not exists "edit or delete own comments"
  on public.comments for update using (author = auth.uid());

-- Likes
create policy if not exists "read likes for visible posts"
  on public.likes for select
  using (
    exists (
      select 1 from public.posts p where p.id = post_id and (p.visibility in ('public','community') or p.author = auth.uid())
    )
  );
create policy if not exists "insert own likes"
  on public.likes for insert with check (user_id = auth.uid());
create policy if not exists "delete own likes"
  on public.likes for delete using (user_id = auth.uid());

-- DMs
create policy if not exists "participants can view threads"
  on public.dm_threads for select using (a = auth.uid() or b = auth.uid());
create policy if not exists "participants can view messages"
  on public.dm_messages for select
  using (
    exists (
      select 1 from public.dm_threads t where t.id = thread_id and (t.a = auth.uid() or t.b = auth.uid())
    )
  );
create policy if not exists "send message if participant"
  on public.dm_messages for insert
  with check (
    sender = auth.uid() and exists (
      select 1 from public.dm_threads t where t.id = thread_id and (t.a = auth.uid() or t.b = auth.uid())
    )
  );

-- Orgs
create policy if not exists "read orgs" on public.organizations for select using (true);
create policy if not exists "org owner can update"
  on public.organizations for update using (
    exists (select 1 from public.organizations o where o.id = id and o.owner = auth.uid())
  );

-- Wallets
create policy if not exists "select own wallet or admin"
  on public.wallets for select using (
    owner_profile = auth.uid()
    or exists (select 1 from public.organizations o where o.id = owner_org and o.owner = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );

-- Transactions
create policy if not exists "select tx for visible wallets"
  on public.transactions for select using (
    wallet_id in (
      select id from public.wallets
      where owner_profile = auth.uid()
         or exists (select 1 from public.organizations o where o.id = owner_org and o.owner = auth.uid())
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
    )
  );

-- Transfers
create policy if not exists "select transfers for visible wallets"
  on public.transfers for select using (
    from_wallet in (
      select id from public.wallets where owner_profile = auth.uid()
      or exists (select 1 from public.organizations o where o.id = owner_org and o.owner = auth.uid())
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
    )
    or to_wallet in (
      select id from public.wallets where owner_profile = auth.uid()
      or exists (select 1 from public.organizations o where o.id = owner_org and o.owner = auth.uid())
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
    )
  );

-- Flags
create policy if not exists "read flags as moderator"
  on public.flags for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin','superadmin'))
  );
create policy if not exists "reporters can insert flags"
  on public.flags for insert with check (reporter = auth.uid());

-- Notifications
create policy if not exists "read own notifications"
  on public.notifications for select using (recipient = auth.uid());

-- Indexes
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_posts_author on public.posts(author);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_tags on public.posts using gin(tags);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_author on public.comments(author);
create index if not exists idx_likes_post_id on public.likes(post_id);
create index if not exists idx_likes_user_id on public.likes(user_id);
create index if not exists idx_dm_messages_thread_id on public.dm_messages(thread_id);
create index if not exists idx_wallets_owner_profile on public.wallets(owner_profile);
create index if not exists idx_transactions_wallet_id on public.transactions(wallet_id);

-- updated_at trigger helper
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at_column();

-- Auth trigger to seed profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)), coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Grants
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;

-- RPCs (skeletons)
create or replace function public.rpc_create_wallet_for_user(profile_id uuid)
returns uuid as $$
declare new_wallet uuid;
begin
  insert into public.wallets (owner_profile) values (profile_id) returning id into new_wallet;
  return new_wallet;
end;$$ language plpgsql security definer;

create or replace function public.rpc_mark_transaction_cleared(tx_id uuid)
returns void as $$
begin
  update public.transactions set pending = false where id = tx_id;
end;$$ language plpgsql security definer;

-- Balance helpers used by webhook (idempotent if combined with tx pending)
create or replace function public.increment_wallet_balance(p_wallet_id uuid, p_amount_cents bigint)
returns void as $$
begin
  update public.wallets set balance_cents = balance_cents + p_amount_cents where id = p_wallet_id;
end;$$ language plpgsql security definer;

create or replace function public.increment_wallet_balance_fallback(p_wallet_id uuid, p_amount_cents bigint)
returns void as $$
begin
  update public.wallets set balance_cents = balance_cents + p_amount_cents where id = p_wallet_id;
end;$$ language plpgsql security definer;

-- Atomic transfer: creates transfer row and two transactions, updates balances
create or replace function public.rpc_create_transfer(
  from_wallet uuid,
  to_wallet uuid,
  amount_cents bigint,
  note text
)
returns uuid as $$
declare
  v_currency_from text;
  v_currency_to text;
  v_from_balance bigint;
  v_transfer_id uuid := gen_random_uuid();
begin
  if amount_cents is null or amount_cents <= 0 then
    raise exception 'Invalid amount';
  end if;

  select currency, balance_cents into v_currency_from, v_from_balance from public.wallets where id = from_wallet for update;
  if not found then raise exception 'From wallet not found'; end if;
  if v_from_balance < amount_cents then raise exception 'Insufficient funds'; end if;

  select currency into v_currency_to from public.wallets where id = to_wallet for update;
  if not found then raise exception 'To wallet not found'; end if;
  if v_currency_from <> v_currency_to then raise exception 'Currency mismatch'; end if;

  -- update balances
  update public.wallets set balance_cents = balance_cents - amount_cents where id = from_wallet;
  update public.wallets set balance_cents = balance_cents + amount_cents where id = to_wallet;

  -- transfer link
  insert into public.transfers (id, from_wallet, to_wallet, amount_cents, note)
  values (v_transfer_id, from_wallet, to_wallet, amount_cents, note);

  -- ledger entries
  insert into public.transactions (wallet_id, type, amount_cents, description, pending)
  values (from_wallet, 'transfer_out', amount_cents, coalesce(note, 'Transfer out'), false);

  insert into public.transactions (wallet_id, type, amount_cents, description, pending)
  values (to_wallet, 'transfer_in', amount_cents, coalesce(note, 'Transfer in'), false);

  return v_transfer_id;
end;$$ language plpgsql security definer;


