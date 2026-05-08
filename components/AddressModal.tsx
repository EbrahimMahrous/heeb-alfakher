"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/useTranslation";
import { toast } from "sonner";

// ---------- Supported emirates ----------
const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

// ---------- Complete areas per emirate ----------
const AREAS_BY_EMIRATE: Record<string, string[]> = {
  Dubai: [
    "Jumeirah",
    "Marina",
    "Deira",
    "Bur Dubai",
    "Karama",
    "Al Barsha",
    "Satwa",
    "JLT",
    "Business Bay",
    "Mirdif",
    "Al Qusais",
    "Discovery Gardens",
    "Palm Jumeirah",
    "Jebel Ali",
    "Al Nahda",
    "Dubai Silicon Oasis",
    "Dubai Sports City",
    "International City",
    "Arabian Ranches",
    "Emirates Hills",
    "The Springs",
    "Al Furjan",
    "Town Square",
    "Dubai Hills Estate",
    "Al Khawaneej",
    "Al Warqaa",
    "Nad Al Sheba",
    "Al Barari",
  ],
  "Abu Dhabi": [
    "Al Reem Island",
    "Khalifa City",
    "Mohammed Bin Zayed City",
    "Al Raha Beach",
    "Yas Island",
    "Saadiyat Island",
    "Al Zahiyah",
    "Al Maryah Island",
    "Al Bateen",
    "Al Mushrif",
    "Al Shamkha",
    "Al Reef",
    "Shakhbout City",
    "Al Falah City",
    "Al Ain City",
    "Madinat Zayed",
  ],
  Sharjah: [
    "Al Majaz",
    "Al Qasimia",
    "Al Nahda Sharjah",
    "Al Khan",
    "Muwaileh",
    "Al Taawun",
    "Al Ruwaida",
    "Al Juraina",
    "Al Mirgab",
    "Al Hazana",
    "Al Layyeh",
    "Al Suyoh",
  ],
  Ajman: [
    "Al Nuaimiya",
    "Al Rashidiya",
    "Al Jurf",
    "Al Mowaihat",
    "Emirates City",
    "Al Zahraa",
    "Ajman Downtown",
    "Al Hamidiya",
    "Al Corniche",
  ],
  "Umm Al Quwain": [
    "Al Salamah",
    "Al Riqqah",
    "Umm Al Quwain City",
    "Al Baqra",
    "Falaj Al Mualla",
  ],
  "Ras Al Khaimah": [
    "Al Nakheel",
    "Al Hamra",
    "Mina Al Arab",
    "Ras Al Khaimah City",
    "Al Jazirah Al Hamra",
    "Khor Khwair",
    "Al Mamura",
    "Al Fahleen",
    "Adhen",
  ],
  Fujairah: [
    "Fujairah City",
    "Dibba Al-Fujairah",
    "Al Qurayyah",
    "Mirbah",
    "Al Bidya",
    "Sakamkam",
  ],
};

export interface Address {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  city?: string;
  area?: string;
  buildingNo?: string; // still included in interface but not filled
  streetAddress?: string;
  isDefault?: boolean;
  pinLocation?: string;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  existingAddress?: Address | null;
}

declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback?: () => void;
  }
}

const ADDRESS_FORM_STORAGE_KEY = "address_modal_form_data";

// ---------- Helpers ----------
const findEmirate = (cityName: string): string => {
  return (
    EMIRATES.find((e) => e.toLowerCase() === cityName?.toLowerCase()) || ""
  );
};

const extractArea = (components: any[]): string => {
  const AREA_TYPES = [
    "sublocality_level_1",
    "sublocality",
    "neighborhood",
    "administrative_area_level_2",
    "administrative_area_level_1",
    "route",
  ];
  for (const type of AREA_TYPES) {
    for (const comp of components) {
      if (comp.types.includes(type)) return comp.long_name;
    }
  }
  return "";
};

const sanitizePhoneNumber = (rawPhone: string): string => {
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.length >= 7 && digits.startsWith("0"))
    digits = digits.substring(1);
  if (!digits.startsWith("971")) digits = "971" + digits;
  if (digits.length < 10 || digits.length > 12) return "";
  return digits;
};

