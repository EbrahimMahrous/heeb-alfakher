"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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

export interface Address {
  id: string;
  fullName: string;
  address: string;
  phone: string; // stored as "+971XXXXXXXXX"
  city?: string; // emirate (auto‑filled)
  area?: string; // well‑known sub‑area (auto‑filled, editable)
  buildingNo?: string;
  streetAddress?: string;
  isDefault?: boolean;
  pinLocation?: string; // Google Maps sharing link
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  existingAddress?: Address | null; // ✅ for editing an existing address
}

declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback?: () => void;
  }
}

const ADDRESS_FORM_STORAGE_KEY = "address_modal_form_data";

// ---------- Helper: match an address component to our emirates list ----------
const findEmirate = (cityName: string): string => {
  return (
    EMIRATES.find((e) => e.toLowerCase() === cityName?.toLowerCase()) || ""
  );
};

// ---------- Helper: extract a well‑known sub‑area name ----------
const extractArea = (components: any[]): string => {
  for (const comp of components) {
    if (comp.types.includes("sublocality_level_1")) return comp.long_name;
  }
  for (const comp of components) {
    if (comp.types.includes("sublocality")) return comp.long_name;
  }
  for (const comp of components) {
    if (comp.types.includes("neighborhood")) return comp.long_name;
  }
  for (const comp of components) {
    if (comp.types.includes("administrative_area_level_2"))
      return comp.long_name;
  }
  return "";
};

// ---------- Phone number sanitizer ----------
const sanitizePhoneNumber = (rawPhone: string): string => {
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.length >= 7 && digits.startsWith("0")) {
    digits = digits.substring(1);
  }
  if (!digits.startsWith("971")) {
    digits = "971" + digits;
  }
  if (digits.length < 10 || digits.length > 12) {
    return "";
  }
  return digits;
};

