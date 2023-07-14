# Flipster

![Flipster logo](./logo.svg)

Flashcard revision web application with (planned) $\LaTeX$ support.

# Installing

See ![Development Setup](https://github.com/jacob-horton/flipster/wiki/Development-Setup)

# Contributing

See the ![style guide](https://github.com/jacob-horton/flipster/wiki/Style-Guide)

# Commands

**Using make**
Make has several useful commands configured. The most useful one is `make run`, which will run the front end and the back end and update both when files are modified.

This requires [cargo watch](https://github.com/watchexec/cargo-watch), which will rerun a cargo command when a file change is detected. In this case, `make run` will use `cargo watch -x run`

If you have [tmux](https://github.com/tmux/tmux) and would like to use it, `make run-tmux` will start the front and back end in separate tmux sessions. `make stop-tmux` will kill these sessions

**Manually**
To run the front end, go to the `web` directory (`cd web`), and run:

```bash
yarn dev -p 5173
```

Where `-p` specifies the port number of the website

---

To run the back end, go to the 'api` directory (`cd api`), and run:

```bash
cargo run
```

If you would like it to automatically rebuild when you make file changes, see **_Using make_** for how to install cargo watch, then use the following command instead of above:

```bash
cargo watch -x run
```

Finally, go to http://localhost:5173 to view the website

# Running

You can run both web and API at the same time using `make run`, or `make run-tmux` to run the web and API in separate tmux sessions

Linting can be run on both web and API using `make lint`, and similarly for `make format`

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
