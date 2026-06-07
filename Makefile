.PHONY: up down logs ps build clean reset dev

ENV_FILE ?= .env
COMPOSE  := docker compose -f infra/docker-compose.yml --env-file $(ENV_FILE)

up:
	@if [ ! -f $(ENV_FILE) ]; then cp .ralph/examples/.env.example $(ENV_FILE); fi
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=200

ps:
	$(COMPOSE) ps

build:
	$(COMPOSE) build

clean:
	$(COMPOSE) down -v

reset: clean up

dev:
	$(COMPOSE) up -d postgres redis
	pnpm --filter @nimbus/api start:dev &
	pnpm --filter @nimbus/web dev
