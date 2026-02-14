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

CREATE INDEX idx_product_code ON product(code);
CREATE INDEX idx_raw_material_code ON raw_material(code);
CREATE INDEX idx_product_raw_material_product ON product_raw_material(product_id);
CREATE INDEX idx_product_raw_material_raw ON product_raw_material(raw_material_id);
