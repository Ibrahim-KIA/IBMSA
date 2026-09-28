-- Run this once in your Supabase project's SQL Editor (or any Postgres
-- database's SQL console) before going live. See docs/SETUP_GUIDE.md.

create extension if not exists pgcrypto;

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  whatsapp text not null,
  address text not null,
  kin_name text not null,
  kin_phone text not null,
  course_ids text[] not null,
  subtotal_kobo integer not null,
  reg_fee_kobo integer not null,
  discount_kobo integer not null,
  total_kobo integer not null,
  paystack_reference text unique not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  confirmation_email_sent_at timestamptz
);

create index if not exists idx_registrations_status on registrations(status);
create index if not exists idx_registrations_reference on registrations(paystack_reference);
