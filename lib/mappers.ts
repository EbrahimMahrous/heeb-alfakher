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

  // -- Country flag URL --
  const flagBase =
    apiProduct.country?.image_path || "https://app.heebshop.ae/uploads/flags/";
  const flagFile = apiProduct.country?.flag || "";
  const flagUrl = flagFile ? `${flagBase}${flagFile}` : null;

  // -- Weight extraction --
  let weight = apiProduct.weight || null;
  if (!weight) {
    const name = apiProduct.name_translated || "";
    // Look for pattern "number + كيلو" (e.g., "2 كيلو")
    const match = name.match(/(\d+)\s*كيلو/);
    if (match) {
      weight = match[1] + " كيلو";
    } else if (name.includes("كيلو")) {
      // If the word "كيلو" exists without a number, assume 1
      weight = "1 كيلو";
    }
  }

  return {
    id: apiProduct.id,
    name: apiProduct.name_translated, // Arabic name
    nameEn: apiProduct.name_translated, // fallback to Arabic name (API doesn't have separate EN product name)
    price,
    discountedPrice: finalDiscountedPrice,
    discountPercent: discountPercent > 0 ? discountPercent : null,
    inStock: true, // API lacks stock field; adjust if needed
    image: imageUrl,
    weight, // extracted weight string (e.g., "2 كيلو")
    origin: apiProduct.country?.name_translated || "",
    originEn: apiProduct.country?.name_en || "",
    flagUrl, // full flag image URL
    description: apiProduct.description_translated || "",
    categorySlug:
      apiProduct.category?.name_en?.toLowerCase().replace(/\s+/g, "-") || null,
    status: "on",
  };
}
