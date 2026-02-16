import { Request, Response } from "express";
import { AppError } from "../../errors/AppError.js";
import RawMaterialsRepository from "../repositories/RawMaterialsRepository";
import ProductsRawMaterialsRepository from "../repositories/ProductsRawMaterialsRepository";
import ProductsRepository from "../repositories/ProductsRepository.js";

class ProductRawMaterialController {
  async index(request: Request, response: Response) {
    const { product_id } = request.params;

    const productId = product_id as string;

    const associations =
      await ProductsRawMaterialsRepository.findByProductId(productId);

    return response.json({
      count: associations.length,
      data: associations,
    });
  }

  async create(request: Request, response: Response) {
    const { product_id } = request.params;
    const { raw_material_id, quantity_needed } = request.body;

    const productId = product_id as string;

    if (!raw_material_id || quantity_needed === undefined) {
      throw new AppError(
        "raw_material_id and quantity_needed are required",
        400,
      );
    }

    if (Number(quantity_needed) <= 0) {
      throw new AppError("quantity_needed must be greater than 0", 400);
    }

    const product = await ProductsRepository.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const rawMaterial = await RawMaterialsRepository.findById(raw_material_id);

    if (!rawMaterial) {
      throw new AppError("Raw material not found", 404);
    }

    const existingAssociation =
      await ProductsRawMaterialsRepository.findByProductAndRawMaterial(
        productId,
        raw_material_id,
      );

    if (existingAssociation) {
      throw new AppError(
        "This raw material is already associated with this product",
        409,
      );
    }

    const association =
      await ProductsRawMaterialsRepository.createProductRawMaterial({
        product_id: productId,
        raw_material_id,
        quantity_needed: Number(quantity_needed),
      });

    return response.status(201).json(association);
  }
}

export default new ProductRawMaterialController();
