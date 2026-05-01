import { apiFetch } from "../api";

/**
 * Helper function to convert a string into a URL-friendly slug.
 * It removes any non-alphanumeric characters (except hyphens),
 * collapses multiple hyphens, and trims leading/trailing hyphens.
 */
const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric sequences with a hyphen
    .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens

/**
 * Fetch all active product categories.
 * Endpoint: /product-categories
 * Returns an array of categories with id, localized name, English name,
 * a clean slug, and full image URL if available.
 */
export async function fetchAllCategories() {
  const json = await apiFetch("/product-categories");

  return json.data
    .filter((cat: any) => cat.status == 1) // keep only active categories
    .map((cat: any) => ({
      id: cat.id,
      name: cat.name_translated, // localized name (e.g., Arabic)
      nameEn: cat.name_en, // English name
      slug: toSlug(cat.name_en), // generate safe URL-friendly slug (fixes '&' issue)
      image: cat.image
        ? `${cat.image_path}${cat.image}` // construct full image URL
        : null,
    }));
}

/**
 * Fetch categories along with their products.
 * Endpoint: /shop-by-categories
 * Each category includes a list of products with limited data.
 */
export async function fetchCategoriesWithProducts() {
  const json = await apiFetch("/shop-by-categories");

  return json.data.map((cat: any) => ({
    id: cat.id,
    name: cat.name_translated,
    nameEn: cat.name_en,
    slug: toSlug(cat.name_en), // use the safe slug helper
    image: cat.image ? `${cat.image_path}${cat.image}` : null,

    // Map products inside each category
    products: cat.products.map((p: any) => ({
      id: p.id,
      name: p.name_translated,
      nameEn: p.name_translated, // fallback (API does not provide separate English name)
      price: Number(p.product_price),
      discountedPrice: Number(p.discounted_price) || undefined,
      discountPercent: Number(p.discount_percantage) || null,
      image: null, // no image provided in this endpoint
      inStock: true,
      status: "on",
    })),
  }));
}
