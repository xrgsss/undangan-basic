-- ============================================================================
--  SKEMA SUPABASE — RSVP & UCAPAN TAMU
-- ----------------------------------------------------------------------------
--  Cara pakai:
--   1. Buka project Supabase Anda → SQL Editor → New query
--   2. Tempel SELURUH isi file ini, lalu Run
--   3. Salin Project URL & anon key ke file .env (lihat .env.example)
--
--  Yang disiapkan file ini:
--   • Tabel `rsvp_wishes` + index + CHECK constraint (validasi sisi server)
--   • Trigger normalisasi teks (membersihkan karakter kontrol)
--   • Trigger pembatas spam (maks. 3 kiriman / 60 detik per IP+User-Agent)
--   • Row Level Security: publik hanya boleh SELECT & INSERT (tidak bisa
--     mengubah atau menghapus data orang lain)
--   • Realtime untuk tabel (opsional, agar ucapan baru muncul otomatis)
--   • View ringkasan kehadiran
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabel utama
-- ---------------------------------------------------------------------------
create table if not exists public.rsvp_wishes (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  attendance  text        not null,
  guests      smallint    not null default 1,
  message     text        not null,
  created_at  timestamptz not null default now(),
  -- Sidik jari pengirim (hash IP + User-Agent) untuk pembatas spam.
  -- Tidak pernah ditampilkan di antarmuka dan tidak bisa diisi dari klien
  -- karena dihitung ulang oleh trigger BEFORE INSERT.
  client_hash text        not null default 'unknown',

  -- Validasi sisi server: tidak bisa dilewati dari sisi klien.
  constraint rsvp_name_length     check (char_length(btrim(name)) between 2 and 70),
  constraint rsvp_message_length  check (char_length(btrim(message)) between 3 and 400),
  constraint rsvp_attendance_enum check (attendance in ('hadir', 'tidak_hadir', 'ragu')),
  constraint rsvp_guests_range    check (guests between 0 and 10),
  -- Konsistensi: tamu yang tidak hadir/ragu tidak boleh membawa rombongan.
  constraint rsvp_guests_consistency check (
    (attendance = 'hadir' and guests between 1 and 10)
    or (attendance in ('tidak_hadir', 'ragu') and guests = 0)
  )
);

create index if not exists rsvp_wishes_created_at_idx on public.rsvp_wishes (created_at desc);
create index if not exists rsvp_wishes_client_hash_idx on public.rsvp_wishes (client_hash, created_at desc);

-- Trigger di bawah memakai digest() dari pgcrypto.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 2. Normalisasi teks + pembatas spam (berjalan di server)
-- ---------------------------------------------------------------------------
create or replace function public.rsvp_wishes_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  client_ip    text;
  client_ua    text;
  recent_count integer;
  rate_limit   constant integer := 3;   -- maksimum kiriman ...
  window_len   constant interval := interval '60 seconds'; -- ... per 60 detik
begin
  -- Bersihkan karakter kontrol dan rapikan spasi berlebih.
  new.name    := btrim(regexp_replace(new.name,    '[[:cntrl:]]+', ' ', 'g'));
  new.message := btrim(regexp_replace(new.message, '[[:cntrl:]]+', ' ', 'g'));
  new.name    := regexp_replace(new.name,    '\s{2,}', ' ', 'g');
  new.message := regexp_replace(new.message, '\s{2,}', ' ', 'g');

  -- Ambil identitas pengirim dari header request PostgREST bila tersedia.
  begin
    client_ip := coalesce(
      (current_setting('request.headers', true)::json ->> 'x-forwarded-for'),
      'unknown'
    );
    client_ua := coalesce(
      (current_setting('request.headers', true)::json ->> 'user-agent'),
      'unknown'
    );
  exception when others then
    client_ip := 'unknown';
    client_ua := 'unknown';
  end;

  -- Simpan hash (bukan IP mentah) agar tidak menyimpan data pribadi.
  -- created_at selalu ditetapkan server agar urutan ucapan tidak bisa dipalsukan.
  new.client_hash := encode(digest(client_ip || '|' || client_ua, 'sha256'), 'hex');
  new.created_at  := now();

  -- Pembatas spam: berapa kali klien yang sama mengirim dalam 60 detik terakhir.
  select count(*) into recent_count
  from public.rsvp_wishes
  where client_hash = new.client_hash
    and created_at > now() - window_len;

  if recent_count >= rate_limit then
    raise exception 'Terlalu banyak pengiriman ucapan. Mohon coba lagi beberapa saat lagi.'
      using errcode = 'PT429';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_rsvp_wishes_before_insert on public.rsvp_wishes;
create trigger trg_rsvp_wishes_before_insert
  before insert on public.rsvp_wishes
  for each row execute function public.rsvp_wishes_before_insert();

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.rsvp_wishes enable row level security;

-- Hapus policy lama agar aman dijalankan berulang kali (idempotent).
drop policy if exists "rsvp public read"   on public.rsvp_wishes;
drop policy if exists "rsvp public insert" on public.rsvp_wishes;

-- Siapa pun (anon) boleh membaca daftar ucapan.
create policy "rsvp public read"
  on public.rsvp_wishes
  for select
  to anon, authenticated
  using (true);

-- Siapa pun (anon) boleh menambah ucapan, dengan validasi di level baris.
-- Kolom `created_at` dan `client_hash` yang dikirim klien akan DITIMPA oleh
-- trigger BEFORE INSERT, jadi tidak bisa dipalsukan dari sisi browser.
create policy "rsvp public insert"
  on public.rsvp_wishes
  for insert
  to anon, authenticated
  with check (
    char_length(btrim(name)) between 2 and 70
    and char_length(btrim(message)) between 3 and 400
    and attendance in ('hadir', 'tidak_hadir', 'ragu')
    and guests between 0 and 10
  );

-- Tidak ada policy UPDATE / DELETE → data tidak dapat diubah/dihapus oleh anon.
-- (Hapus data moderasi hanya bisa dilakukan lewat dashboard / service_role.)

-- ---------------------------------------------------------------------------
-- 4. Realtime (opsional: ucapan baru langsung muncul di layar tamu lain)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'rsvp_wishes'
  ) then
    alter publication supabase_realtime add table public.rsvp_wishes;
  end if;
exception when others then
  raise notice 'Realtime belum diaktifkan otomatis. Aktifkan manual: Database > Replication > rsvp_wishes';
end $$;

-- ---------------------------------------------------------------------------
-- 5. View ringkasan (dipakai bila ingin menampilkan statistik kehadiran)
-- ---------------------------------------------------------------------------
create or replace view public.rsvp_summary
with (security_invoker = true) as
select
  count(*) filter (where attendance = 'hadir')        as hadir,
  count(*) filter (where attendance = 'tidak_hadir')  as tidak_hadir,
  count(*) filter (where attendance = 'ragu')         as ragu,
  coalesce(sum(guests) filter (where attendance = 'hadir'), 0) as perkiraan_tamu,
  count(*)                                            as total
from public.rsvp_wishes;

grant select on public.rsvp_summary to anon, authenticated;
