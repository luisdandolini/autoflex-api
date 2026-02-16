import ProductsRawMaterialsRepository from "../repositories/ProductsRawMaterialsRepository";
import ProductsRepository from "../repositories/ProductsRepository";
import RawMaterialsRepository from "../repositories/RawMaterialsRepository";

class ProductionService {
  async calculateProduction() {
    const products = await ProductsRepository.findAll("DESC");

    const rawMaterials = await RawMaterialsRepository.findAll();

    const virtualStock: { [key: string]: number } = {};

    for (const rawMaterial of rawMaterials) {
      virtualStock[rawMaterial.id] = Number(rawMaterial.quantity_stock);
    }

    const suggestions: any[] = [];

    for (const product of products) {
      const recipe = await ProductsRawMaterialsRepository.findByProductId(
        product.id,
      );

      if (recipe.length === 0) {
        continue;
      }

      let quantityPossible = Infinity;

      for (const ingredient of recipe) {
        const availableStock = virtualStock[ingredient.raw_material_id] || 0;
        const needed = Number(ingredient.quantity_needed);

        const possibleWithThisIngredient = Math.floor(availableStock / needed);

        if (possibleWithThisIngredient < quantityPossible) {
          quantityPossible = possibleWithThisIngredient;
        }

        if (quantityPossible <= 0) {
          continue;
        }

        for (const ingredient of recipe) {
          const needed = Number(ingredient.quantity_needed);
          const totalNeeded = needed * quantityPossible;

          virtualStock[ingredient.raw_material_id] -= totalNeeded;
        }

        suggestions.push({
          product_id: product.id,
          product_code: product.code,
          product_name: product.name,
          quantity_possible: quantityPossible,
          unit_value: Number(product.value),
          total_value: quantityPossible * Number(product.value),
        });
      }
    }

    const totalProductionValue = suggestions.reduce((sum, suggestion) => {
      return sum + suggestion.total_value;
    }, 0);

    return {
      suggestions,
      totalProductionValue: totalProductionValue,
      products_analyzedL: products.length,
    };
  }
}

export default new ProductionService();
