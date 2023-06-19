FROM rust as build
ARG DATABASE_URL
WORKDIR /usr/src/app

COPY ./Cargo.toml .
COPY ./src ./src
COPY ./migrations ./migrations

RUN cargo build --release


FROM debian:buster-slim as main

RUN apt update && apt install -y ca-certificates libc6-dev libssl1.1 && apt clean && rm -rf /var/lib
COPY --from=build /usr/src/app/target/release/api /api
EXPOSE 8080

CMD ["/api"]
