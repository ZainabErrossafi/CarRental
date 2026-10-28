.PHONY: up down build restart re logs ps clean migrate certs db-sync-password

up: certs
	docker compose up --build -d

down:
	docker compose down

build:
	docker compose build

restart: down up

re: restart

logs:
	docker compose logs -f

ps:
	docker compose ps

clean:
	docker compose down -v --remove-orphans

migrate:
	docker compose exec backend python manage.py migrate

db-sync-password:
	docker compose exec -T postgres sh -c 'psql --no-psqlrc --set=ON_ERROR_STOP=1 --username="$$POSTGRES_USER" --dbname=postgres' < scripts/sync-db-password.sql

create_user:
	docker compose exec backend python manage.py createsuperuser
certs:
	sh nginx/generate-certs.sh
