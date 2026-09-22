export interface FaqItem {
  q: string;
  a: string;
}

export interface SiteConfig {
  name: string;
  legalName: string;
  tagline: string;
  address: {
    street: string;
    area: string;
    city: string;
    postcode: string;
    full: string;
  };
  contact: {
    phone: string;
    displayPhone: string;
    email: string;
  };
  delivery: {
    freeDeliveryThreshold: number;
    bannerText: string;
    estimatedTime: string;
    openingHoursText: string;
  };
  locations: readonly string[];
  heroBanners: readonly string[];
  socialLinks: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
  googleMapsEmbedUrl: string;
  referral: {
    defaultCode: string;
    siteUrl: string;
  };
  faqs: readonly FaqItem[];
}

export const SITE_CONFIG: SiteConfig = {
  name: "Porto Piri Piri",
  legalName: "Zee Grill Burger / Porto Piri Piri",
  tagline: "Flame-grilled chicken, juicy burgers, wraps and more",
  address: {
    street: "49 Kilmarnock Road",
    area: "Shawlands",
    city: "Glasgow",
    postcode: "G41 3YN",
    full: "49 Kilmarnock Road, Shawlands, Glasgow G41 3YN",
  },
  contact: {
    phone: "+441747413273",
    displayPhone: "+44 1747 413273",
    email: "info@portopiripiri.co.uk",
  },
  delivery: {
    freeDeliveryThreshold: 20,
    bannerText: "FREE DELIVERY ON ORDER ABOVE £20.00",
    estimatedTime: "30–45 mins",
    openingHoursText: "Opens at 17:00",
  },
  locations: ["Glasgow", "City Centre", "Scotland"] as const,
  heroBanners: [
    "/images/herosection/Herosection.png",
    "/images/herosection/carousel1.png",
    "/images/herosection/carousel2.png",
  ] as const,
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    whatsapp: "https://wa.me/441747413273",
  },
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=49%20Kilmarnock%20Road%2C%20Shawlands%2C%20Glasgow%20G41%203YN&output=embed",
  referral: {
    defaultCode: "PORTOLAIB",
    siteUrl: "https://zeegrillburger.com",
  },
  faqs: [
    {
      q: "How do I track my order?",
      a: "Once your order is placed, you can track it from the My Orders page. You will also receive SMS/email updates.",
    },
    {
      q: "What are your delivery hours?",
      a: "We deliver from 11:00 AM to 11:00 PM, 7 days a week.",
    },
    {
      q: "Can I cancel my order?",
      a: "Orders can be cancelled within 5 minutes of placing them from the My Orders section.",
    },
    {
      q: "How do I use a coupon code?",
      a: "Enter your coupon code in the checkout page before confirming payment.",
    },
  ],
};
