.PHONY: up down build restart logs ps clean migrate certs

up:
	docker compose up --build -d

down:
	docker compose down

build:
	docker compose build

restart: down up

logs:
	docker compose logs -f

ps:
	docker compose ps

clean:
	docker compose down -v --remove-orphans

migrate:
	docker compose exec backend python manage.py migrate

certs:
	mkdir -p nginx/certs
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/certs/privkey.pem \
		-out nginx/certs/fullchain.pem \
		-subj "/CN=localhost"