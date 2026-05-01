import { apiFetch } from "../api";
import { mapProduct } from "../mappers";

// Fetch all products from the API
// Endpoint: /products
// Returns: mapped list of products
export async function fetchAllProducts() {
  const json = await apiFetch("/products");
  return json.data.map(mapProduct);
}

// Fetch best-selling products
// Endpoint: /best-seller/products
// Returns: mapped list of best sellers
export async function fetchBestSellers() {
  const json = await apiFetch("/best-seller/products");
  return json.data.map(mapProduct);
}

/**
 * Build a full image URL for a product, handling the detail response structure.
 * The detail endpoint may return an `images` array (first item is cover),
 * or a `cover_image` object.
 *
 * @param item - The raw product data object from the API
 * @returns Full image URL string
 */
function buildImageUrl(item: any): string {
  // Check for 'images' array (detail endpoint)
  if (item.images && item.images.length > 0) {
    const firstImage = item.images[0];
    const base =
      firstImage.image_path || "https://app.heebshop.ae/uploads/products/";
    return `${base}${firstImage.image}`;
  }
  // Check for 'cover_image' object (list endpoint)
  if (item.cover_image) {
    const base =
      item.cover_image.image_path ||
      "https://app.heebshop.ae/uploads/products/";
    return `${base}${item.cover_image.image}`;
  }
  // Fallback to default image
  return "/default-product.jpeg";
}

/**
 * Map a product detail response into the same shape as mapProduct,
 * but with the correct image extracted from the detail structure.
 *
 * @param apiItem - The raw product data object from the detail endpoint
 * @returns Mapped product object with correct image
 */
function mapProductDetail(apiItem: any) {
  const product = mapProduct(apiItem);
  // Override the image with the correctly extracted one
  product.image = buildImageUrl(apiItem);
  // Ensure ID is present (may be missing from the data object)
  if (!product.id && apiItem.id) {
    product.id = apiItem.id;
  }
  return product;
}

// Fetch a single product by ID
// Endpoint: /product/details?id={id}
// Note: The API expects the product ID as a query parameter.
// The response contains `data` which may not include an `id`, so we attach it.
export async function fetchProductById(id: number) {
  const json = await apiFetch(`/product/details?id=${id}`);
  // The API response wraps the product in `data`; we pass the whole data object
  // but ensure it has the id.
  return mapProductDetail({ ...json.data, id: json.data.id ?? id });
}

/**
 * Fetch all products with guaranteed `categorySlug`.
 *
 * Many products returned by /products have `category` = null
 * even though they carry a valid `product_category_id`.
 * This function fetches the category list, builds a map
 * `categoryId -> slug`, and attaches the correct slug to every product.
 *
 * Endpoints used:
 *   - /products             → raw product data
 *   - /product-categories   → category list (to build slug map)
 */
export async function fetchAllProductsWithCategorySlug() {
  // Request both endpoints in parallel
  const [productsRes, categoriesRes] = await Promise.all([
    apiFetch("/products"),
    apiFetch("/product-categories"),
  ]);

  // Build a lookup table: category ID → safe URL slug
  const categoryMap: Record<number, string | null> = {};
  if (categoriesRes?.data) {
    for (const cat of categoriesRes.data) {
      if (cat.status == 1 && cat.name_en) {
        const slug = cat.name_en
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-") // replace any non-alphanumeric char with a hyphen
          .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
        categoryMap[cat.id] = slug;
      }
    }
  }

  // Transform every product and set its categorySlug
  const products = productsRes.data.map((item: any) => {
    const product = mapProduct(item);
    const catId = item.product_category_id;
    product.categorySlug = catId ? categoryMap[catId] || null : null;
    return product;
  });

  return products;
}

// Search products by query string (safe – returns empty array on unexpected response)
export async function searchProducts(query: string) {
  // Do NOT manually encode query; apiFetch will encode the whole endpoint correctly.
  const json = await apiFetch(`/search/products?search=${query}`);
  if (!json.data || !Array.isArray(json.data)) {
    console.warn("Unexpected search API response:", json);
    return [];
  }
  return json.data.map(mapProduct);
}
