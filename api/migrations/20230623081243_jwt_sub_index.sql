-- Using HASH type because JWT should only need to be accessed via =, and no comparisons should be required
CREATE INDEX jwt_sub_idx ON app_user USING HASH (jwt_sub)
