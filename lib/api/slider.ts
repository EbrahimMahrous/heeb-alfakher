import { apiFetch } from "../api";

export async function fetchSlides() {
  const json = await apiFetch("/slider");
  return json.data.map((slide: any) => ({
    id: slide.id,
    image: `${slide.image_path}${slide.image}`,
    title: slide.translated_title,
    description: slide.translated_paragraph,
    status: slide.status,
  }));
}
