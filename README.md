# Stylos — E-commerce Backend

**Production-grade e-commerce REST API** built with NestJS, Prisma and PostgreSQL, following **Domain-Driven Design** — a full catalog → cart → checkout domain, dev/prod Docker images, and **Ansible-provisioned deployment** (fail2ban hardening + AWS SSM secrets).

![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Ansible](https://img.shields.io/badge/Ansible-EE0000?logo=ansible&logoColor=white)

## Highlights

- **Domain-Driven Design** — products, variants, categories, brands, cart, orders and shipping are modeled as a clean domain (entities, value objects, use-cases, repository ports); NestJS and Prisma stay at the infrastructure edge. **~80 test files.**
- **Full e-commerce domain** — catalog (products, variants, colors, sizes, categories, brands), cart & items, orders & items, shipping, addresses, archived carts.
- **Production DevOps** — separate `Dockerfile.dev` / `Dockerfile.prod`, `docker-compose` for dev and prod, and an **Ansible** role that provisions the host (Docker setup, **fail2ban** hardening), with secrets loaded from **AWS SSM** (`load-ssm-env.sh`).
- **Executable API docs** — `.http` files per resource (products, cart, orders, categories, …) for quick REST testing.

## Tech stack

NestJS · TypeScript · Prisma · PostgreSQL · DDD / Clean Architecture · Docker (dev/prod) · Ansible · AWS SSM · pnpm

## Domain (Prisma)

`Product` · `ProductVariant` · `Color` · `Size` · `Category` · `Brand` · `Cart` · `CartItem` · `Order` · `OrderItem` · `Shipping` · `Address` · `Customer`

## Getting started

```bash
cp .env.example .env            # or use load_env.sh
docker compose -f docker-compose.dev.yml up -d
pnpm install
pnpm prisma migrate dev
pnpm start:dev
```

## Deployment

The `ansible-config/` role provisions the server (Docker, fail2ban) and deploys the production image; environment variables are pulled from **AWS SSM** at boot. Prod build via `Dockerfile.prod` + `docker-compose.prod.yml`.
