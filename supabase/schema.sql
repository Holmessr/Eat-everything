-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Shops Table
create table public.shops (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text check (type in ('delivery', 'dine-in')) not null,
  rating numeric check (rating >= 1 and rating <= 5) not null,
  tags text[] default '{}',
  image_url text,
  images text[] default '{}',
  visit_count integer default 0,
  address text,
  description text,
  platform_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Recipes Table
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  rating numeric check (rating >= 1 and rating <= 5) not null,
  tags text[] default '{}',
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) not null,
  prep_time integer default 0,
  cook_time integer default 0,
  ingredients text[] default '{}',
  steps text[] default '{}',
  image_url text,
  images text[] default '{}',
  source_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Row Level Security (RLS) Policies
alter table public.shops enable row level security;
alter table public.recipes enable row level security;

-- Allow users to view/edit only their own data
create policy "Users can view their own shops" on shops for select using (auth.uid() = user_id);
create policy "Users can insert their own shops" on shops for insert with check (auth.uid() = user_id);
create policy "Users can update their own shops" on shops for update using (auth.uid() = user_id);
create policy "Users can delete their own shops" on shops for delete using (auth.uid() = user_id);

create policy "Users can view their own recipes" on recipes for select using (auth.uid() = user_id);
create policy "Users can insert their own recipes" on recipes for insert with check (auth.uid() = user_id);
create policy "Users can update their own recipes" on recipes for update using (auth.uid() = user_id);
create policy "Users can delete their own recipes" on recipes for delete using (auth.uid() = user_id);

-- 4. User Profiles Table (New)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  avatar_url text,
  bio text,
  preferences jsonb default '{}',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- 5. Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url, bio)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url', '');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Storage Bucket for Avatars
-- Step 1: Create a public bucket named 'avatars' in Supabase Storage UI.
-- Step 2: Run the following SQL to allow authenticated uploads/updates:

create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Allow authenticated updates"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Allow public read"
on storage.objects
for select
to public
using ( bucket_id = 'avatars' );
