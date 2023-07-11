run-web:
	cd web; yarn dev

run-api:
	cd api; cargo watch -x run

run:
	cd web; yarn dev -p 5173 & cd ../api; cargo watch -x run

run-tmux:
	tmux new-session -d -s web 'cd web; yarn dev'
	tmux new-session -d -s api 'cd api; cargo watch -x run'

format:
	cd web; yarn format
	cd api; cargo fmt

lint:
	cd web && yarn lint --quiet && cd ../api && cargo fmt --check && cargo clippy
