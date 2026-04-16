-- Allow admins to insert, update, delete videos
create policy "videos: admin write" on videos
  for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
