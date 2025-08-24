import dotenv from "dotenv";

dotenv.config();

interface EnvInterface {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  BCRYPT_SALT_ROUND: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
  ADMIN_PHONE: string;
  ADMIN_PIN: string;
  FRONTEND_URL: string;
}

const loadEnvVariables = (): EnvInterface => {
  const requiredEnvironmentVariables: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "BCRYPT_SALT_ROUND",
    "JWT_ACCESS_EXPIRES",
    "JWT_ACCESS_SECRET",
    "ADMIN_PHONE",
    "ADMIN_PIN",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",
    "FRONTEND_URL",
  ];

  requiredEnvironmentVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing Required Environment variable: ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    DB_URL: process.env.DB_URL!,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    ADMIN_PHONE: process.env.ADMIN_PHONE as string,
    ADMIN_PIN: process.env.ADMIN_PIN as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
  };
};

export const envVars = loadEnvVariables();
