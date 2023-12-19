{ pkgs ? import <unstable> { } }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    rustc
    cargo
    cargo-watch
    sqlx-cli
    rustfmt
    rust-analyzer
    clippy
    pkg-config
    openssl
  ];
}
