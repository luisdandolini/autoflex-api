import { Router } from "express";
import ProductController from "../app/controllers/ProductController";
import { asyncHandler } from "../utils/asyncHandler";
import RawMaterialController from "../app/controllers/RawMaterialController";

const routes = Router();

routes.get("/products", asyncHandler(ProductController.index));
routes.post("/products", asyncHandler(ProductController.create));
routes.put("/products/:id", asyncHandler(ProductController.update));
routes.delete("/products/:id", asyncHandler(ProductController.delete));

routes.get("/raw-materials", asyncHandler(RawMaterialController.index));
routes.post("/raw-materials", asyncHandler(RawMaterialController.create));
routes.put("/raw-materials/:id", asyncHandler(RawMaterialController.update));
routes.delete("/raw-materials/:id", asyncHandler(RawMaterialController.delete));

export default routes;
