.PHONY: up down build restart logs ps clean migrate certs

up: certs
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
create_user:
	docker compose exec backend python manage.py createsuperuser
certs:
	sh nginx/generate-certs.sh
