.PHONY: help setup setup-backend setup-frontend test dev-backend dev-frontend clean-backend-venv

BACKEND := backend
FRONTEND := frontend
VENV := $(BACKEND)/.venv/bin

help:
	@echo "Volty — targets"
	@echo "  make setup            venv + pip + npm install"
	@echo "  make setup-backend    Python venv en backend/.venv"
	@echo "  make setup-frontend   npm install en frontend/"
	@echo "  make test             pytest (backend)"
	@echo "  make dev-backend      API en :8000"
	@echo "  make dev-frontend     UI en :5173 (proxy /api → backend)"
	@echo "  make clean-backend-venv  borra backend/.venv"

setup: setup-backend setup-frontend

setup-backend:
	test -d $(VENV) || python3 -m venv $(BACKEND)/.venv
	$(VENV)/pip install -U pip
	$(VENV)/pip install -r $(BACKEND)/requirements-dev.txt

setup-frontend:
	cd $(FRONTEND) && (command -v pnpm >/dev/null 2>&1 && pnpm install || npm install)

test:
	cd $(BACKEND) && $(VENV)/pytest -q

dev-backend:
	cd $(BACKEND) && $(VENV)/uvicorn volty.main:app --reload --host 127.0.0.1 --port 8000

dev-frontend:
	cd $(FRONTEND) && npm run dev

clean-backend-venv:
	rm -rf $(BACKEND)/.venv
