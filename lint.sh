#!/usr/bin/sh

cd web && yarn lint --quiet && cd ../api && cargo fmt --check && cargo clippy
