-- User profile and settings (CLAUDE.md 4.2): one row per auth user, created
-- automatically on sign-up. The day start hour and day part boundaries are
-- added in G3.1.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null
    check (char_length(display_name) between 1 and 50),
  -- GitHub photo. Uploads are in the backlog; without a photo the UI shows initials.
  avatar_url text check (avatar_url is null or avatar_url like 'https://%'),
  locale text not null default 'en' check (locale in ('en', 'es')),
  -- IANA name reported by the browser on the first visit; null until then.
  timezone text,
  theme_mode text not null default 'auto'
    check (theme_mode in ('light', 'dark', 'auto')),
  sound_enabled boolean not null default true,
  sound_volume smallint not null default 70
    check (sound_volume between 0 and 100),
  -- 'system' follows prefers-reduced-motion; the others override it.
  reduced_motion text not null default 'system'
    check (reduced_motion in ('system', 'reduce', 'no-preference')),
  streak_threshold smallint not null default 80
    check (streak_threshold between 50 and 100),
  pomodoro_focus_minutes smallint not null default 25
    check (pomodoro_focus_minutes between 1 and 120),
  pomodoro_short_break_minutes smallint not null default 5
    check (pomodoro_short_break_minutes between 1 and 60),
  pomodoro_long_break_minutes smallint not null default 15
    check (pomodoro_long_break_minutes between 1 and 120),
  pomodoro_sessions_before_long_break smallint not null default 4
    check (pomodoro_sessions_before_long_break between 1 and 12),
  ai_note_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Profile and settings of each user (CLAUDE.md 4.2).';

-- Keeps updated_at current and rejects unknown time zones.
create function public.profiles_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.timezone is not null then
    -- Raises "time zone ... not recognized" for anything that is not IANA.
    perform now() at time zone new.timezone;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_before_write
  before insert or update on public.profiles
  for each row execute function public.profiles_before_write();

-- Creates the profile of a new user from what sign-up knows: the GitHub name
-- and photo, the email, and the UI language at sign-up time.
create function public.create_profile(new_user auth.users)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new_user.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, display_name, avatar_url, locale)
  values (
    new_user.id,
    left(
      coalesce(
        nullif(btrim(meta ->> 'full_name'), ''),
        nullif(btrim(meta ->> 'name'), ''),
        nullif(btrim(meta ->> 'user_name'), ''),
        nullif(split_part(coalesce(new_user.email, ''), '@', 1), ''),
        'Deskmate user'
      ),
      50
    ),
    case when meta ->> 'avatar_url' like 'https://%' then meta ->> 'avatar_url' end,
    case when meta ->> 'locale' in ('en', 'es') then meta ->> 'locale' else 'en' end
  )
  on conflict (id) do nothing;
end;
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.create_profile(new);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Internal functions: never callable through the API.
revoke execute on function public.create_profile(auth.users) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.profiles_before_write() from public, anon, authenticated;

-- Profiles for the users who signed up before this migration.
select public.create_profile(u) from auth.users as u;

-- Row Level Security: each user reads and updates only their own row. Rows are
-- created by the trigger above and deleted with the auth user.
alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Supabase grants every privilege on new tables to the API roles by default.
-- Narrow them: no access for anonymous visitors, and only the settings
-- columns are writable (not id, avatar_url, or timestamps).
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (
  display_name,
  locale,
  timezone,
  theme_mode,
  sound_enabled,
  sound_volume,
  reduced_motion,
  streak_threshold,
  pomodoro_focus_minutes,
  pomodoro_short_break_minutes,
  pomodoro_long_break_minutes,
  pomodoro_sessions_before_long_break,
  ai_note_enabled
) on public.profiles to authenticated;
