# Flipster

![Flipster logo](./logo.svg)

Flash card revision tool with latex support

# Set Up

## 1. Env

Copy the `.env.example` file to `.env`. Make necessary changes
Note: keycloak uses PostgreSQL, but this is separate from the other PostgreSQL container, so can (and should) have different credentials

The default settings should work if everything runs on the same machine, but are not secure (i.e. credentials)

## 2. Running Containers

Run the containers with `docker-compose up -d`

## 3. Database

Set up the database by first going into `api` (`cd api`), then running `sqlx migrate run`
This requires `sqlx-cli` to be installed (`cargo install sqlx-cli`)

## 4. Keycloak

1. Go to the the keycloak web interface (`http://<ip>:8180`)
2. Login with the credentials in `keycloak.dev.env` and go to the administration console
3. Create a new realm called `flipster` (lower case) by hovering over `Master` in the top left
4. In `Realm Settings`, click on the `Login` tab, and choose desired settings (`User registration`, `Remember me`, `Require SSL: none`, etc.)
5. In `Clients`, click `Create` and name the client the same as in `.env` (`react-auth` by default)
6. Click save, then put `http://localhost:5173` in `Valid redirect URIs` and `Web origins`
7. To add Google login or similar, go to `Identity providers` and `Add provider`, then fill in the details

# Directories

## API

- The backend API of the website
- Handles connecting to database
- Uses `actix` for serving the API and `sqlx` to connect to the database
- Written in Rust 🦀

## Web

- The frontend of the website
- Uses React, Vite and TypeScript
- Tailwind CSS for styling

## Data (needs to be created)

- Where data for the auth database and api database is stored
- Uses PostgreSQL in a Docker container for both
