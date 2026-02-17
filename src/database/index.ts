import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "autoflex",
    };

const pool = new Pool(poolConfig);

pool.on("connect", () => {
  console.log(
    `Database connected (${process.env.DATABASE_URL ? "Production" : "Local"})`,
  );
});

pool.on("error", (err) => {
  console.error("Database error:", err);
  process.exit(-1);
});

export const query = async (text: string, values?: any[]) => {
  const { rows } = await pool.query(text, values);
  return rows;
};

export default pool;
