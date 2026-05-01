"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { searchProducts } from "@/lib/api/products";
import { Loader2, X } from "lucide-react";

export default function SearchAutocomplete() {
  const { t } = useTranslation("common");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Fixed: provide explicit null as initial value
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const doSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchProducts(term.trim());
      setResults(data.slice(0, 5)); // show max 5 suggestions
      setHighlightIndex(-1);
      setIsOpen(data.length > 0);
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
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Close dropdown on outside click
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

  // Keyboard navigation
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
        router.push(`/product/${results[highlightIndex].id}`);
      } else if (query.trim()) {
        setIsOpen(false);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
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
          className="w-full border border-neutral-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {query && (
          <button
            onClick={clearInput}
            className="absolute right-9 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X size={16} />
          </button>
        )}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Image
              src="/icons/search.svg"
              alt="search"
              width={16}
              height={16}
              className="opacity-60"
            />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50">
          {results.map((product, idx) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors ${
                idx === highlightIndex ? "bg-neutral-100" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden relative shrink-0">
                <Image
                  src={product.image || "/default-product.jpeg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark truncate">
                  {product.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {product.discountedPrice ? (
                    <>
                      <span className="text-primary font-semibold">
                        {product.discountedPrice} د.إ
                      </span>
                      <span className="line-through mx-1">{product.price}</span>
                    </>
                  ) : (
                    <span className="text-primary font-semibold">
                      {product.price} د.إ
                    </span>
                  )}
                </p>
              </div>
            </Link>
          ))}

          {/* View all results link */}
          {results.length > 0 && (
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-primary font-medium py-3 border-t hover:bg-neutral-50 transition"
            >
              {t("viewAllResults") || "عرض كل النتائج"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
