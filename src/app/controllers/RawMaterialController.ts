import { Request, Response } from "express";
import RawMaterialsRepository from "../repositories/RawMaterialsRepository";
import { AppError } from "../../errors/AppError";

class RawMaterialController {
  async index(request: Request, response: Response) {
    const { orderBy } = request.query;

    const validOrderBy =
      orderBy === "DESC" || orderBy === "desc" ? "DESC" : "ASC";

    const rawMaterials = await RawMaterialsRepository.findAll(validOrderBy);

    return response.json({
      count: rawMaterials.length,
      data: rawMaterials,
    });
  }

  async create(request: Request, response: Response) {
    const { code, name, quantity_stock } = request.body;

    if (!code || !name || quantity_stock === undefined) {
      throw new AppError("Code, name and quantity stock are required", 400);
    }

    const existingRawMaterial = await RawMaterialsRepository.findByCodeOrName(
      code,
      name,
    );

    if (existingRawMaterial) {
      if (existingRawMaterial.code === code) {
        throw new AppError("Raw material code already exists", 409);
      }
      if (existingRawMaterial.name === name) {
        throw new AppError("Raw material name already exists", 409);
      }
    }

    const rawMaterial = await RawMaterialsRepository.createRawMaterial({
      code,
      name,
      quantity_stock: Number(quantity_stock),
    });

    return response.status(201).json(rawMaterial);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { code, name, quantity_stock } = request.body;

    const rawMaterialId = id as string;

    const existingRawMaterial =
      await RawMaterialsRepository.findById(rawMaterialId);

    if (!existingRawMaterial) {
      throw new AppError("RawMaterial not found", 404);
    }

    const product = await RawMaterialsRepository.updateRawMaterial(
      rawMaterialId,
      {
        code,
        name,
        quantity_stock,
      },
    );

    return response.status(200).json(product);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const rawMaterialId = id as string;

    const existingRawMaterial =
      await RawMaterialsRepository.findById(rawMaterialId);

    if (!existingRawMaterial) {
      throw new AppError("RawMaterial not found", 404);
    }

    await RawMaterialsRepository.deleteRawMaterial(rawMaterialId);

    return response.status(204).send();
  }
}

export default new RawMaterialController();
