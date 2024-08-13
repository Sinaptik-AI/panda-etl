.PHONY: run migrate upgrade

run:
	poetry run uvicorn app.main:app --reload --port 5328

migrate:
	poetry run alembic upgrade head

.PHONY: generate-migration 
generate-migration: 
	poetry run alembic revision --autogenerate -m "$$message"

test:
	poetry run pytest