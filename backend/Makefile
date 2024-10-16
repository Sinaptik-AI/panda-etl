.PHONY: run migrate upgrade

run:
	poetry run uvicorn app.main:app --reload --port 5328 --log-level info

migrate:
	poetry run alembic upgrade head

.PHONY: generate-migration
generate-migration:
	poetry run alembic revision --autogenerate -m "$$message"

test:
	poetry run pytest


# Check code for linting issues
lint:
	poetry run ruff check .

# Automatically fix linting issues where possible
lint-fix:
	poetry run ruff check . --fix --show-fixes
