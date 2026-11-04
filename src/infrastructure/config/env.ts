export interface AppEnv {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

function resolveEnv(): AppEnv {
  const nodeEnv = (process.env.NODE_ENV || "development") as AppEnv["NODE_ENV"];
  const port = Number.parseInt(process.env.PORT || "3000", 10);
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://foliouser:foliopass@localhost:5432/foliocity";
  const authSecret =
    process.env.BETTER_AUTH_SECRET ||
    "development_secret_key_at_least_32_characters_long_for_auth";
  const authUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  if (nodeEnv === "production") {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be defined in production");
    }
    if (!process.env.BETTER_AUTH_SECRET) {
      throw new Error("BETTER_AUTH_SECRET must be defined in production");
    }
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: Number.isNaN(port) ? 3000 : port,
    DATABASE_URL: databaseUrl,
    BETTER_AUTH_SECRET: authSecret,
    BETTER_AUTH_URL: authUrl,
  };
}

export const env = resolveEnv();
