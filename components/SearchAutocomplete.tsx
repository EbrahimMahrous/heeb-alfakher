"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { searchProducts } from "@/lib/api/products";
import { Loader2, X, Search } from "lucide-react";

export default function SearchAutocomplete() {
  const { t, locale } = useTranslation("common");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchProducts(term.trim());
      const active = data.filter((p: any) => p.status !== "off");
      setResults(active.slice(0, 5));
      setHighlightIndex(-1);
      setIsOpen(active.length > 0);
    } catch (err) {
      console.error("Search failed", err);
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const clearInput = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && results[highlightIndex]) {
        setIsOpen(false);
        router.push(`/${locale}/product/${results[highlightIndex].id}`);
      } else if (query.trim()) {
        setIsOpen(false);
        router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const currencySymbol = t("currency", { defaultValue: "د.إ" });
  const weightUnit = t("weightUnit", { defaultValue: "kg" });

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <div className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          <Search size={16} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("search")}
          className="w-full border border-neutral-200 rounded-full py-2 ps-10 pe-10 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        />
        {query && (
          <button
            onClick={clearInput}
            className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
        {isLoading && (
          <div className="absolute inset-e-10 top-1/2 -translate-y-1/2">
            <Loader2 size={16} className="animate-spin text-primary" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {results.map((product, idx) => {
              let weightDisplay = "";
              if (product.weight) {
                const weightStr =
                  typeof product.weight === "number"
                    ? product.weight.toString()
                    : String(product.weight);
                const cleanWeight = weightStr
                  .replace(/\s*(كيلو|kg)\s*/gi, "")
                  .trim();
                if (cleanWeight) weightDisplay = `${cleanWeight} ${weightUnit}`;
              }

              return (
                <Link
                  key={product.id}
                  href={`/${locale}/product/${product.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors ${
                    idx === highlightIndex ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden relative shrink-0">
                    <Image
                      src={product.image || "/default-product.jpeg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-primary">
                        {product.discountedPrice ? (
                          <>
                            {product.discountedPrice} {currencySymbol}
                            <span className="ms-1 text-xs text-neutral-400 line-through font-normal">
                              {product.price} {currencySymbol}
                            </span>
                          </>
                        ) : (
                          `${product.price} ${currencySymbol}`
                        )}
                      </span>
                      {weightDisplay && (
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5">
                          {weightDisplay}
                        </span>
                      )}
                    </div>
                  </div>
                  {product.flagUrl && (
                    <div className="shrink-0" title={product.origin || ""}>
                      <Image
                        src={product.flagUrl}
                        alt={product.origin || ""}
                        width={20}
                        height={20}
                        className="rounded-full border border-neutral-200"
                      />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
