export type RefundStat = {
  title: string;
  value: string;
  iconType: "total" | "approved" | "pending" | "amount";
  iconWrapClassName: string;
};

export type RefundItem = {
  label: string;
  value: string;
};

export type RefundRequest = {
  id: string;
  customerName: string;
  phone: string;
  billNo: string;
  purchaseDate: string;
  refundDate: string;
  statusBadge: string;
  status: "approved" | "pending" | "processing" | "rejected";
  refundReason: string;
  refundMethod: string;
  refundAmount: string;
  deduction: string;
  finalRefund: string;
  productName: string;
  productCode: string;
  metal: string;
  weight: string;
  originalValue: string;
  expanded?: boolean;
};

export const refundStats: RefundStat[] = [
  {
    title: "Total Refunds",
    value: "8",
    iconType: "total",
    iconWrapClassName: "bg-[#DBEAFE]",
  },
  {
    title: "Approved",
    value: "5",
    iconType: "approved",
    iconWrapClassName: "bg-[#DCFCE7]",
  },
  {
    title: "Pending",
    value: "2",
    iconType: "pending",
    iconWrapClassName: "bg-[#FDEAD7]",
  },
  {
    title: "Refund Amount",
    value: "₹35K",
    iconType: "amount",
    iconWrapClassName: "bg-[#F3E8FF]",
  },
];

export const refundRequests: RefundRequest[] = [
  {
    id: "RFD-2024-001",
    customerName: "Priya Sharma",
    phone: "+91 98765 43210",
    billNo: "INV-2024-145",
    purchaseDate: "2024-03-18",
    refundDate: "2024-03-22",
    statusBadge: "4 days since purchase",
    status: "approved",
    refundReason: "Product mismatch",
    refundMethod: "Bank Transfer",
    refundAmount: "₹3,15,000",
    deduction: "FREE",
    finalRefund: "₹3,15,000",
    productName: "Gold Necklace 22K",
    productCode: "GN-22K-045",
    metal: "Gold 22K",
    weight: "45g",
    originalValue: "₹3,15,000",
    expanded: true,
  },
  {
    id: "RFD-2024-002",
    customerName: "Priya Sharma",
    phone: "+91 98765 43210",
    billNo: "INV-2024-145",
    purchaseDate: "2024-03-18",
    refundDate: "2024-03-22",
    statusBadge: "4 days since purchase",
    status: "processing",
    refundReason: "Changed mind",
    refundMethod: "UPI",
    refundAmount: "₹1,20,000",
    deduction: "FREE",
    finalRefund: "₹1,20,000",
    productName: "Diamond Ring 18K",
    productCode: "DR-18K-102",
    metal: "Gold 18K",
    weight: "12g",
    originalValue: "₹1,20,000",
  },
  {
    id: "RFD-2024-003",
    customerName: "Priya Sharma",
    phone: "+91 98765 43210",
    billNo: "INV-2024-145",
    purchaseDate: "2024-03-18",
    refundDate: "2024-03-22",
    statusBadge: "4 days since purchase",
    status: "pending",
    refundReason: "Damaged clasp",
    refundMethod: "Original Payment Source",
    refundAmount: "₹95,000",
    deduction: "FREE",
    finalRefund: "₹95,000",
    productName: "Pearl Earrings",
    productCode: "PE-925-022",
    metal: "Silver 925",
    weight: "18g",
    originalValue: "₹95,000",
  },
  {
    id: "RFD-2024-004",
    customerName: "Priya Sharma",
    phone: "+91 98765 43210",
    billNo: "INV-2024-145",
    purchaseDate: "2024-03-18",
    refundDate: "2024-03-22",
    statusBadge: "4 days since purchase",
    status: "approved",
    refundReason: "Size issue",
    refundMethod: "Cash",
    refundAmount: "₹78,000",
    deduction: "FREE",
    finalRefund: "₹78,000",
    productName: "Bracelet 22K",
    productCode: "BR-22K-501",
    metal: "Gold 22K",
    weight: "16g",
    originalValue: "₹78,000",
  },
  {
    id: "RFD-2024-005",
    customerName: "Priya Sharma",
    phone: "+91 98765 43210",
    billNo: "INV-2024-145",
    purchaseDate: "2024-03-18",
    refundDate: "2024-03-22",
    statusBadge: "4 days since purchase",
    status: "rejected",
    refundReason: "Outside refund window",
    refundMethod: "N/A",
    refundAmount: "₹62,000",
    deduction: "5%",
    finalRefund: "₹58,900",
    productName: "Chain Set",
    productCode: "CS-22K-330",
    metal: "Gold 22K",
    weight: "14g",
    originalValue: "₹62,000",
  },
];

export const refundPolicyPoints = [
  "Products can be refunded within 7 days with no deduction charges",
  "Refunds after 7 days may incur 5% deduction on the original product value",
];