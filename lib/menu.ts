import { PLACEHOLDER_IMAGE } from "./constants";
import type { MenuItem } from "./types";

export const MENU_CATEGORIES: readonly string[] = [
  "Porto Kebabs",
  "Quesadilla",
  "Sides",
  "Drinks",
  "Burrito",
  "Platters",
  "Dips",
  "Kids Meal",
  "Rice",
  "Burgers",
  "Tandoori Dishes",
  "Biryani Dishes",
  "Hoogies",
  "Bread",
  "Chips With Starters",
  "Thrill Of Grill",
  "Korma Dishes",
  "Street Bites",
  "European Dishes",
  "Wraps",
  "Special Wings",
];

type MenuBadge = "POPULAR" | "RECOMMENDED";

export const createMenuItems = (
  category: string,
  _categoryIndex?: number
): MenuItem[] => {
  const popular: MenuBadge = "POPULAR";
  const recommended: MenuBadge = "RECOMMENDED";
  return [
    {
      name: `${category} Item 1`,
      description:
        "Delicious freshly prepared food made with quality ingredients.",
      price: "£3.95",
      badge: popular,
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: `${category} Item 2`,
      description:
        "Freshly prepared with delicious flavours and quality ingredients.",
      price: "£4.50",
      badge: recommended,
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: `${category} Item 3`,
      description:
        "A delicious choice prepared fresh and served with great flavour.",
      price: "£5.25",
      badge: recommended,
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: `${category} Item 4`,
      description: "Crispy, tasty and freshly prepared for you.",
      price: "£3.50",
      badge: popular,
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: `${category} Item 5`,
      description:
        "Flame-grilled and freshly prepared with delicious seasoning.",
      price: "£3.95",
      badge: recommended,
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: `${category} Item 6`,
      description: "A customer favourite made fresh and full of flavour.",
      price: "£4.50",
      badge: popular,
      image: PLACEHOLDER_IMAGE,
    },
  ];
};

export const getMenuSectionId = (category: string): string =>
  `menu-${category.toLowerCase().replace(/\s+/g, "-")}`;

export const getAllMenuItems = (): MenuItem[] => {
  const all: MenuItem[] = [];
  MENU_CATEGORIES.forEach((category, index) => {
    all.push(...createMenuItems(category, index));
  });
  return all;
};

export const searchMenuItems = (query: string): MenuItem[] => {
  const search = query.toLowerCase().trim();
  if (!search) return getAllMenuItems();
  return getAllMenuItems().filter(
    (item) =>
      item.name.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search)
  );
};

export const getCategoryItems = (category: string): MenuItem[] => {
  return createMenuItems(category);
};
