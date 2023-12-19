-- Add migration script here
ALTER TABLE app_user
  ADD COLUMN last_name TEXT
  CONSTRAINT last_name_chk CHECK (char_length(last_name) <= 1024);

ALTER TABLE app_user
  RENAME COLUMN name TO first_name;

ALTER TABLE app_user
  RENAME CONSTRAINT name_chk TO first_name_chk;
