-- Add migration script here
ALTER TABLE app_user RENAME COLUMN email TO jwt_sub;
