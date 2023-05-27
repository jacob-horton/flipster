# Flipster

![Flipster logo](./logo.svg)

Flash card revision tool with latex support

# Set Up

Copy the `.env.example` file to `.env`, and fill out the details. This also needs to be in the `api` directory (i.e. `api/.env`). Make sure they are the same. You can use a symbolic link to keep them in sync

# Directories

## API

- The backend of the website
- Handles connecting to database
- Uses `actix` for serving the API and `sqlx` to connect to the database
- Written in Rust 🦀

## Web

- The frontend of the website
- Uses React, Vite and Typescript
- Tailwindcss for styling

## DB

- The database
- Uses PostgreSQL in a Docker container
