import { query } from "../../database";

interface RawMaterial {
  id: string;
  code: string;
  name: string;
  quantity_stock: number;
  created_at: Date;
  updated_at: Date;
}

type CreateRawMaterialData = Omit<
  RawMaterial,
  "id" | "created_at" | "updated_at"
>;

class RawMaterialsRepository {
  async findAll(orderBy: "ASC" | "DESC" = "ASC"): Promise<RawMaterial[]> {
    const direction = orderBy.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const rows = await query(
      `SELECT * FROM raw_material ORDER BY name ${direction}`,
    );

    return rows as RawMaterial[];
  }

  async findByCodeOrName(
    code: string,
    name: string,
  ): Promise<RawMaterial | null> {
    const rows = await query(
      `SELECT * FROM raw_material WHERE code = $1 OR name = $2 LIMIT 1`,
      [code, name],
    );

    return rows.length > 0 ? (rows[0] as RawMaterial) : null;
  }

  async findById(id: string): Promise<RawMaterial | null> {
    const rows = await query(`SELECT * FROM raw_material WHERE id = $1`, [id]);

    return rows.length > 0 ? (rows[0] as RawMaterial) : null;
  }

  async createRawMaterial(data: CreateRawMaterialData): Promise<RawMaterial> {
    const rows = await query(
      `INSERT INTO raw_material (code, name, quantity_stock)
        VALUES ($1, $2, $3)
         RETURNING *`,
      [data.code, data.name, data.quantity_stock],
    );

    return rows[0] as RawMaterial;
  }

  async updateRawMaterial(
    id: string,
    data: Partial<CreateRawMaterialData>,
  ): Promise<RawMaterial | null> {
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

    if (data.quantity_stock !== undefined) {
      fields.push(`quantity_stock = $${paramCount++}`);
      values.push(data.quantity_stock);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);

    const sql = `
      UPDATE raw_material 
      SET ${fields.join(", ")} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const rows = await query(sql, values);

    return rows.length > 0 ? (rows[0] as RawMaterial) : null;
  }

  async deleteRawMaterial(id: string): Promise<void> {
    await query(`DELETE FROM raw_material WHERE id = $1`, [id]);
  }
}

export default new RawMaterialsRepository();
