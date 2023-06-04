CREATE TABLE free_readings (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  day_of_play DATE DEFAULT CURRENT_DATE,
  amount INTEGER DEFAULT 0 NOT NULL,
  PRIMARY KEY (user_id, day_of_play)
);

alter table
  free_readings enable row level security;

create policy "Free readings counts are readable by the user" on free_readings for select using (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION increment_free_reading(p_user_id UUID) RETURNS void AS $$
BEGIN
  INSERT INTO free_readings (user_id, day_of_play, amount)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, day_of_play)
  DO UPDATE SET amount = free_readings.amount + 1;
END;
$$ LANGUAGE plpgsql;
