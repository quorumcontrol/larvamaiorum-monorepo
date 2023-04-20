
-- Set up Storage!
insert into storage.buckets (id, name, public)
  values ('images', 'images', true) on conflict do nothing;

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples for more details.

create policy "card images are publicly accessible." on storage.objects
  for select using (bucket_id = 'images');

-- use the supabase service role to create the images
