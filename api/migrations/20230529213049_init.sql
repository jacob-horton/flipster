-- Add migration script here

CREATE TABLE folder(
  id            SERIAL PRIMARY KEY                     NOT NULL,
  name          TEXT                                   NOT NULL,
  colour        CHAR(6),  -- 6 character hex string (no '#')
  date_created  TIMESTAMPTZ                            NOT NULL DEFAULT now(),
  last_modified TIMESTAMPTZ                            NOT NULL DEFAULT now(),
  parent_id     INT,

  CONSTRAINT fk_parent_id
    FOREIGN KEY(parent_id)
    REFERENCES folder(id)
    ON DELETE CASCADE,

  CONSTRAINT name_chk
    CHECK (char_length(name) <= 64),

  CONSTRAINT unique_name_chk
    UNIQUE(name, parent_id)
);

CREATE TABLE flashcard(
  id            SERIAL PRIMARY KEY                      NOT NULL,
  term          TEXT                                    NOT NULL,
  definition    TEXT                                    NOT NULL,
  folder_id     INT                                     NOT NULL,
  date_created  TIMESTAMPTZ                             NOT NULL DEFAULT now(),
  last_modified TIMESTAMPTZ                             NOT NULL DEFAULT now(),

  CONSTRAINT fk_folder_id
    FOREIGN KEY(folder_id)
    REFERENCES folder(id)
    ON DELETE CASCADE,

  CONSTRAINT term_chk
    CHECK (char_length(term) <= 1024),

  CONSTRAINT definition_chk
    CHECK (char_length(definition) <= 1024)
);

CREATE TABLE app_user(
  id            SERIAL PRIMARY KEY                      NOT NULL,
  first_name    TEXT                                    NOT NULL,
  last_name     TEXT                                    NOT NULL,
  username      TEXT                                    NOT NULL,
  date_created  TIMESTAMPTZ                             NOT NULL DEFAULT now(),
  flashcards    INT                                     NOT NULL,
  jwt_sub       TEXT                                    NOT NULL,

  CONSTRAINT fk_flashcards
    FOREIGN KEY(flashcards)
    REFERENCES folder(id),

  CONSTRAINT fisrt_name_chk
    CHECK (char_length(first_name) <= 64),

  CONSTRAINT last_name_chk
    CHECK (char_length(last_name) <= 64),

  CONSTRAINT username_chk
    CHECK (char_length(username) <= 16)
);

CREATE TABLE app_group(
  id            SERIAL PRIMARY KEY  NOT NULL,
  name          TEXT                NOT NULL,
  description   TEXT                NOT NULL,
  is_public     BOOL                NOT NULL,
  date_created  TIMESTAMPTZ         NOT NULL DEFAULT now(),

  CONSTRAINT name_chk
    CHECK (char_length(name) <= 64),

  CONSTRAINT description_chk
    CHECK (char_length(description) <= 1024)
);

CREATE TYPE member_type AS ENUM ('member', 'admin', 'owner');

CREATE TABLE group_member(
  id            SERIAL PRIMARY KEY                        NOT NULL,
  app_user_id   INT                                       NOT NULL,
  app_group_id  INT                                       NOT NULL,
  role          member_type                               NOT NULL,
  date_joined   TIMESTAMPTZ                                NOT NULL DEFAULT now(),

  CONSTRAINT fk_app_user_id
    FOREIGN KEY(app_user_id)
    REFERENCES app_user(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_app_group_id
    FOREIGN KEY(app_group_id)
    REFERENCES app_group(id)
    ON DELETE CASCADE
);

CREATE TYPE answer_type AS ENUM ('definition', 'term');

CREATE TABLE incorrect_answer(
  id            SERIAL PRIMARY KEY                        NOT NULL,
  flashcard_id  INT                                       NOT NULL,
  answer        TEXT                                      NOT NULL,
  type          answer_type                               NOT NULL,

  CONSTRAINT fk_flashcard_id
    FOREIGN KEY(flashcard_id)
    REFERENCES flashcard(id)
    ON DELETE CASCADE,

  CONSTRAINT answer_chk
    CHECK (char_length(answer) <= 1024)
);

CREATE TABLE often_confused(
  id                      SERIAL PRIMARY KEY                        NOT NULL,
  flashcard_id            INT                                       NOT NULL,
  value                   TEXT                                      NOT NULL,
  type                    answer_type                               NOT NULL,
  confused_flashcard_id   INT,

  CONSTRAINT fk_flashcard_id
    FOREIGN KEY(flashcard_id)
    REFERENCES flashcard(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_confused_flashcard_id
    FOREIGN KEY(confused_flashcard_id)
    REFERENCES flashcard(id)
    ON DELETE CASCADE,

  CONSTRAINT value_chk
    CHECK (char_length(value) <= 1024)
);

CREATE TABLE alternate_answer(
  id            SERIAL PRIMARY KEY                        NOT NULL,
  flashcard_id  INT                                       NOT NULL,
  answer        TEXT                                      NOT NULL,
  type          answer_type                               NOT NULL,

  CONSTRAINT fk_flashcard_id
    FOREIGN KEY(flashcard_id)
    REFERENCES flashcard(id)
    ON DELETE CASCADE,

  CONSTRAINT answer_chk
    CHECK (char_length(answer) <= 1024)
);


CREATE TABLE card_revised(
  id            SERIAL PRIMARY KEY                        NOT NULL,
  flashcard_id  INT                                       NOT NULL,
  date_revised  TIMESTAMPTZ                                NOT NULL DEFAULT now(),
  correct       BOOL                                      NOT NULL,

  CONSTRAINT fk_flashcard_id
    FOREIGN KEY(flashcard_id)
    REFERENCES flashcard(id)
    ON DELETE CASCADE
);

CREATE INDEX jwt_sub_idx ON app_user USING HASH(jwt_sub)

-- TODO: Flashcard images
-- TODO: PDFs/other files
-- TODO: Revision type for `card_revised` e.g. true/false, multiple choice, type answer, match, ...
-- TODO: Icon path for group

