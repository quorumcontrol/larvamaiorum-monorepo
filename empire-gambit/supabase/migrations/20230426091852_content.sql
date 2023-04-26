create extension if not exists vector
with
  schema extensions;

CREATE TABLE content (
  id VARCHAR(64) PRIMARY KEY,
  saver UUID REFERENCES auth.users(id),
  url TEXT,
  title TEXT,
  description TEXT,
  favicon TEXT,
  image TEXT,
  summary TEXT,
  short_summary TEXT,
  language VARCHAR(2),
  embedding VECTOR(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE content_chunks (
  content_id VARCHAR(64) NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  chunk_order INTEGER NOT NULL,
  summary TEXT,
  short_summary TEXT,
  embedding VECTOR(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (content_id, chunk_order)
);

CREATE TABLE tags (
  name VARCHAR(64) PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content_tags join table
CREATE TABLE content_tags (
  content_id VARCHAR(64) NOT NULL,
  tag_name VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (content_id, tag_name),
  FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_name) REFERENCES tags (name) ON DELETE CASCADE
);


-- Set up Storage!
insert into storage.buckets (id, name, public)
  values ('content', 'content', true) on conflict do nothing;

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples for more details.

create policy "content files are publicly accessible." on storage.objects
  for select using (bucket_id = 'content');
  
-- for now we don't need RLS because we want to process these anyway

