// Reference: javascript_database blueprint
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool as PgPool } from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isHeliumDatabase = process.env.DATABASE_URL.includes('helium');

let pool: NeonPool | PgPool;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzleNode>;

if (isHeliumDatabase) {
  pool = new PgPool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });
  db = drizzleNode({ client: pool, schema });
} else {
  neonConfig.webSocketConstructor = ws;
  neonConfig.pipelineConnect = false;
  pool = new NeonPool({ 
    connectionString: process.env.DATABASE_URL
  });
  db = drizzleNeon({ client: pool, schema });
}

export { pool, db };
