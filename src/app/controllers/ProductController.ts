import { Request, Response } from "express";
import ProductsRepository from "../repositories/ProductsRepository";
import { AppError } from "../../errors/AppError";

class ProductController {
  async index(request: Request, response: Response) {
    const { orderBy } = request.query;

    const validOrderBy =
      orderBy === "DESC" || orderBy === "desc" ? "DESC" : "ASC";

    const products = await ProductsRepository.findAll(validOrderBy);

    return response.json({
      count: products.length,
      data: products,
    });
  }

  async create(request: Request, response: Response) {
    const { code, name, value } = request.body;

    if (!code || !name || value === undefined) {
      throw new AppError("Code, name and value are required", 400);
    }

    const existingProduct = await ProductsRepository.findByCodeOrName(
      code,
      name,
    );

    if (existingProduct) {
      if (existingProduct.code === code) {
        throw new AppError("Product code already exists", 409);
      }
      if (existingProduct.name === name) {
        throw new AppError("Product name already exists", 409);
      }
    }

    const product = await ProductsRepository.createProduct({
      code,
      name,
      value: Number(value),
    });

    return response.status(201).json(product);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { code, name, value } = request.body;

    const productId = id as string;

    const existingProduct = await ProductsRepository.findById(productId);

    if (!existingProduct) {
      throw new AppError("Product not found", 404);
    }

    const product = await ProductsRepository.updateProduct(productId, {
      code,
      name,
      value,
    });

    return response.status(200).json(product);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const productId = id as string;

    const existingProduct = await ProductsRepository.findById(productId);

    if (!existingProduct) {
      throw new AppError("Product not found", 404);
    }

    await ProductsRepository.deleteProduct(productId);

    return response.status(204).send();
  }
}

export default new ProductController();
