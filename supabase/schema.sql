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
  confirmation_email_sent_at timestamptz,
  receipt_data bytea,
  receipt_mime text,
  receipt_uploaded_at timestamptz
);

create index if not exists idx_registrations_status on registrations(status);
create index if not exists idx_registrations_reference on registrations(paystack_reference);

-- Safe to re-run on an existing database that predates the receipt-upload feature:
alter table registrations add column if not exists receipt_data bytea;
alter table registrations add column if not exists receipt_mime text;
alter table registrations add column if not exists receipt_uploaded_at timestamptz;

-- Tutor portal: one row per (course, week), tracking teaching progress.
-- Tutors share a single access link (see docs/SETUP_GUIDE.md) rather than
-- individual accounts, so "updated_by" is a free-text name they type in,
-- not an authenticated identity.
create table if not exists curriculum_progress (
  course_id text not null,
  week_number integer not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'done')),
  note text,
  updated_by text,
  updated_at timestamptz not null default now(),
  primary key (course_id, week_number)
);
