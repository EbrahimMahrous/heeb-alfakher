export function mapProduct(apiProduct: any) {
  const imageBase =
    apiProduct.cover_image?.image_path ||
    "https://app.heebshop.ae/uploads/products/";
  const imageName = apiProduct.cover_image?.image || "";
  const imageUrl = imageName
    ? `${imageBase}${imageName}`
    : "/default-product.jpeg";

  const price = Number(apiProduct.product_price);
  const discountPercent = Number(apiProduct.discount_percantage) || 0;
  const discountedPrice =
    apiProduct.discounted_price != null
      ? Number(apiProduct.discounted_price)
      : undefined;
  // fallback: if discounted_price missing but discountPercent>0, compute
  let finalDiscountedPrice = discountedPrice;
  if (!finalDiscountedPrice && discountPercent > 0) {
    finalDiscountedPrice = Math.round(price * (1 - discountPercent / 100));
  }

  return {
    id: apiProduct.id,
    name: apiProduct.name_translated,
    nameEn: apiProduct.name_translated,
    price,
    discountedPrice: finalDiscountedPrice,
    discountPercent: discountPercent > 0 ? discountPercent : null,
    inStock: true, // The API does not contain a field, so we will assume availability.
    image: imageUrl,
    weight: apiProduct.weight || null,
    origin: apiProduct.country?.name_translated || "",
    originEn: apiProduct.country?.name_en || "",
    description: apiProduct.description_translated || "",
    categorySlug:
      apiProduct.category?.name_en?.toLowerCase().replace(/\s+/g, "-") || null,
    status: "on",
  };
}
