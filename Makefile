.PHONY: help setup setup-backend setup-frontend test dev-backend dev-frontend clean-backend-venv db-up db-down db-migrate ingest build-lambda-api build-frontend-static deploy-preflight

BACKEND := backend
FRONTEND := frontend
VENV := $(BACKEND)/.venv/bin

help:
	@echo "Volty — targets"
	@echo "  make setup            venv + pip + npm install"
	@echo "  make setup-backend    Python venv en backend/.venv"
	@echo "  make setup-frontend   npm install en frontend/ (Next.js)"
	@echo "  make db-up            PostgreSQL (Docker)"
	@echo "  make db-migrate       alembic upgrade head"
	@echo "  make test             pytest (backend)"
	@echo "  make dev-backend      API en :8000"
	@echo "  make dev-frontend     UI en :3000 (rewrite /api → backend)"
	@echo "  make ingest           Energy-Charts → PostgreSQL (idempotente)"
	@echo "  make build-lambda-api zips en infra/build/"
	@echo "  make build-frontend-static  out/ para S3/CloudFront"
	@echo "  make deploy-preflight tests + lambda zip + cfn-lint"
	@echo "  make clean-backend-venv  borra backend/.venv"

setup: setup-backend setup-frontend

setup-backend:
	test -d $(VENV) || python3 -m venv $(BACKEND)/.venv
	$(VENV)/pip install -U pip
	$(VENV)/pip install -r $(BACKEND)/requirements-dev.txt

setup-frontend:
	cd $(FRONTEND) && npm install

db-up:
	docker compose up -d db

db-down:
	docker compose down

db-migrate:
	cd $(BACKEND) && $(VENV)/alembic upgrade head

test:
	cd $(BACKEND) && $(VENV)/pytest -q

dev-backend:
	cd $(BACKEND) && ./.venv/bin/uvicorn volty.main:app --reload --host 127.0.0.1 --port 8000

dev-frontend:
	cd $(FRONTEND) && npm run dev

ingest:
	cd $(BACKEND) && $(VENV)/python -m volty.ingestion.job

build-lambda-api:
	chmod +x scripts/build-lambda-api.sh && ./scripts/build-lambda-api.sh

build-frontend-static:
	cd $(FRONTEND) && VOLTY_STATIC_EXPORT=1 npm run build

deploy-preflight: test build-lambda-api
	@command -v cfn-lint >/dev/null || { echo "pip install cfn-lint" >&2; exit 1; }
	cfn-lint -c infra/cloudformation/.cfnlintrc.yaml --non-zero-exit-code error \
		infra/cloudformation/volty.yaml infra/cloudformation/volty-cdn.yaml

clean-backend-venv:
	rm -rf $(BACKEND)/.venv
