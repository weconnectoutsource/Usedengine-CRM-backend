# Usedengine CRM backend

TypeScript Express API with Sequelize (PostgreSQL) and Swagger. Docs are built from registered routes and Joi schemas, the same way as Voxforce Service.

Requires Node 26 (see `.nvmrc`).

## Setup

```bash
nvm use
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

- API base: `http://localhost:4000/api`
- Swagger UI: `http://localhost:4000/api/api-docs`
- OpenAPI JSON: `http://localhost:4000/api/api-docs.json`

Swagger is on when `NODE_ENV` is not `production`. Set `ENABLE_SWAGGER=true` or `false` to override.

## Adding an endpoint

1. Add a Joi schema with `.meta({ className: 'YourSchema' })`.
2. Register that schema in `src/validation/swaggerComponents.ts` so it appears under Components.
3. Call `registerRoute` with `method`, `path`, `swaggerPath`, `handler`, and optional `schema`, `tags`, and `responses`.

`registerRoute` mounts the Express handler, validates `body` / `params` / `query` when a schema is passed, and adds the operation to the OpenAPI spec.
