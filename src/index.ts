import express from "express";
import routes from "./routes";
import cors from "cors";
import { errorHandler } from "./app/middlewares/errorHandler";
import { query } from "./database";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errorHandler);

async function setupDatabase() {
  try {
    console.log("Verificando estrutura do banco de dados...");

    await query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS product (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS raw_material (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        quantity_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_raw_material (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL,
        raw_material_id UUID NOT NULL,
        quantity_needed DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product FOREIGN KEY (product_id) 
          REFERENCES product(id) ON DELETE CASCADE,
        CONSTRAINT fk_raw_material FOREIGN KEY (raw_material_id) 
          REFERENCES raw_material(id) ON DELETE CASCADE,
        CONSTRAINT unique_product_raw_material 
          UNIQUE (product_id, raw_material_id)
      );

      CREATE INDEX IF NOT EXISTS idx_product_code ON product(code);
      CREATE INDEX IF NOT EXISTS idx_raw_material_code ON raw_material(code);
    `);

    console.log("Estrutura do banco verificada/criada com sucesso! ");
  } catch (error) {
    console.error("Erro ao configurar banco de dados: ", error);
  }
}

setupDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}`);
  });
});
