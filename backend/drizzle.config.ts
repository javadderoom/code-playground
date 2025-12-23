// G:\Code\code-playground\backend\drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // Path to your schema file
  schema: "./src/db/schema.ts",
  
  // Where migrations will be stored
  out: "./drizzle",
  
  // Use 'postgresql' for modern drizzle-kit versions
  dialect: "postgresql",
  
  dbCredentials: {
    // Docker default connection (since you're running this from your host, use localhost)
    url: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/code_db",
  },
  
  // Clean up migration tables
  verbose: true,
  strict: true,
});