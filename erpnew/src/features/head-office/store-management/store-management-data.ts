import {
  Building2,
  Store,
  Users,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type StoreStat = {
  title: string;
  value: string;
  change?: string;
  changeColor?: string;
  icon: LucideIcon;
  iconWrap: string;
  iconColor: string;
};

export type DistrictItem = {
  id: string;
  name: string;
  code: string;
};

export type RetailStoreItem = {
  id: string;
  districtId: string;
  name: string;
  code: string;
};

export type CategoryItem = {
  id: string;
  name: string;
  code: string;
  quantity: number;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWt: string;
  stoneWt: string;
  grossWt: string;
};

export type ArticleItem = {
  id: string;
  image: string;
  article: string;
  code: string;
  quantity: number;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWt: string;
  stoneWt: string;
  grossWt: string;
};

export const storeStats: StoreStat[] = [
  {
    title: "Total Stores",
    value: "18",
    change: "+12.5%",
    changeColor: "text-[#22C55E]",
    icon: Building2,
    iconWrap: "bg-[#F9E8B4]",
    iconColor: "text-[#D89B00]",
  },
  {
    title: "Active Stores",
    value: "15",
    change: "+8.2%",
    changeColor: "text-[#22C55E]",
    icon: Store,
    iconWrap: "bg-[#BDF3C7]",
    iconColor: "text-[#16A34A]",
  },
  {
    title: "Total Employees",
    value: "41",
    icon: Users,
    iconWrap: "bg-[#CFE1FF]",
    iconColor: "text-[#246BCE]",
  },
  {
    title: "Total Revenue",
    value: "₹72.5Cr",
    icon: TrendingUp,
    iconWrap: "bg-[#BDF3C7]",
    iconColor: "text-[#16A34A]",
  },
];

export const districts: DistrictItem[] = [
  { id: "main-warehouse", name: "Main Warehouse", code: "ARS-001" },
  { id: "district-store-1", name: "District Store 1", code: "ARS-002" },
  { id: "district-store-2", name: "District Store 2", code: "ARS-003" },
  { id: "district-store-3", name: "District Store 3", code: "ARS-004" },
  { id: "district-store-4", name: "District Store 4", code: "ARS-005" },
  { id: "district-store-5", name: "District Store 5", code: "ARS-006" },
  { id: "district-store-6", name: "District Store 6", code: "ARS-007" },
];

export const retailStores: RetailStoreItem[] = [
  {
    id: "andheri-retail-store-1",
    districtId: "district-store-1",
    name: "Andheri Retail Store 1",
    code: "ARS-001",
  },
  {
    id: "andheri-retail-store-2",
    districtId: "district-store-1",
    name: "Andheri Retail Store 2",
    code: "ARS-002",
  },
  {
    id: "andheri-retail-store-3",
    districtId: "district-store-1",
    name: "Andheri Retail Store 3",
    code: "ARS-003",
  },
  {
    id: "andheri-retail-store-4",
    districtId: "district-store-1",
    name: "Andheri Retail Store 4",
    code: "ARS-004",
  },
  {
    id: "andheri-retail-store-5",
    districtId: "district-store-1",
    name: "Andheri Retail Store 5",
    code: "ARS-005",
  },
  {
    id: "andheri-retail-store-6",
    districtId: "district-store-1",
    name: "Andheri Retail Store 6",
    code: "ARS-006",
  },

  {
    id: "bandra-retail-store-1",
    districtId: "district-store-2",
    name: "Bandra Retail Store 1",
    code: "BRS-001",
  },
  {
    id: "bandra-retail-store-2",
    districtId: "district-store-2",
    name: "Bandra Retail Store 2",
    code: "BRS-002",
  },

  {
    id: "borivali-retail-store-1",
    districtId: "district-store-3",
    name: "Borivali Retail Store 1",
    code: "BVS-001",
  },
  {
    id: "borivali-retail-store-2",
    districtId: "district-store-3",
    name: "Borivali Retail Store 2",
    code: "BVS-002",
  },

  {
    id: "thane-retail-store-1",
    districtId: "district-store-4",
    name: "Thane Retail Store 1",
    code: "TRS-001",
  },
  {
    id: "thane-retail-store-2",
    districtId: "district-store-4",
    name: "Thane Retail Store 2",
    code: "TRS-002",
  },

  {
    id: "navi-mumbai-retail-store-1",
    districtId: "district-store-5",
    name: "Navi Mumbai Retail Store 1",
    code: "NMRS-001",
  },
  {
    id: "navi-mumbai-retail-store-2",
    districtId: "district-store-5",
    name: "Navi Mumbai Retail Store 2",
    code: "NMRS-002",
  },

  {
    id: "vasai-retail-store-1",
    districtId: "district-store-6",
    name: "Vasai Retail Store 1",
    code: "VRS-001",
  },
  {
    id: "vasai-retail-store-2",
    districtId: "district-store-6",
    name: "Vasai Retail Store 2",
    code: "VRS-002",
  },

  {
    id: "warehouse-retail-store-1",
    districtId: "main-warehouse",
    name: "Warehouse Retail Store 1",
    code: "WRS-001",
  },
  {
    id: "warehouse-retail-store-2",
    districtId: "main-warehouse",
    name: "Warehouse Retail Store 2",
    code: "WRS-002",
  },
];

export const defaultCategories: CategoryItem[] = [
  {
    id: "ring",
    name: "Ring",
    code: "5704-1234",
    quantity: 10,
    sellingPrice: "₹1.5L",
    makingCharge: "₹5,000",
    purity: "24K",
    netWt: "12g",
    stoneWt: "12g",
    grossWt: "12g",
  },
  {
    id: "anklet",
    name: "Anklet",
    code: "5704-1235",
    quantity: 8,
    sellingPrice: "₹50,000",
    makingCharge: "₹5,000",
    purity: "24K",
    netWt: "11.66g",
    stoneWt: "11.66g",
    grossWt: "11.66g",
  },
  {
    id: "necklace",
    name: "Necklace",
    code: "5704-1236",
    quantity: 6,
    sellingPrice: "₹2.2L",
    makingCharge: "₹8,000",
    purity: "24K",
    netWt: "16g",
    stoneWt: "16g",
    grossWt: "16g",
  },
  {
    id: "bangle",
    name: "Bangle",
    code: "5704-1237",
    quantity: 12,
    sellingPrice: "₹85,000",
    makingCharge: "₹6,500",
    purity: "24K",
    netWt: "19g",
    stoneWt: "19g",
    grossWt: "19g",
  },
  {
    id: "chain",
    name: "Chain",
    code: "5704-1238",
    quantity: 9,
    sellingPrice: "₹95,000",
    makingCharge: "₹5,500",
    purity: "24K",
    netWt: "24g",
    stoneWt: "24g",
    grossWt: "24g",
  },
  {
    id: "pendant",
    name: "Pendant",
    code: "5704-1239",
    quantity: 7,
    sellingPrice: "₹58,000",
    makingCharge: "₹4,500",
    purity: "24K",
    netWt: "22.56g",
    stoneWt: "22.56g",
    grossWt: "22.56g",
  },
  {
    id: "earrings",
    name: "Earrings",
    code: "5704-1240",
    quantity: 14,
    sellingPrice: "₹45,000",
    makingCharge: "₹3,500",
    purity: "24K",
    netWt: "12g",
    stoneWt: "12g",
    grossWt: "12g",
  },
  {
    id: "bracelet",
    name: "Bracelet",
    code: "5704-1241",
    quantity: 11,
    sellingPrice: "₹68,000",
    makingCharge: "₹4,000",
    purity: "24K",
    netWt: "12g",
    stoneWt: "12g",
    grossWt: "12g",
  },
];

export const districtCategoriesById: Record<string, CategoryItem[]> = {
  "main-warehouse": defaultCategories,
  "district-store-1": defaultCategories,
  "district-store-2": defaultCategories,
  "district-store-3": defaultCategories,
  "district-store-4": defaultCategories,
  "district-store-5": defaultCategories,
  "district-store-6": defaultCategories,
};

export const retailStoreCategoriesById: Record<string, CategoryItem[]> = {
  "andheri-retail-store-1": defaultCategories,
  "andheri-retail-store-2": defaultCategories,
  "andheri-retail-store-3": defaultCategories,
  "andheri-retail-store-4": defaultCategories,
  "andheri-retail-store-5": defaultCategories,
  "andheri-retail-store-6": defaultCategories,

  "bandra-retail-store-1": defaultCategories,
  "bandra-retail-store-2": defaultCategories,

  "borivali-retail-store-1": defaultCategories,
  "borivali-retail-store-2": defaultCategories,

  "thane-retail-store-1": defaultCategories,
  "thane-retail-store-2": defaultCategories,

  "navi-mumbai-retail-store-1": defaultCategories,
  "navi-mumbai-retail-store-2": defaultCategories,

  "vasai-retail-store-1": defaultCategories,
  "vasai-retail-store-2": defaultCategories,

  "warehouse-retail-store-1": defaultCategories,
  "warehouse-retail-store-2": defaultCategories,
};

export const articlesByCategory: Record<string, ArticleItem[]> = {
  ring: [
    {
      id: "1",
      image: "/rings/ring-1.png",
      article: "Silver 2.X",
      code: "5704-1234",
      quantity: 10,
      sellingPrice: "₹1.5L",
      makingCharge: "₹5,000",
      purity: "24K",
      netWt: "12g",
      stoneWt: "12g",
      grossWt: "12g",
    },
    {
      id: "2",
      image: "/rings/ring-2.png",
      article: "Gold ssN",
      code: "5704-1235",
      quantity: 8,
      sellingPrice: "₹50,000",
      makingCharge: "₹5,000",
      purity: "24K",
      netWt: "11.66g",
      stoneWt: "11.66g",
      grossWt: "11.66g",
    },
    {
      id: "3",
      image: "/rings/ring-3.png",
      article: "Silver 2.X",
      code: "5704-1236",
      quantity: 6,
      sellingPrice: "₹50,000",
      makingCharge: "₹5,000",
      purity: "24K",
      netWt: "16g",
      stoneWt: "16g",
      grossWt: "16g",
    },
    {
      id: "4",
      image: "/rings/ring-4.png",
      article: "Gold ssN",
      code: "5704-1237",
      quantity: 12,
      sellingPrice: "₹50,000",
      makingCharge: "₹5,000",
      purity: "24K",
      netWt: "19g",
      stoneWt: "19g",
      grossWt: "19g",
    },
    {
      id: "5",
      image: "/rings/ring-5.png",
      article: "Silver 2.X",
      code: "5704-1238",
      quantity: 9,
      sellingPrice: "₹50,000",
      makingCharge: "₹5,000",
      purity: "24K",
      netWt: "24g",
      stoneWt: "24g",
      grossWt: "24g",
    },
    {
      id: "6",
      image: "/rings/ring-6.png",
      article: "Gold ssN",
      code: "5704-1239",
      quantity: 7,
      sellingPrice: "₹50,000",
      makingCharge: "₹5,000",
      purity: "24K",
      netWt: "22.56g",
      stoneWt: "22.56g",
      grossWt: "22.56g",
    },
    {
      id: "7",
      image: "/rings/ring-7.png",
      article: "Silver 2.X",
      code: "5704-1240",
      quantity: 14,
      sellingPrice: "₹50,000",
      makingCharge: "₹5,000",
      purity: "24K",
      netWt: "12g",
      stoneWt: "12g",
      grossWt: "12g",
    },
    {
      id: "8",
      image: "/rings/ring-8.png",
      article: "Gold ssN",
      code: "5704-1241",
      quantity: 11,
      sellingPrice: "₹50,000",
      makingCharge: "₹5,000",
      purity: "24K",
      netWt: "12g",
      stoneWt: "12g",
      grossWt: "12g",
    },
  ],

  anklet: [
    {
      id: "1",
      image: "/anklets/anklet-1.png",
      article: "Classic Anklet",
      code: "5801-1101",
      quantity: 5,
      sellingPrice: "₹32,000",
      makingCharge: "₹2,500",
      purity: "24K",
      netWt: "10g",
      stoneWt: "0g",
      grossWt: "10g",
    },
  ],

  necklace: [
    {
      id: "1",
      image: "/necklaces/necklace-1.png",
      article: "Royal Necklace",
      code: "5901-1201",
      quantity: 4,
      sellingPrice: "₹2.8L",
      makingCharge: "₹10,000",
      purity: "24K",
      netWt: "26g",
      stoneWt: "2g",
      grossWt: "28g",
    },
  ],

  bangle: [
    {
      id: "1",
      image: "/bangles/bangle-1.png",
      article: "Gold Bangle",
      code: "6001-1301",
      quantity: 9,
      sellingPrice: "₹78,000",
      makingCharge: "₹4,500",
      purity: "24K",
      netWt: "18g",
      stoneWt: "0g",
      grossWt: "18g",
    },
  ],

  chain: [
    {
      id: "1",
      image: "/chains/chain-1.png",
      article: "Elegant Chain",
      code: "6101-1401",
      quantity: 7,
      sellingPrice: "₹88,000",
      makingCharge: "₹4,000",
      purity: "24K",
      netWt: "20g",
      stoneWt: "0g",
      grossWt: "20g",
    },
  ],

  pendant: [
    {
      id: "1",
      image: "/pendants/pendant-1.png",
      article: "Diamond Pendant",
      code: "6201-1501",
      quantity: 6,
      sellingPrice: "₹61,000",
      makingCharge: "₹3,500",
      purity: "24K",
      netWt: "9g",
      stoneWt: "1g",
      grossWt: "10g",
    },
  ],

  earrings: [
    {
      id: "1",
      image: "/earrings/earring-1.png",
      article: "Drop Earrings",
      code: "6301-1601",
      quantity: 13,
      sellingPrice: "₹42,000",
      makingCharge: "₹2,800",
      purity: "24K",
      netWt: "8g",
      stoneWt: "0.5g",
      grossWt: "8.5g",
    },
  ],

  bracelet: [
    {
      id: "1",
      image: "/bracelets/bracelet-1.png",
      article: "Premium Bracelet",
      code: "6401-1701",
      quantity: 10,
      sellingPrice: "₹66,000",
      makingCharge: "₹3,000",
      purity: "24K",
      netWt: "14g",
      stoneWt: "0g",
      grossWt: "14g",
    },
  ],
};

export function getDistrictById(districtId: string) {
  return districts.find((item) => item.id === districtId) ?? null;
}

export function getRetailStoreById(storeId: string) {
  return retailStores.find((item) => item.id === storeId) ?? null;
}

export function getRetailStoreByDistrictAndStoreId(
  districtId: string,
  storeId: string
) {
  return (
    retailStores.find(
      (item) => item.districtId === districtId && item.id === storeId
    ) ?? null
  );
}

export function getStoresByDistrictId(districtId: string) {
  return retailStores.filter((item) => item.districtId === districtId);
}

export function getDistrictCategories(districtId: string) {
  return districtCategoriesById[districtId] || defaultCategories;
}

export function getRetailStoreCategories(storeId: string) {
  return retailStoreCategoriesById[storeId] || defaultCategories;
}

export function getArticlesByCategory(categoryId: string) {
  return articlesByCategory[categoryId] || [];
}

export function getCategoryById(categoryId: string) {
  return defaultCategories.find((item) => item.id === categoryId) ?? null;
}

export function getCategoryName(categoryId: string) {
  const map: Record<string, string> = {
    ring: "Rings",
    anklet: "Anklets",
    necklace: "Necklaces",
    bangle: "Bangles",
    chain: "Chains",
    pendant: "Pendants",
    earrings: "Earrings",
    bracelet: "Bracelets",
  };

  return map[categoryId] || categoryId;
}