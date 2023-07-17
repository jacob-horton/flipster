-- Add migration script here
ALTER TABLE app_group
ADD COLUMN top_level_folder INT NOT NULL;

ALTER TABLE app_group
ADD CONSTRAINT fk_tlf
FOREIGN KEY(top_level_folder)
REFERENCES folder(id);

