import { STORAGE_KEYS, EVENTS } from "./constants";
import { safeLocalStorage } from "./storage";
import { dispatchCustomEvent } from "./utils";

export interface Address {
  id: string;
  contactName: string;
  contactPhone: string;
  address: string;
  type: "Home" | "Work" | "Other" | string;
  house: string;
  floor: string;
  road: string;
  postcode?: string;
  company?: string;
  createdAt?: number;
  isDefault?: boolean;
}

export type SavedAddress = Address;

export const getSavedAddresses = (): Address[] => {
  const stored = safeLocalStorage.get<Address[]>(STORAGE_KEYS.SAVED_ADDRESSES, []);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored;
  }

  const legacy = safeLocalStorage.getString(STORAGE_KEYS.LEGACY_SAVED_ADDRESS);
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      if (parsed && typeof parsed === "object" && parsed.address) {
        const item: Address = {
          id: `addr-${Date.now()}`,
          contactName: parsed.contactName || "User",
          contactPhone: parsed.contactPhone || "",
          address: parsed.address || "",
          type: parsed.type || "Home",
          house: parsed.house || "",
          floor: parsed.floor || "",
          road: parsed.road || "",
          postcode: parsed.postcode || "",
          company: parsed.company || "",
          createdAt: Date.now(),
        };
        safeLocalStorage.set(STORAGE_KEYS.SAVED_ADDRESSES, [item]);
        return [item];
      }
    } catch {
      // ignore
    }
  }

  return [];
};

export const saveAddresses = (addresses: Address[]): void => {
  safeLocalStorage.set(STORAGE_KEYS.SAVED_ADDRESSES, addresses);
  if (addresses.length > 0) {
    safeLocalStorage.set(STORAGE_KEYS.LEGACY_SAVED_ADDRESS, addresses[0]);
  } else {
    safeLocalStorage.remove(STORAGE_KEYS.LEGACY_SAVED_ADDRESS);
  }
};

export const addAddress = (address: Omit<Address, "id">): Address => {
  const addresses = getSavedAddresses();
  const newAddress: Address = {
    ...address,
    id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: address.createdAt || Date.now(),
  };

  const updated = [newAddress, ...addresses];
  saveAddresses(updated);
  return newAddress;
};

export const updateAddress = (id: string, updates: Partial<Address>): boolean => {
  const addresses = getSavedAddresses();
  const idx = addresses.findIndex((a) => a.id === id);
  if (idx === -1) return false;

  addresses[idx] = { ...addresses[idx], ...updates };
  saveAddresses(addresses);
  return true;
};

export const deleteAddress = (id: string): Address[] => {
  const addresses = getSavedAddresses();
  const filtered = addresses.filter((a) => a.id !== id);
  saveAddresses(filtered);
  return filtered;
};

export const getDefaultAddress = (): Address | undefined => {
  const addresses = getSavedAddresses();
  return addresses.find((a) => a.isDefault) ?? addresses[0];
};

export const setDefaultAddress = (id: string): boolean => {
  const addresses = getSavedAddresses();
  const idx = addresses.findIndex((a) => a.id === id);
  if (idx === -1) return false;

  addresses.forEach((a) => (a.isDefault = false));
  addresses[idx].isDefault = true;
  saveAddresses(addresses);
  return true;
};
