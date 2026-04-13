"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useTranslation } from "@/lib/useTranslation";

export default function CartIcon() {
  const { t } = useTranslation("common");
  const totalItems = useCartStore((state) => state.totalItems);

  return (
    <Link href="/cart" className="relative" title={t("cart")}>
      <div className="bg-[#FF8531] rounded-full p-2 flex items-center justify-center">
        <ShoppingCart className="text-white w-5 h-5" />
      </div>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
