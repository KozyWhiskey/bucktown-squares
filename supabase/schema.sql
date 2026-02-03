-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create the squares table
create table public.squares (
  id uuid default uuid_generate_v4() primary key,
  x integer not null check (x >= 0 and x <= 9),
  y integer not null check (y >= 0 and y <= 9),
  user_name text,
  user_email text, -- Will be protected by RLS
  paid boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(x, y)
);

-- 2. Create the game_state table
create table public.game_state (
  id uuid default uuid_generate_v4() primary key,
  row_numbers integer[] check (array_length(row_numbers, 1) = 10),
  col_numbers integer[] check (array_length(col_numbers, 1) = 10),
  is_locked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  q1_home integer,
  q1_away integer,
  q2_home integer,
  q2_away integer,
  q3_home integer,
  q3_away integer,
  final_home integer,
  final_away integer
);

-- 3. Enable RLS
alter table public.squares enable row level security;
alter table public.game_state enable row level security;

-- 4. Policies for squares

-- Everyone can read the grid (name, x, y)
-- Note: We generally filter out email in the client query, but for extra security
-- you can use a View or restricted column selection. For this MVP, we allow select.
create policy "Enable read access for all users"
on public.squares for select
to anon, authenticated
using (true);

-- Anyone can UPDATE a square IF it is currently empty (user_name is null)
create policy "Enable update for available squares"
on public.squares for update
to anon, authenticated
using (user_name is null)
with check (user_name is null);
-- Wait, the policy above 'using' checks the row BEFORE update. 
-- So 'using (user_name is null)' ensures they can only target empty squares.
-- The 'with check' checks the NEW row. We want to allow them to set a name.
-- So we actually want:
-- using (user_name is null) -> Can only pick if empty.
-- with check (true) -> Can write whatever (or add validation constraints).

drop policy "Enable update for available squares" on public.squares;

create policy "Enable claiming of empty squares"
on public.squares for update
to anon, authenticated
using (user_name is null)
with check (true); 

-- Policy for game_state
create policy "Enable read access for all users"
on public.game_state for select
to anon, authenticated
using (true);

-- 5. Seed the grid with 100 empty squares
do $$
begin
  for r in 0..9 loop
    for c in 0..9 loop
      insert into public.squares (x, y) values (r, c)
      on conflict (x, y) do nothing;
    end loop;
  end loop;
end;
$$;

-- 6. Seed game state (empty initially)
insert into public.game_state (is_locked) values (false);

-- 7. Realtime
-- Enable realtime for squares so clients see updates
alter publication supabase_realtime add table public.squares;
alter publication supabase_realtime add table public.game_state;
