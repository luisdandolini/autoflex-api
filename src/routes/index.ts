import { Router } from "express";
import ProductController from "../app/controllers/ProductController";
import { asyncHandler } from "../utils/asyncHandler";

const routes = Router();

routes.get("/products", asyncHandler(ProductController.index));
routes.post("/products", asyncHandler(ProductController.create));
routes.put("/products/:id", asyncHandler(ProductController.update));
routes.delete("/products/:id", asyncHandler(ProductController.delete));

export default routes;
