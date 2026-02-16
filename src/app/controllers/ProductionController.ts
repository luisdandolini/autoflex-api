import { Request, Response } from "express";
import ProductionService from "../services/ProductionService";

class ProductionController {
  async suggestions(request: Request, response: Response) {
    const result = await ProductionService.calculateProduction();

    return response.json(result);
  }
}

export default new ProductionController();
