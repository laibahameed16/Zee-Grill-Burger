import {
  STORAGE_KEYS,
  EVENTS,
  POINTS_PER_POUND,
  DUMMY_SEED_POINTS,
  LOYALTY_EARN_MIN_SPEND,
  LOYALTY_EARN_POINTS_PER_TIER,
  LOYALTY_EARN_TIER_AMOUNT,
} from "./constants";
import { safeLocalStorage } from "./storage";
import { dispatchCustomEvent, generateId } from "./utils";
import { addToWallet } from "./wallet";
import type { ConversionRecord } from "./types";

const seedIfEmpty = (): void => {
  const raw = safeLocalStorage.getString(STORAGE_KEYS.LOYALTY_POINTS, "__UNSET__");
  if (raw === "__UNSET__") {
    safeLocalStorage.setNumber(STORAGE_KEYS.LOYALTY_POINTS, DUMMY_SEED_POINTS);
  }
};

export const getLoyaltyPoints = (): number => {
  seedIfEmpty();
  const pts = safeLocalStorage.getNumber(STORAGE_KEYS.LOYALTY_POINTS, 0);
  return Number.isFinite(pts) && pts >= 0 ? pts : 0;
};

export const setLoyaltyPoints = (points: number): void => {
  seedIfEmpty();
  const safe = Number.isFinite(points) ? Math.max(0, points) : 0;
  safeLocalStorage.setNumber(STORAGE_KEYS.LOYALTY_POINTS, safe);
  dispatchCustomEvent(EVENTS.LOYALTY_POINTS_UPDATED);
};

export const addLoyaltyPoints = (points: number): number => {
  if (!Number.isFinite(points) || points <= 0) return getLoyaltyPoints();
  const newPoints = getLoyaltyPoints() + points;
  setLoyaltyPoints(newPoints);
  return newPoints;
};

export const earnPointsFromSpend = (spendAmount: number): number => {
  if (!Number.isFinite(spendAmount) || spendAmount <= 0) return 0;
  if (spendAmount < LOYALTY_EARN_MIN_SPEND) return 0;
  const tiers = Math.floor(spendAmount / LOYALTY_EARN_TIER_AMOUNT);
  const points = tiers * LOYALTY_EARN_POINTS_PER_TIER;
  addLoyaltyPoints(points);
  return points;
};

export const getConversionHistory = (): ConversionRecord[] => {
  return safeLocalStorage.get<ConversionRecord[]>(STORAGE_KEYS.LP_HISTORY, []);
};

export const saveConversionHistory = (history: ConversionRecord[]): void => {
  safeLocalStorage.set(STORAGE_KEYS.LP_HISTORY, history);
  dispatchCustomEvent(EVENTS.LOYALTY_POINTS_UPDATED);
};

export const getWalletReadyAmount = (): number => {
  const points = getLoyaltyPoints();
  return Math.floor(points / POINTS_PER_POUND);
};

export const getPointsAvailableForWallet = (): number => {
  const points = getLoyaltyPoints();
  return Math.floor(points / POINTS_PER_POUND) * POINTS_PER_POUND;
};

export const getPointsToNextPound = (): number => {
  return getLoyaltyPoints() % POINTS_PER_POUND;
};

export const convertPointsToWallet = (
  pointsToConvert: number
): {
  success: boolean;
  amount: number;
  points: number;
  error?: string;
} => {
  if (!Number.isFinite(pointsToConvert) || pointsToConvert <= 0) {
    return { success: false, amount: 0, points: 0, error: "Invalid points amount" };
  }

  if (pointsToConvert % POINTS_PER_POUND !== 0) {
    return {
      success: false,
      amount: 0,
      points: 0,
      error: `Points must be a multiple of ${POINTS_PER_POUND}`,
    };
  }

  const available = getPointsAvailableForWallet();
  if (pointsToConvert > available) {
    return {
      success: false,
      amount: 0,
      points: 0,
      error: "Not enough points available to convert",
    };
  }

  const amount = pointsToConvert / POINTS_PER_POUND;
  const currentPoints = getLoyaltyPoints();

  setLoyaltyPoints(currentPoints - pointsToConvert);
  addToWallet(amount);

  const record: ConversionRecord = {
    id: generateId("conv-"),
    points: pointsToConvert,
    amount,
    date: new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  const history = getConversionHistory();
  saveConversionHistory([record, ...history]);

  return { success: true, amount, points: pointsToConvert };
};
