create table token_promo_codes (
  code varchar(64) not null primary key,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  amount INTEGER
);
