-- Add migration script here
DELETE FROM app_group;

ALTER TABLE app_group
  ADD COLUMN uuid TEXT NOT NULL;

CREATE INDEX uuid_idx ON app_group USING HASH (uuid)