// ---------- Reusable Searchable Select (used for both Emirate and Area) ----------
const SearchableSelect = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  required = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sync external value changes (e.g. map auto‑fill)
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Close dropdown on outside click & notify if unrecognized area is left
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // If the typed text is not a valid option, revert and warn
        if (searchTerm && !options.includes(searchTerm)) {
          setSearchTerm(value);
          if (searchTerm !== value) {
            toast.error("يرجى اختيار منطقة من القائمة");
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm, value, options]);

  const handleClear = () => {
    onChange("");
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            // Do NOT update actual value until selection
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full bg-[#E2E8F0] rounded-lg p-2 pe-8 border-0 focus:ring-2 focus:ring-[#338A43] ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
        />
        {/* Clear button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            ✕
          </button>
        )}
        {/* Chevron indicator */}
        <span className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>
      {/* Dropdown list */}
      {isOpen && !disabled && filtered.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-48 w-full overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {filtered.map((opt) => (
            <li
              key={opt}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-green-50 transition ${
                opt === value ? "bg-green-100 font-semibold text-primary" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt);
                setSearchTerm(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
      {/* If no results and search term is non‑empty */}
      {isOpen && !disabled && searchTerm && filtered.length === 0 && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500 text-center">
          لا توجد نتائج
        </div>
      )}
    </div>
  );
};

export default function AddressModal({
  isOpen,
  onClose,
  onSave,
  existingAddress,
}: AddressModalProps) {
  const { t } = useTranslation("addressModal");
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isRtl = locale === "ar";

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "",
    area: "",
    buildingNo: "", // hidden, always empty
    streetAddress: "",
    pinLocation: "",
    isDefault: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [emirateManual, setEmirateManual] = useState(false);
  const emirateManualRef = useRef(emirateManual);
  useEffect(() => {
    emirateManualRef.current = emirateManual;
  }, [emirateManual]);

  // ---------- Pre‑fill ----------
  useEffect(() => {
    if (!isOpen) return;
    if (existingAddress) {
      const localPhone = existingAddress.phone.startsWith("+971")
        ? existingAddress.phone.substring(4)
        : existingAddress.phone;
      setFormData({
        fullName: existingAddress.fullName || "",
        phone: localPhone,
        city: existingAddress.city || "",
        area: existingAddress.area || "",
        buildingNo: existingAddress.buildingNo || "",
        streetAddress: existingAddress.streetAddress || "",
        pinLocation: existingAddress.pinLocation || "",
        isDefault: existingAddress.isDefault || false,
      });
      setEmirateManual(true);
      return;
    }

    const saved = localStorage.getItem(ADDRESS_FORM_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          fullName: parsed.fullName || "",
          phone: parsed.phone || "",
          buildingNo: "",
          city: "",
          area: "",
        }));
      } catch (e) {
        console.error("Failed to parse saved address form data", e);
      }
    }
    setIsInitialLoad(false);
  }, [isOpen, existingAddress]);

  // Persist (excluding city/area)
  useEffect(() => {
    if (!isOpen || isInitialLoad || existingAddress) return;
    const dataToSave = {
      fullName: formData.fullName,
      phone: formData.phone,
    };
    localStorage.setItem(ADDRESS_FORM_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    formData.fullName,
    formData.phone,
    isOpen,
    isInitialLoad,
    existingAddress,
  ]);

  const clearSavedFormData = () =>
    localStorage.removeItem(ADDRESS_FORM_STORAGE_KEY);

  // Google Maps loading
  useEffect(() => {
    if (!isOpen) return;
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }
    window.initGoogleMapsCallback = () => setIsLoaded(true);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setLoadError(true);
      toast.error(t("mapsApiMissing"));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setLoadError(true);
      toast.error(t("mapsLoadError"));
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
      delete window.initGoogleMapsCallback;
    };
  }, [isOpen]);

  // Map initialization
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const defaultCenter = { lat: 24.4539, lng: 54.3773 };
    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    const marker = new window.google.maps.Marker({
      position: defaultCenter,
      map,
      draggable: true,
    });
    markerRef.current = marker;

    const updatePinLocation = (lat: number, lng: number) => {
      const link = `https://www.google.com/maps?q=${lat},${lng}`;
      setFormData((prev) => ({ ...prev, pinLocation: link }));
    };

    const matchAreaToList = (areaName: string, emirate: string): string => {
      if (!emirate || !areaName) return areaName;
      const allowed = AREAS_BY_EMIRATE[emirate] || [];
      const found = allowed.find(
        (a) => a.toLowerCase() === areaName.toLowerCase(),
      );
      return found || "";
    };

    const geocodeAndFill = (lat: number, lng: number) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            const components = results[0].address_components;
            let city = "";
            const area = extractArea(components);
            for (const comp of components) {
              if (comp.types.includes("locality")) city = comp.long_name;
            }
            const matchedEmirate = findEmirate(city);

            if (emirateManualRef.current) {
              if (matchedEmirate && matchedEmirate !== formData.city) {
                setFormData((prev) => ({
                  ...prev,
                  area: "",
                  address: results[0].formatted_address,
                }));
                toast.warning(
                  t("areaMismatch", {
                    defaultValue:
                      "هذه المنطقة لا تتبع الإمارة المختارة. الرجاء ادخال المنطقة يدويًا أو تغيير الإمارة.",
                  }),
                );
              } else {
                const matchedArea = matchAreaToList(area, formData.city);
                setFormData((prev) => ({
                  ...prev,
                  address: results[0].formatted_address,
                  area: matchedArea || prev.area,
                }));
              }
            } else {
              const targetCity = matchedEmirate || "";
              const matchedArea = targetCity
                ? matchAreaToList(area, targetCity)
                : area;
              setFormData((prev) => ({
                ...prev,
                address: results[0].formatted_address,
                city: targetCity || prev.city,
                area: matchedArea || prev.area,
              }));
            }
          }
        },
      );
    };

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      setSelectedLocation({ lat: pos.lat(), lng: pos.lng() });
      geocodeAndFill(pos.lat(), pos.lng());
      updatePinLocation(pos.lat(), pos.lng());
    });

    map.addListener("click", (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition({ lat, lng });
      setSelectedLocation({ lat, lng });
      geocodeAndFill(lat, lng);
      updatePinLocation(lat, lng);
    });

    // Autocomplete
    if (searchInputRef.current) {
      try {
        const autocomplete = new window.google.maps.places.Autocomplete(
          searchInputRef.current,
          {
            componentRestrictions: { country: "ae" },
            fields: ["address_components", "formatted_address", "geometry"],
          },
        );
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.address_components) {
            toast.error(
              t("mapsErrorGeneral", {
                defaultValue: "يرجى اختيار عنوان من القائمة",
              }),
            );
            return;
          }

          const loc = place.geometry.location;
          map.setCenter(loc);
          marker.setPosition(loc);
          setSelectedLocation({ lat: loc.lat(), lng: loc.lng() });
          updatePinLocation(loc.lat(), loc.lng());

          let city = "",
            area = "";
          if (place.address_components) {
            area = extractArea(place.address_components);
            for (const comp of place.address_components) {
              if (comp.types.includes("locality")) city = comp.long_name;
            }
          }
          const matchedEmirate = findEmirate(city);

          if (emirateManualRef.current) {
            if (matchedEmirate && matchedEmirate !== formData.city) {
              setFormData((prev) => ({
                ...prev,
                area: "",
                address: place.formatted_address || "",
              }));
              toast.warning(t("areaMismatch"));
            } else {
              const matchedArea = matchAreaToList(area, formData.city);
              setFormData((prev) => ({
                ...prev,
                area: matchedArea || prev.area,
                address: place.formatted_address || "",
              }));
            }
          } else {
            const targetCity = matchedEmirate || "";
            const matchedArea = targetCity
              ? matchAreaToList(area, targetCity)
              : area;
            setFormData((prev) => ({
              ...prev,
              city: targetCity || prev.city,
              area: matchedArea || prev.area,
              address: place.formatted_address || "",
            }));
          }
        });

        setTimeout(() => {
          const pacContainer = document.querySelector(".pac-container");
          if (pacContainer) {
            (pacContainer as HTMLElement).style.zIndex = "999999";
          }
        }, 500);
      } catch (err) {
        console.error("Autocomplete init error:", err);
      }
    }

    // Geolocate
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.setCenter(loc);
          marker.setPosition(loc);
          setSelectedLocation(loc);
          geocodeAndFill(loc.lat, loc.lng);
          updatePinLocation(loc.lat, loc.lng);
          setLocationDenied(false);
        },
        () => setLocationDenied(true),
      );
    } else {
      setLocationDenied(true);
    }
  }, [isLoaded]);

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.city ||
      !formData.area
    ) {
      toast.error(t("validationRequired"));
      return;
    }
    const sanitizedPhone = sanitizePhoneNumber(formData.phone);
    if (!sanitizedPhone) {
      toast.error(t("invalidPhone", { defaultValue: "رقم الهاتف غير صحيح" }));
      return;
    }
    const parts = [formData.area, formData.city];
    const fullAddress = parts.join(", ");

    const newAddress: Address = {
      id: existingAddress?.id || Date.now().toString(),
      fullName: formData.fullName,
      address: fullAddress,
      phone: `+971${sanitizedPhone.replace("971", "")}`,
      city: formData.city,
      area: formData.area,
      buildingNo: "",
      streetAddress: "",
      pinLocation: formData.pinLocation,
      isDefault: formData.isDefault,
    };
    onSave(newAddress);
    clearSavedFormData();
    onClose();
    setFormData({
      fullName: "",
      phone: "",
      city: "",
      area: "",
      buildingNo: "",
      streetAddress: "",
      pinLocation: "",
      isDefault: false,
    });
    setEmirateManual(false);
  };

  if (!isOpen) return null;
  if (loadError)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-xl max-w-sm text-center">
          <p className="text-red-600 mb-4">{t("mapsErrorGeneral")}</p>
          <button
            onClick={() => {
              setLoadError(false);
              onClose();
            }}
            className="px-4 py-2 bg-primary text-white rounded-full"
          >
            {t("ok")}
          </button>
        </div>
      </div>
    );
  if (!isLoaded)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-xl">{t("loading")}</div>
      </div>
    );

  const currentAreas = formData.city
    ? AREAS_BY_EMIRATE[formData.city] || []
    : [];
  const currentEmirates = EMIRATES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">{t("title")}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <Image src="/icons/close.svg" alt="close" width={24} height={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Location denied warning */}
          {locationDenied && !formData.city && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-sm text-amber-800 flex items-center gap-2">
              <span>📍</span>
              <span>{t("geolocationDenied")}</span>
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("searchPlaceholder")}
              className="w-full bg-white border border-gray-300 rounded-full py-2.5 pe-10 ps-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#338A43]"
            />
            <span className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <Image
                src="/icons/search.svg"
                alt="search"
                width={18}
                height={18}
              />
            </span>
          </div>

          {/* Map */}
          <div className="relative">
            <div
              ref={mapRef}
              className="w-full h-64 rounded-xl overflow-hidden border border-gray-200"
            />
            <div className="absolute bottom-2 inset-s-2 inset-e-2 flex gap-2 z-10">
              <button
                type="button"
                onClick={() =>
                  selectedLocation &&
                  mapInstanceRef.current?.setCenter(selectedLocation) &&
                  mapInstanceRef.current?.setZoom(16)
                }
                className="flex-1 bg-white text-gray-800 py-1.5 rounded-full text-sm shadow-md hover:bg-gray-100"
              >
                {t("deliverHere")}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const loc = {
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude,
                        };
                        mapInstanceRef.current?.setCenter(loc);
                        markerRef.current?.setPosition(loc);
                        setSelectedLocation(loc);
                      },
                      () => toast.error(t("geolocationFailed")),
                    );
                  } else {
                    toast.error(t("geolocationNotSupported"));
                  }
                }}
                className="flex-1 bg-white text-gray-800 py-1.5 rounded-full text-sm shadow-md flex items-center justify-center gap-1 hover:bg-gray-100"
              >
                <Image
                  src="/icons/select-location.svg"
                  alt="locate"
                  width={14}
                  height={14}
                />
                {t("locateMe")}
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("fullName")}
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              required
              className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43]"
            />
          </div>

          {/* Emirate – searchable dropdown */}
          <SearchableSelect
            label={t("emirate")}
            value={formData.city}
            options={currentEmirates}
            onChange={(selected) => {
              setFormData((prev) => ({ ...prev, city: selected, area: "" }));
              setEmirateManual(!!selected);
            }}
            placeholder={t("selectEmirate")}
            required
          />

          {/* Area – searchable dropdown */}
          <SearchableSelect
            label={t("area") || "المنطقة"}
            value={formData.area}
            options={currentAreas}
            onChange={(val) => setFormData((prev) => ({ ...prev, area: val }))}
            placeholder={formData.city ? t("selectArea") : t("selectCityFirst")}
            disabled={!formData.city}
            required
          />

          {/* Phone */}
          <div className={`flex gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className="w-24 shrink-0">
              <label className="block text-sm font-medium mb-1">
                {t("countryCode")}
              </label>
              <div className="bg-[#E2E8F0] rounded-lg p-2 text-center font-medium">
                +971
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                {t("phone")}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                required
                placeholder="501234567"
                className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43]"
                dir="ltr"
              />
              <p className="text-xs text-gray-400 mt-1">
                {t("phoneHint", {
                  defaultValue:
                    "أدخل رقم الهاتف بدون صفر إضافي (مثال: 501234567)",
                })}
              </p>
            </div>
          </div>

          {/* Default address checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isDefault: e.target.checked,
                }))
              }
              className="w-4 h-4 text-[#338A43]"
            />
            <label className="text-sm">{t("isDefault")}</label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-full hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#338A43] text-white py-2 rounded-full hover:bg-[#2a6e37] transition"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
