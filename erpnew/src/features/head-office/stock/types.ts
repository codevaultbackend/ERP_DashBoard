import type { EditableStockPricingItem } from "./pricing/EditStockPricingModal";

export type CategoryRow = {
    id: string;
    category: string;
    quantity: number;
    purchasePrice: string;
    sellingPrice: string;
    makingCharge: string;
    purity: string;
    netWeight: string;
    stoneWeight: string;
    grossWeight: string;
    articles?: ArticleRow[];
};

export type ArticleRow = EditableStockPricingItem & {
    id: string;
    item_id?: number;

    article: string;
    code: string;

    image?: string | null;
    image_url?: string | null;

    quantity: number;
    purchasePrice: string;
    sellingPrice: string;
    makingCharge: string;
    purity: string;
    netWeight: string;
    stoneWeight: string;
    grossWeight: string;

    raw?: any;
};