#!/bin/bash
# Vercel build script: swap to PostgreSQL schema, generate Prisma Client, then build

# Swap schema for PostgreSQL
cp prisma/schema.pg.prisma prisma/schema.prisma

# Generate Prisma Client (outputs to src/generated/prisma)
npx prisma generate

# Run migrations
npx prisma db push --accept-data-loss

# Build Next.js
next build
