export type Product = {
  id: number;
  code: string;
  name: string;
  metalValue: number;
  makingCharges: number;
  weight: number;
};

export const PRODUCT_DB: Product[] = [
  {
    id: 1,
    code: "GN001",
    name: "Gold Necklace",
    metalValue: 42000,
    makingCharges: 3200,
    weight: 12.4,
  },
  {
    id: 2,
    code: "SR002",
    name: "Silver Ring",
    metalValue: 2800,
    makingCharges: 450,
    weight: 3.2,
  },
  {
    id: 3,
    code: "GB003",
    name: "Gold Bracelet",
    metalValue: 19800,
    makingCharges: 1800,
    weight: 6.8,
  },
  {
    id: 4,
    code: "ER004",
    name: "Emerald Earrings",
    metalValue: 15400,
    makingCharges: 2200,
    weight: 4.1,
  },
];