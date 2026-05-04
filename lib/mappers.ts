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

  let finalDiscountedPrice = discountedPrice;
  if (!finalDiscountedPrice && discountPercent > 0) {
    finalDiscountedPrice = Math.round(price * (1 - discountPercent / 100));
  }

  const flagBase =
    apiProduct.country?.image_path || "https://app.heebshop.ae/uploads/flags/";
  const flagFile = apiProduct.country?.flag || "";
  const flagUrl = flagFile ? `${flagBase}${flagFile}` : null;

  let weight = apiProduct.weight || null;
  if (!weight) {
    const name = apiProduct.name_translated || "";
    const match = name.match(/(\d+)\s*كيلو/);
    if (match) {
      weight = match[1] + " كيلو";
    } else if (name.includes("كيلو")) {
      weight = "1 كيلو";
    }
  }

  // Convert numeric status from API to "on"/"off"
  // API returns status: 1 (active) or 0 (inactive)
  const status =
    apiProduct.status !== undefined
      ? apiProduct.status === 1
        ? "on"
        : "off"
      : "on"; // fallback to "on" if missing

  return {
    id: apiProduct.id,
    name: apiProduct.name_translated,
    nameEn: apiProduct.name_translated,
    price,
    discountedPrice: finalDiscountedPrice,
    discountPercent: discountPercent > 0 ? discountPercent : null,
    inStock: true,
    image: imageUrl,
    weight,
    origin: apiProduct.country?.name_translated || "",
    originEn: apiProduct.country?.name_en || "",
    flagUrl,
    description: apiProduct.description_translated || "",
    categorySlug:
      apiProduct.category?.name_en?.toLowerCase().replace(/\s+/g, "-") || null,
    status, // dynamic: "on" for 1, "off" for 0
  };
}
