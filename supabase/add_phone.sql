-- Add phone number to profiles for WhatsApp
alter table profiles
  add column if not exists phone text;
