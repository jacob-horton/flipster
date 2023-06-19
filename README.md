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

1. Go to the keycloak web interface (`http://<ip>:8180/admin`)
2. Login with the credentials in `.env` and go to the administration console
3. Create a new realm called `flipster` (lower case) by clicking on `Master` in the top left
4. In `Realm Settings`, click on the `Login` tab, and choose desired settings (`User registration`, `Forgot password`, etc.)
5. In `Clients`, click `Create` and name the client the same as in `.env` (`react-auth` by default)
6. Turn on client authentication
7. Put `http://localhost:5173` in `Valid redirect URIs` and `Web origins`
8. Go to `Credentials` and copy the client secret into `.env` where it says `<client_secret>`
9. To add Google login or similar, go to `Identity providers` and `Add provider`, then fill in the details

## 5. Web/API

Run the API by navigating to `./api` and running `cargo run`

Run the web frontend by navigating to `./web` and running `yarn dev`

# Directories

## API

- The backend API of the website
- Handles connecting to database
- Uses `actix` for serving the API and `sqlx` to connect to the database
- Written in Rust 🦀

## Web

- The frontend of the website
- Uses React, NextJS and TypeScript
- Tailwind CSS for styling
