import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";

interface ProductMetaProps {
  flagUrl?: string | null;
  origin?: string;
  weight?: string | number | null;
}

export default function ProductMeta({
  flagUrl,
  origin,
  weight,
}: ProductMetaProps) {
  const { t } = useTranslation("common"); 

  // Don't render if there's no data
  if (!flagUrl && !weight) return null;

  // Get localized weight unit (e.g., "كيلو" or "kg")
  const weightUnit = t("weightUnit", { defaultValue: "kg" });

  // Prepare display weight string
  let displayWeight: string | null = null;
  if (weight != null) {
    // Convert number to string if necessary
    let weightStr = typeof weight === "number" ? weight.toString() : weight;
    // Remove any existing unit text to avoid duplication
    weightStr = weightStr.replace(/\s*(كيلو|kg)\s*/gi, "").trim();
    if (weightStr) {
      displayWeight = `${weightStr} ${weightUnit}`;
    }
  }

  return (
    <div className="mt-1 inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 rounded-full px-2 py-0.5 w-fit">
      {flagUrl && origin && (
        <>
          <Image
            src={flagUrl}
            alt={origin}
            width={16}
            height={16}
            className="h-4 w-4 rounded-full object-cover"
          />
          <span className="text-xs text-neutral-700">{origin}</span>
        </>
      )}
      {displayWeight && (
        <>
          <span className="text-neutral-400 text-xs">•</span>
          <span className="text-xs text-neutral-700">{displayWeight}</span>
        </>
      )}
    </div>
  );
}
