#!/usr/bin/sh
cd web; yarn format
cd ../api; cargo fmt
