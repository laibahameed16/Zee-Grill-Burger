import { STORAGE_KEYS, EVENTS } from "./constants";
import { safeLocalStorage } from "./storage";
import { dispatchCustomEvent } from "./utils";

export const getWalletBalance = (): number => {
  const bal = safeLocalStorage.getNumber(STORAGE_KEYS.WALLET_BALANCE, 0);
  return Number.isFinite(bal) && bal >= 0 ? bal : 0;
};

export const setWalletBalance = (amount: number): void => {
  const safe = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  safeLocalStorage.setNumber(STORAGE_KEYS.WALLET_BALANCE, safe);
  dispatchCustomEvent(EVENTS.WALLET_UPDATED);
};

export const addToWallet = (amount: number): number => {
  if (!Number.isFinite(amount) || amount <= 0) return getWalletBalance();
  const newBalance = getWalletBalance() + amount;
  setWalletBalance(newBalance);
  return newBalance;
};

export const deductFromWallet = (amount: number): { success: boolean; deducted: number; newBalance: number } => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, deducted: 0, newBalance: getWalletBalance() };
  }
  const current = getWalletBalance();
  const deducted = Math.min(current, amount);
  const newBalance = current - deducted;
  setWalletBalance(newBalance);
  return {
    success: deducted > 0,
    deducted,
    newBalance,
  };
};

export const canAfford = (amount: number): boolean => {
  return getWalletBalance() >= amount;
};
