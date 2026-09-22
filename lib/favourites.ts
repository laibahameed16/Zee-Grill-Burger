import { STORAGE_KEYS, EVENTS } from "./constants";
import { safeLocalStorage } from "./storage";
import { dispatchCustomEvent } from "./utils";
import type { MenuItem } from "./types";

export const getFavourites = (): MenuItem[] => {
  return safeLocalStorage.get<MenuItem[]>(STORAGE_KEYS.FAVOURITES, []);
};

export const saveFavourites = (items: MenuItem[]): void => {
  safeLocalStorage.set(STORAGE_KEYS.FAVOURITES, items);
  dispatchCustomEvent(EVENTS.FAVOURITES_UPDATED);
};

export const isFavourite = (itemName: string): boolean => {
  return getFavourites().some((f) => f.name === itemName);
};

export const toggleFavourite = (item: MenuItem): { added: boolean } => {
  const favourites = getFavourites();
  const existingIndex = favourites.findIndex((f) => f.name === item.name);

  if (existingIndex !== -1) {
    favourites.splice(existingIndex, 1);
    saveFavourites(favourites);
    return { added: false };
  } else {
    favourites.push(item);
    saveFavourites(favourites);
    return { added: true };
  }
};

export const addFavourite = (item: MenuItem): boolean => {
  if (isFavourite(item.name)) return false;
  const favourites = getFavourites();
  favourites.push(item);
  saveFavourites(favourites);
  return true;
};

export const removeFavourite = (itemName: string): boolean => {
  const favourites = getFavourites();
  const filtered = favourites.filter((f) => f.name !== itemName);
  if (filtered.length === favourites.length) return false;
  saveFavourites(filtered);
  return true;
};

export const clearFavourites = (): void => {
  saveFavourites([]);
};
