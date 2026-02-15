import { query } from "../../database/index";

interface Product {
  id: string;
  code: string;
  name: string;
  value: number;
  created_at: Date;
  updated_at: Date;
}

type CreateProductData = Omit<Product, "id" | "created_at" | "updated_at">;

class ProductsRepository {
  async findAll(orderBy: "ASC" | "DESC" = "ASC"): Promise<Product[]> {
    const direction = orderBy.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const rows = await query(
      `SELECT * FROM product ORDER BY name ${direction}`,
    );

    return rows as Product[];
  }

  async findByCodeOrName(code: string, name: string): Promise<Product | null> {
    const rows = await query(
      `SELECT * FROM product WHERE code = $1 OR name = $2 LIMIT 1`,
      [code, name],
    );

    return rows.length > 0 ? (rows[0] as Product) : null;
  }

  async findById(id: string): Promise<Product | null> {
    const rows = await query(`SELECT * FROM product WHERE id = $1`, [id]);

    return rows.length > 0 ? (rows[0] as Product) : null;
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    const rows = await query(
      `INSERT INTO product (code, name, value)
      VALUES ($1, $2, $3)
       RETURNING *`,
      [data.code, data.name, data.value],
    );

    return rows[0] as Product;
  }

  async updateProduct(
    id: string,
    data: Partial<CreateProductData>,
  ): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.code !== undefined) {
      fields.push(`code = $${paramCount++}`);
      values.push(data.code);
    }

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }

    if (data.value !== undefined) {
      fields.push(`value = $${paramCount++}`);
      values.push(data.value);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);

    const sql = `
    UPDATE product 
    SET ${fields.join(", ")} 
    WHERE id = $${paramCount} 
    RETURNING *
  `;

    const rows = await query(sql, values);

    return rows.length > 0 ? (rows[0] as Product) : null;
  }

  async deleteProduct(id: string): Promise<void> {
    await query(`DELETE FROM product WHERE id = $1`, [id]);
  }
}

export default new ProductsRepository();
