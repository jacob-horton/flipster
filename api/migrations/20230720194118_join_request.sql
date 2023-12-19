-- Add migration script here
CREATE TABLE join_request(
  id            SERIAL PRIMARY KEY  NOT NULL,
  app_group_id  INT                 NOT NULL,
  app_user_id   INT                 NOT NULL,
  date_sent     TIMESTAMPTZ         NOT NULL DEFAULT now()
);