export default function AddressModal({
  isOpen,
  onClose,
  onSave,
  existingAddress,
}: AddressModalProps) {
  const { t } = useTranslation("addressModal");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "",
    area: "",
    buildingNo: "",
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

  // ✅ Pre‑fill form when editing an existing address
  useEffect(() => {
    if (!isOpen) return;
    if (existingAddress) {
      // Show local number without +971 prefix for editing
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
      return;
    }

    // Load previously saved form data for a *new* address
    const saved = localStorage.getItem(ADDRESS_FORM_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse saved address form data", e);
      }
    }
    setIsInitialLoad(false);
  }, [isOpen, existingAddress]);

  // Persist form data to localStorage only when creating a new address (not editing)
  useEffect(() => {
    if (!isOpen || isInitialLoad || existingAddress) return;
    localStorage.setItem(ADDRESS_FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData, isOpen, isInitialLoad, existingAddress]);

  const clearSavedFormData = () => {
    localStorage.removeItem(ADDRESS_FORM_STORAGE_KEY);
  };

  // ---- Google Maps API loading ----
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
      toast.error(
        t("mapsApiMissing", { defaultValue: "مفتاح الخرائط غير موجود" }),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setLoadError(true);
      toast.error(
        t("mapsLoadError", {
          defaultValue:
            "تعذر تحميل الخرائط. تأكد من تعطيل أدوات الحظر (Adblock) أو أعد المحاولة.",
        }),
      );
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
      delete window.initGoogleMapsCallback;
    };
  }, [isOpen]);

  // ---- Map initialization ----
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
            setFormData((prev) => ({
              ...prev,
              address: results[0].formatted_address,
              city: matchedEmirate || prev.city,
              area: area || prev.area,
              streetAddress: prev.streetAddress,
            }));
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
    try {
      const autocomplete = new window.google.maps.places.Autocomplete(
        searchInputRef.current!,
        {
          componentRestrictions: { country: "ae" },
          fields: ["address_components", "formatted_address", "geometry"],
        },
      );
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const loc = place.geometry.location;
          map.setCenter(loc);
          marker.setPosition(loc);
          setSelectedLocation({ lat: loc.lat(), lng: loc.lng() });
          updatePinLocation(loc.lat(), loc.lng());

          let city = "",
            street = "",
            area = "";
          if (place.address_components) {
            area = extractArea(place.address_components);
            for (const comp of place.address_components) {
              if (comp.types.includes("locality")) city = comp.long_name;
              if (comp.types.includes("route")) street = comp.long_name;
            }
          }
          const matchedEmirate = findEmirate(city);
          setFormData((prev) => ({
            ...prev,
            city: matchedEmirate || prev.city,
            area: area || prev.area,
            streetAddress: street || prev.streetAddress,
          }));
        }
      });
    } catch (err) {
      console.error("Autocomplete init error:", err);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.setCenter(loc);
          marker.setPosition(loc);
          setSelectedLocation(loc);
          geocodeAndFill(loc.lat, loc.lng);
          updatePinLocation(loc.lat, loc.lng);
        },
        () => console.log("Geolocation denied"),
      );
    }
  }, [isLoaded]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.city ||
      !formData.streetAddress ||
      !formData.area
    ) {
      toast.error(
        t("validationRequired", {
          defaultValue: "يرجى ملء جميع الحقول المطلوبة",
        }),
      );
      return;
    }

    const sanitizedPhone = sanitizePhoneNumber(formData.phone);
    if (!sanitizedPhone) {
      toast.error(
        t("invalidPhone", {
          defaultValue:
            "رقم الهاتف غير صحيح. تأكد من أنه مكون من 9-10 أرقام (بدون صفر إضافي)",
        }),
      );
      return;
    }

    const fullAddress = `${formData.streetAddress}${formData.buildingNo ? `, ${formData.buildingNo}` : ""}, ${formData.area}, ${formData.city}`;
    const newAddress: Address = {
      id: existingAddress?.id || Date.now().toString(), // keep same id if editing
      fullName: formData.fullName,
      address: fullAddress,
      phone: `+971${sanitizedPhone.replace("971", "")}`,
      city: formData.city,
      area: formData.area,
      buildingNo: formData.buildingNo,
      streetAddress: formData.streetAddress,
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
            {t("ok", { defaultValue: "حسنًا" })}
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
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
          {/* Map */}
          <div className="relative">
            <div className="absolute top-2 left-2 right-2 z-10 flex gap-2">
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className="w-full bg-white border border-gray-300 rounded-full py-2 pr-10 pl-4 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#338A43]"
                />
                <Image
                  src="/icons/search.svg"
                  alt="search"
                  width={16}
                  height={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />
              </div>
            </div>
            <div
              ref={mapRef}
              className="w-full h-64 rounded-xl overflow-hidden border border-gray-200"
            />
            <div className="absolute bottom-2 left-2 right-2 flex gap-2 z-10">
              <button
                type="button"
                onClick={() => {
                  if (selectedLocation) {
                    mapInstanceRef.current?.setCenter(selectedLocation);
                    mapInstanceRef.current?.setZoom(16);
                  }
                }}
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
                      () =>
                        toast.error(
                          t("geolocationFailed", {
                            defaultValue: "فشل تحديد الموقع",
                          }),
                        ),
                    );
                  } else {
                    toast.error(
                      t("geolocationNotSupported", {
                        defaultValue: "المتصفح لا يدعم تحديد الموقع",
                      }),
                    );
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("fullName")}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("emirate") || "الإمارة"}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder={t("selectEmirate") || "اختر الإمارة"}
                className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43]"
              />
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("area") || "المنطقة"}
            </label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              required
              placeholder={t("selectArea") || "سيتم تعبئتها تلقائياً"}
              className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43]"
            />
          </div>

          {/* Phone */}
          <div className="flex gap-2">
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
                onChange={handleInputChange}
                required
                placeholder="501234567"
                className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43]"
              />
              <p className="text-xs text-gray-400 mt-1">
                {t("phoneHint") ||
                  "أدخل رقم الهاتف بدون صفر إضافي (مثال: 501234567)"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>{t("buildingNo")}</label>
              <input
                type="text"
                name="buildingNo"
                value={formData.buildingNo}
                onChange={handleInputChange}
                className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43]"
              />
            </div>
            <div>
              <label>{t("streetAddress")}</label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
                className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("pinLocation") || "رابط الموقع"}
            </label>
            <input
              type="url"
              name="pinLocation"
              value={formData.pinLocation}
              onChange={handleInputChange}
              placeholder="https://www.google.com/maps?q=..."
              className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43] text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="w-4 h-4 text-[#338A43]"
            />
            <label className="text-sm">{t("isDefault")}</label>
          </div>
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
