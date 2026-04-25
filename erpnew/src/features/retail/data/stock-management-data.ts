export type StockStat = {
  id: number;
  title: string;
  value: string;
  change?: string;
  changeTone?: "green" | "red";
  tone: "gold" | "red" | "soft-red" | "purple";
  icon: "box" | "badge" | "arrow" | "truck";
};

export type StockArticle = {
  id: string;
  image: string;
  article: string;
  code: string;
  quantity: number;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
};

export type StockRow = {
  id: number;
  category: string;
  code: string;
  quantity: number;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
  image: string;
  articles?: StockArticle[];
};

export const stockStats: StockStat[] = [
  {
    id: 1,
    title: "Total Stocks Items",
    value: "450",
    change: "+12.5%",
    changeTone: "green",
    tone: "gold",
    icon: "box",
  },
  {
    id: 2,
    title: "Dead Stock Items",
    value: "20",
    change: "+12.5%",
    changeTone: "red",
    tone: "red",
    icon: "badge",
  },
  {
    id: 3,
    title: "Low Stock",
    value: "24",
    tone: "soft-red",
    icon: "arrow",
  },
  {
    id: 4,
    title: "Transit Goods",
    value: "150",
    tone: "purple",
    icon: "truck",
  },
];

export const stockRows: StockRow[] = [
  {
    id: 1,
    category: "Ring",
    code: "5704-1234",
    quantity: 10,
    sellingPrice: "₹1.5L",
    makingCharge: "₹5,000",
    purity: "24K",
    netWeight: "12g",
    stoneWeight: "12g",
    grossWeight: "12g",
    image: "/images/ring-1.png",
    articles: [
      {
        id: "1-1",
        image: "/images/ring-1.png",
        article: "Silver 2.X",
        code: "5704-1234",
        quantity: 10,
        purity: "24K",
        netWeight: "12g",
        stoneWeight: "12g",
        grossWeight: "12g",
      },
      {
        id: "1-2",
        image: "/images/ring-2.png",
        article: "Silver 2.X",
        code: "5704-1234",
        quantity: 10,
        purity: "24K",
        netWeight: "12g",
        stoneWeight: "12g",
        grossWeight: "12g",
      },
      {
        id: "1-3",
        image: "/images/ring-3.png",
        article: "Silver 2.X",
        code: "5704-1234",
        quantity: 10,
        purity: "24K",
        netWeight: "12g",
        stoneWeight: "12g",
        grossWeight: "12g",
      },
      {
        id: "1-4",
        image: "/images/ring-4.png",
        article: "Silver 2.X",
        code: "5704-1234",
        quantity: 10,
        purity: "24K",
        netWeight: "12g",
        stoneWeight: "12g",
        grossWeight: "12g",
      },
    ],
  },
  {
    id: 2,
    category: "Anklet",
    code: "5704-1235",
    quantity: 10,
    sellingPrice: "₹50,000",
    makingCharge: "₹5,000",
    purity: "24K",
    netWeight: "11.66g",
    stoneWeight: "11.66g",
    grossWeight: "11.66g",
    image: "/images/ring-2.png",
  },
  {
    id: 3,
    category: "Necklace",
    code: "5704-1236",
    quantity: 10,
    sellingPrice: "₹50,000",
    makingCharge: "₹5,000",
    purity: "24K",
    netWeight: "16g",
    stoneWeight: "16g",
    grossWeight: "16g",
    image: "/images/ring-3.png",
  },
  {
    id: 4,
    category: "Bangle",
    code: "5704-1237",
    quantity: 10,
    sellingPrice: "₹50,000",
    makingCharge: "₹5,000",
    purity: "24K",
    netWeight: "19g",
    stoneWeight: "19g",
    grossWeight: "19g",
    image: "/images/ring-4.png",
  },
  {
    id: 5,
    category: "Chain",
    code: "5704-1238",
    quantity: 10,
    sellingPrice: "₹50,000",
    makingCharge: "₹5,000",
    purity: "24K",
    netWeight: "24g",
    stoneWeight: "24g",
    grossWeight: "24g",
    image: "/images/ring-5.png",
  },
  {
    id: 6,
    category: "Pendant",
    code: "5704-1239",
    quantity: 10,
    sellingPrice: "₹50,000",
    makingCharge: "₹5,000",
    purity: "24K",
    netWeight: "22.56g",
    stoneWeight: "22.56g",
    grossWeight: "22.56g",
    image: "/images/ring-6.png",
  },
  {
    id: 7,
    category: "Earrings",
    code: "5704-1240",
    quantity: 10,
    sellingPrice: "₹50,000",
    makingCharge: "₹5,000",
    purity: "24K",
    netWeight: "12g",
    stoneWeight: "12g",
    grossWeight: "12g",
    image: "/images/ring-7.png",
  },
  {
    id: 8,
    category: "Bracelet",
    code: "5704-1241",
    quantity: 10,
    sellingPrice: "₹50,000",
    makingCharge: "₹5,000",
    purity: "24K",
    netWeight: "12g",
    stoneWeight: "12g",
    grossWeight: "12g",
    image: "/images/ring-8.png",
  },
];