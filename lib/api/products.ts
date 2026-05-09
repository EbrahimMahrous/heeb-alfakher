import { apiFetch } from "../api";
import { mapProduct } from "../mappers";
import { toSlug } from "../slug";

/**
 * Fetch all products.
 */
export async function fetchAllProducts() {
  const json = await apiFetch("/products");
  return json.data.map(mapProduct);
}

/**
 * Fetch best‑selling products.
 */
export async function fetchBestSellers() {
  const json = await apiFetch("/best-seller/products");
  return json.data.map(mapProduct);
}

/**
 * Build full image URL from detail response.
 */
function buildImageUrl(item: any): string {
  if (item.images && item.images.length > 0) {
    const firstImage = item.images[0];
    const base =
      firstImage.image_path || "https://app.heebshop.ae/uploads/products/";
    return `${base}${firstImage.image}`;
  }
  if (item.cover_image) {
    const base =
      item.cover_image.image_path ||
      "https://app.heebshop.ae/uploads/products/";
    return `${base}${item.cover_image.image}`;
  }
  return "/default-product.jpeg";
}

/**
 * Map a product detail response.
 */
function mapProductDetail(apiItem: any) {
  const product = mapProduct(apiItem);
  product.image = buildImageUrl(apiItem);
  if (!product.id && apiItem.id) product.id = apiItem.id;
  return product;
}

/**
 * Fetch a single product by ID.
 */
export async function fetchProductById(id: number) {
  const json = await apiFetch(`/product/details?id=${id}`);
  return mapProductDetail({ ...json.data, id: json.data.id ?? id });
}

/**
 * Fetch all products with guaranteed categorySlug using the category map.
 */
export async function fetchAllProductsWithCategorySlug() {
  const [productsRes, categoriesRes] = await Promise.all([
    apiFetch("/products"),
    apiFetch("/product-categories"),
  ]);

  const categoryMap: Record<number, string | null> = {};
  if (categoriesRes?.data) {
    for (const cat of categoriesRes.data) {
      if (cat.status == 1 && cat.name_en) {
        categoryMap[cat.id] = toSlug(cat.name_en);
      }
    }
  }

  const products = productsRes.data.map((item: any) => {
    const product = mapProduct(item);
    const catId = item.product_category_id;
    if (!product.categorySlug && catId) {
      product.categorySlug = categoryMap[catId] || null;
    }
    return product;
  });

  return products;
}

/**
 * Search products by query string.
 */
export async function searchProducts(query: string) {
  const json = await apiFetch(`/search/products?search_query=${query}`);
  if (!json.data || !Array.isArray(json.data)) {
    console.warn("Unexpected search API response:", json);
    return [];
  }
  return json.data.map(mapProduct);
}
