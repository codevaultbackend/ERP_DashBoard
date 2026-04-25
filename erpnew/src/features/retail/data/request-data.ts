export type RequestStatus = "approved" | "pending" | "dispatch";
export type ProductTone = "medium" | "critical" | "optimum";

export type RequestProduct = {
  name: string;
  qty: number;
};

export type RequestCardItem = {
  id: string;
  priority: string;
  created: string;
  status: RequestStatus;
  products: RequestProduct[];
};

export type RequestableProduct = {
  id: number;
  name: string;
  stock: number;
  tone: ProductTone;
  qty: string;
};

export const requestStats = [
  {
    id: 1,
    title: "Total Requests",
    value: "450",
    change: "+12.5%",
    changeTone: "green",
    icon: "box",
    tone: "gold",
  },
  {
    id: 2,
    title: "Approved Requests",
    value: "20",
    change: "+12.5%",
    changeTone: "red",
    icon: "approved",
    tone: "green",
  },
  {
    id: 3,
    title: "Low Stock",
    value: "24",
    icon: "arrow",
    tone: "red",
  },
  {
    id: 4,
    title: "Transit Goods",
    value: "150",
    icon: "truck",
    tone: "purple",
  },
] as const;

export const myStockRequests: RequestCardItem[] = [];

export const receivedRequests: RequestCardItem[] = [
  {
    id: "req2",
    priority: "medium",
    created: "2026-03-17",
    status: "dispatch",
    products: [
      { name: "Earings 2.4S", qty: 10 },
      { name: 'Monitor - 27" 4K', qty: 15 },
    ],
  },
];

export const requestableProducts: RequestableProduct[] = [
  { id: 1, name: "Earing : 2.12", stock: 12, tone: "medium", qty: "" },
  { id: 2, name: "Gold Neckless 24g", stock: 35, tone: "optimum", qty: "" },
  { id: 3, name: "Silver Rings 4.5gg", stock: 2, tone: "critical", qty: "" },
  { id: 4, name: "Gold Bangle 24K", stock: 8, tone: "medium", qty: "" },
];