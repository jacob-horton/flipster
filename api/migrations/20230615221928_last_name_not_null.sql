-- Add migration script here
ALTER TABLE app_user
  ALTER COLUMN last_name
  SET NOT NULL;
