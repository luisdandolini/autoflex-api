import { query } from "../../database/index";

interface ProductRawMaterial {
  id: string;
  product_id: string;
  raw_material_id: string;
  quantity_needed: number;
  created_at: Date;
}

type CreateProductRawMaterialData = {
  product_id: string;
  raw_material_id: string;
  quantity_needed: number;
};

class ProductsRawMaterialsRepository {
  async findByProductId(product_id: string) {
    const rows = await query(
      `SELECT 
      prm.id,
      prm.quantity_needed,
      prm.created_at,
      rm.id as raw_material_id,
      rm.code as raw_material_code,
      rm.name as raw_material_name,
      rm.quantity_stock
    FROM product_raw_material prm
    JOIN raw_material rm ON prm.raw_material_id = rm.id
    WHERE prm.product_id = $1`,
      [product_id],
    );

    return rows;
  }

  async createProductRawMaterial(
    data: CreateProductRawMaterialData,
  ): Promise<ProductRawMaterial> {
    const rows = await query(
      `INSERT INTO product_raw_material (product_id, raw_material_id, quantity_needed)
      VALUES ($1, $2, $3)
       RETURNING *`,
      [data.product_id, data.raw_material_id, data.quantity_needed],
    );

    return rows[0] as ProductRawMaterial;
  }

  async findByProductAndRawMaterial(
    product_id: string,
    raw_material_id: string,
  ): Promise<ProductRawMaterial | null> {
    const rows = await query(
      `SELECT * FROM product_raw_material 
        WHERE product_id = $1 AND raw_material_id = $2 
        LIMIT 1`,
      [product_id, raw_material_id],
    );

    return rows.length > 0 ? (rows[0] as ProductRawMaterial) : null;
  }
}

export default new ProductsRawMaterialsRepository();
