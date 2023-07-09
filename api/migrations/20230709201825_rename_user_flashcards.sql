-- Add migration script here
ALTER TABLE app_user
RENAME COLUMN flashcards TO top_level_folder;

ALTER TABLE app_user
RENAME CONSTRAINT fk_flashcards TO fk_tlf;
