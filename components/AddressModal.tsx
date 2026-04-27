"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { toast } from "sonner"; // ✅ sonner

interface Address {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  city?: string;
  region?: string;
  buildingNo?: string;
  streetAddress?: string;
  isDefault?: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
}

declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback?: () => void;
  }
}

const ADDRESS_FORM_STORAGE_KEY = "address_modal_form_data";

export default function AddressModal({
  isOpen,
  onClose,
  onSave,
}: AddressModalProps) {
  const { t } = useTranslation("addressModal");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "",
    region: "",
    buildingNo: "",
    streetAddress: "",
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
  const autocompleteRef = useRef<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load saved form data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(ADDRESS_FORM_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to parse saved address form data", e);
        }
      }
    }
    setIsInitialLoad(false);
  }, [isOpen]);

  // Persist form data
  useEffect(() => {
    if (!isOpen || isInitialLoad) return;
    localStorage.setItem(ADDRESS_FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData, isOpen, isInitialLoad]);

  const clearSavedFormData = () => {
    localStorage.removeItem(ADDRESS_FORM_STORAGE_KEY);
  };

  // Load Google Maps API
  useEffect(() => {
    if (!isOpen) return;

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Avoid multiple callbacks
    window.initGoogleMapsCallback = () => {
      setIsLoaded(true);
    };

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key is missing");
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
      console.error(
        "Failed to load Google Maps script. Blocked by client or network error.",
      );
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

  // Map initialization after API loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const defaultCenter = { lat: 24.4539, lng: 54.3773 }; // UAE

    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    // Marker (using deprecated Marker but still functional)
    const marker = new window.google.maps.Marker({
      position: defaultCenter,
      map: map,
      draggable: true,
    });
    markerRef.current = marker;

    marker.addListener("dragend", () => {
      const position = marker.getPosition();
      setSelectedLocation({ lat: position.lat(), lng: position.lng() });
      reverseGeocode(position.lat(), position.lng());
    });

    map.addListener("click", (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition({ lat, lng });
      setSelectedLocation({ lat, lng });
      reverseGeocode(lat, lng);
    });

    // Autocomplete (using deprecated Autocomplete but still functional)
    try {
      const autocomplete = new window.google.maps.places.Autocomplete(
        searchInputRef.current!,
        {
          componentRestrictions: { country: "ae" },
          fields: ["address_components", "formatted_address", "geometry"],
        },
      );
      autocompleteRef.current = autocomplete;

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const location = place.geometry.location;
          map.setCenter(location);
          marker.setPosition(location);
          setSelectedLocation({ lat: location.lat(), lng: location.lng() });

          let city = "",
            region = "",
            street = "";
          if (place.address_components) {
            for (const comp of place.address_components) {
              if (comp.types.includes("locality")) city = comp.long_name;
              if (comp.types.includes("administrative_area_level_1"))
                region = comp.long_name;
              if (comp.types.includes("route")) street = comp.long_name;
            }
          }
          setFormData((prev) => ({
            ...prev,
            city: city || prev.city,
            region: region || prev.region,
            streetAddress: street || prev.streetAddress,
          }));
        }
      });
    } catch (err) {
      console.error("Error initializing Autocomplete:", err);
    }

    // Try geolocate
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLoc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          map.setCenter(userLoc);
          marker.setPosition(userLoc);
          setSelectedLocation(userLoc);
          reverseGeocode(userLoc.lat, userLoc.lng);
        },
        (err) => {
          console.log("Geolocation denied or unavailable:", err);
          toast.info(
            t("geolocationDenied", {
              defaultValue:
                "تم تعطيل تحديد الموقع. يمكنك البحث عن عنوانك يدويًا.",
            }),
          );
        },
      );
    }
  }, [isLoaded]);

  const reverseGeocode = (lat: number, lng: number) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          const address = results[0].formatted_address;
          let city = "",
            region = "";
          for (const comp of results[0].address_components) {
            if (comp.types.includes("locality")) city = comp.long_name;
            if (comp.types.includes("administrative_area_level_1"))
              region = comp.long_name;
          }
          setFormData((prev) => ({
            ...prev,
            address: address,
            city: city || prev.city,
            region: region || prev.region,
          }));
        } else {
          console.error("Reverse geocoding failed:", status);
        }
      },
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
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
      !formData.streetAddress
    ) {
      const msg = t("validationRequired", {
        defaultValue: "يرجى ملء جميع الحقول المطلوبة",
      });
      toast.error(msg);
      return;
    }

    const fullAddress = `${formData.streetAddress}${formData.buildingNo ? `, ${formData.buildingNo}` : ""}, ${formData.region}, ${formData.city}`;
    const newAddress: Address = {
      id: Date.now().toString(),
      fullName: formData.fullName,
      address: fullAddress,
      phone: `+971${formData.phone}`,
      city: formData.city,
      region: formData.region,
      buildingNo: formData.buildingNo,
      streetAddress: formData.streetAddress,
      isDefault: formData.isDefault,
    };
    onSave(newAddress);
    clearSavedFormData();
    onClose();
    // Reset form
    setFormData({
      fullName: "",
      phone: "",
      city: "",
      region: "",
      buildingNo: "",
      streetAddress: "",
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
          {/* Map Section */}
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
                        reverseGeocode(loc.lat, loc.lng);
                      },
                      (err) => {
                        toast.error(
                          t("geolocationFailed", {
                            defaultValue: "فشل تحديد الموقع",
                          }),
                        );
                      },
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

          {/* Form Fields - بدون تغيير في التصميم */}
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
                {t("city")}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("region")}
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              required
              className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43]"
            />
          </div>

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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("buildingNo")}
              </label>
              <input
                type="text"
                name="buildingNo"
                value={formData.buildingNo}
                onChange={handleInputChange}
                className="w-full bg-[#E2E8F0] rounded-lg p-2 border-0 focus:ring-2 focus:ring-[#338A43]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("streetAddress")}
              </label>
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="w-4 h-4 text-[#338A43] focus:ring-[#338A43]"
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
