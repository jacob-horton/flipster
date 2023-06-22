-- Add migration script here
ALTER TABLE folder
  ADD CONSTRAINT unqiue_name_chk UNIQUE(name, parent_id)
