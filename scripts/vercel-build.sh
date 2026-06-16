#!/bin/bash
# Vercel build script: swap to PostgreSQL schema, generate Prisma Client, then build
set -e

if [ -z "$DATABASE_URL" ] && [ -z "$POSTGRES_URL" ]; then
  echo "Error: DATABASE_URL or POSTGRES_URL must be set for Vercel deployment."
  exit 1
fi

# Swap schema for PostgreSQL
cp prisma/schema.pg.prisma prisma/schema.prisma

# Generate Prisma Client (outputs to src/generated/prisma)
npx prisma generate

# Run migrations
npx prisma db push --accept-data-loss

# Build Next.js
next build
