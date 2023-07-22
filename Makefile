run-web:
	cd web; yarn dev

run-api:
	cd api; cargo watch -x run

run:
	cd web; yarn dev -p 5173 & cd ../api; cargo watch -x run

run-colima:
	colima start
	docker-compose up -d

run-colima-tmux: run-colima run-tmux

run-tmux:
	tmux new-session -d -s web 'cd web; yarn dev'
	tmux new-session -d -s api 'cd api; cargo watch -x run'

stop-tmux:
	tmux kill-session -t web
	tmux kill-session -t api

stop-colima:
	docker-compose down
	colima stop

stop-colima-tmux: stop-colima stop-tmux

format:
	cd web; yarn format
	cd api; cargo fmt

lint:
	cd web && yarn lint --quiet && cd ../api && cargo fmt --check && cargo clippy

export-types:
	cd api; cargo test
