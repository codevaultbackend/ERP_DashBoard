export type TransitProduct = {
  id: string;
  name: string;
  quantity: number;
  imageType: "cart" | "jewellery" | "box";
};

export type TransitItem = {
  id: string;
  trackingNumber: string;
  status: "In Transit" | "Delivered";
  routeLabel: string;
  from: string;
  to: string;
  shippedDate: string;
  expectedDelivery: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  externalTrackingNumber: string;
  products: TransitProduct[];
};

export const transitStats = {
  inTransit: 1,
  shipments: 0,
  goodsReceipt: 1,
};

export const transitItems: TransitItem[] = [
  {
    id: "trk-1774098384414",
    trackingNumber: "TRK-1774098384414",
    status: "In Transit",
    routeLabel: "Head → District",
    from: "Model Town Store",
    to: "South District",
    shippedDate: "2026-03-21",
    expectedDelivery: "2026-03-24",
    driverName: "Ramesh",
    driverPhone: "99999-99999",
    vehicleNumber: "HR06 NA2456",
    externalTrackingNumber: "2A3456BAD1134",
    products: [
      {
        id: "p1",
        name: "Traditional Gold Necklace Set",
        quantity: 10,
        imageType: "cart",
      },
      {
        id: "p2",
        name: "Gold Bangle Pair",
        quantity: 15,
        imageType: "jewellery",
      },
      {
        id: "p3",
        name: "Diamond Ring Collection",
        quantity: 8,
        imageType: "box",
      },
    ],
  },
];

export function getTransitByTrackingId(trackingId: string) {
  return transitItems.find(
    (item) =>
      item.id.toLowerCase() === trackingId.toLowerCase() ||
      item.trackingNumber.toLowerCase() === trackingId.toLowerCase()
  );
}