import { STORAGE_KEYS, EVENTS } from "./constants";
import { safeLocalStorage } from "./storage";
import { dispatchCustomEvent } from "./utils";

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  instructions?: string;
  isDefault?: boolean;
}

export const getSavedAddresses = (): Address[] => {
  return safeLocalStorage.get<Address[]>(STORAGE_KEYS.SAVED_ADDRESSES, []);
};

export const saveAddresses = (addresses: Address[]): void => {
  safeLocalStorage.set(STORAGE_KEYS.SAVED_ADDRESSES, addresses);
};

export const addAddress = (address: Omit<Address, "id">): Address => {
  const addresses = getSavedAddresses();
  const newAddress: Address = {
    ...address,
    id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };

  if (address.isDefault || addresses.length === 0) {
    addresses.forEach((a) => (a.isDefault = false));
    newAddress.isDefault = true;
  }

  addresses.push(newAddress);
  saveAddresses(addresses);
  return newAddress;
};

export const updateAddress = (id: string, updates: Partial<Address>): boolean => {
  const addresses = getSavedAddresses();
  const idx = addresses.findIndex((a) => a.id === id);
  if (idx === -1) return false;

  if (updates.isDefault) {
    addresses.forEach((a) => (a.isDefault = false));
  }

  addresses[idx] = { ...addresses[idx], ...updates };
  saveAddresses(addresses);
  return true;
};

export const deleteAddress = (id: string): boolean => {
  const addresses = getSavedAddresses();
  const filtered = addresses.filter((a) => a.id !== id);
  if (filtered.length === addresses.length) return false;
  saveAddresses(filtered);
  return true;
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
