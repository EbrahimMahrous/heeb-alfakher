import { apiFetch } from "../api";
import { toSlug } from "../slug";

export async function fetchAllCategories() {
  const json = await apiFetch("/product-categories");

  return json.data
    .filter((cat: any) => cat.status == 1)
    .map((cat: any) => ({
      id: cat.id,
      name: cat.name_translated,
      nameEn: cat.name_en,
      slug: toSlug(cat.name_en),
      image: cat.image ? `${cat.image_path}${cat.image}` : null,
    }));
}

export async function fetchCategoriesWithProducts() {
  const json = await apiFetch("/shop-by-categories");

  return json.data.map((cat: any) => ({
    id: cat.id,
    name: cat.name_translated,
    nameEn: cat.name_en,
    slug: toSlug(cat.name_en),
    image: cat.image ? `${cat.image_path}${cat.image}` : null,
    products: cat.products.map((p: any) => ({
      id: p.id,
      name: p.name_translated,
      nameEn: p.name_translated,
      price: Number(p.product_price),
      discountedPrice: Number(p.discounted_price) || undefined,
      discountPercent: Number(p.discount_percantage) || null,
      image: null,
      inStock: true,
      status: p.status !== undefined ? (p.status === 1 ? "on" : "off") : "on",
    })),
  }));
}
