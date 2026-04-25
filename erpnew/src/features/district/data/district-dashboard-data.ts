import {
  LayoutDashboard,
  Boxes,
  PackagePlus,
  Truck,
  ReceiptText,
  BookOpenText,
  Store,
  Settings2,
  BarChart3,
  LogOut,
  Package,
  OctagonAlert,
  TruckIcon,
  BadgeDollarSign,
  CircleUserRound,
  RefreshCw,
  Bell,
  Wallet,
  TriangleAlert,
} from "lucide-react";

export const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/retail/district-dashboard", active: true },
  { label: "Stock Management", icon: Boxes, href: "/retail/stock-management" },
  { label: "Request", icon: PackagePlus, href: "/retail/request" },
  { label: "Transit", icon: Truck, href: "/retail/transit" },
  { label: "Billing", icon: ReceiptText, href: "/retail/billing" },
  { label: "Ledger", icon: BookOpenText, href: "/retail/ledger" },
  { label: "Retail Store", icon: Store, href: "/retail/store" },
  { label: "Exchange Management", icon: Settings2, href: "/retail/exchange-management" },
  { label: "Reports & Analytics", icon: BarChart3, href: "/retail/reports-analytics" },
];

export const userProfile = {
  company: "Athratech Pvt Limited",
  name: "Gustavo Xavier",
  role: "Super Admin",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
};

export const statCards = [
  {
    title: "Total Stock",
    value: "2,543",
    icon: Package,
    iconWrap: "bg-[#F8E7AE]",
    iconColor: "text-[#A67C00]",
  },
  {
    title: "Retail Stores Stocks",
    value: "2,543",
    icon: Package,
    iconWrap: "bg-[#F8E7AE]",
    iconColor: "text-[#A67C00]",
  },
  {
    title: "Dead Stock Items",
    value: "20",
    icon: OctagonAlert,
    iconWrap: "bg-[#FDE9E9]",
    iconColor: "text-[#F04438]",
  },
  {
    title: "Transit Goods",
    value: "45",
    icon: TruckIcon,
    iconWrap: "bg-[#EEDCFF]",
    iconColor: "text-[#9333EA]",
  },
  {
    title: "Gold Price",
    value: "$20M",
    icon: Package,
    iconWrap: "bg-[#F8E7AE]",
    iconColor: "text-[#A67C00]",
  },
  {
    title: "Silver Price",
    value: "$12M",
    icon: Package,
    iconWrap: "bg-[#F8E7AE]",
    iconColor: "text-[#A67C00]",
  },
];

export const storePerformanceData = [
  { name: "Store 1", revenue: 90 },
  { name: "Store 2", revenue: 125 },
  { name: "Store 3", revenue: 145 },
  { name: "Store 4", revenue: 90 },
  { name: "Store 5", revenue: 112 },
  { name: "Store 6", revenue: 155 },
  { name: "Store 7", revenue: 125 },
  { name: "Store 8", revenue: 182 },
  { name: "Store 9", revenue: 135 },
  { name: "Store 10", revenue: 110 },
  { name: "Store 11", revenue: 60 },
  { name: "Store 12", revenue: 116 },
  { name: "Store 13", revenue: 135 },
  { name: "Store 14", revenue: 57 },
  { name: "Store 15", revenue: 99 },
  { name: "Store 16", revenue: 40 },
  { name: "Store 17", revenue: 100 },
  { name: "Store 18", revenue: 72 },
  { name: "Store 19", revenue: 90 },
  { name: "Store 20", revenue: 100 },
];

export const profitLossData = [
  { month: "Jan", value: 500 },
  { month: "Feb", value: 540 },
  { month: "Mar", value: 580 },
  { month: "Apr", value: 555 },
  { month: "May", value: 620 },
  { month: "Jun", value: 650 },
];

export const recentActivities = [
  {
    title: "2 Neckless in Transit",
    subtitle: "from Karnal to Gurgaon",
    time: "5 minutes ago",
    icon: CircleUserRound,
    iconWrap: "bg-[#E7F0FF]",
    iconColor: "text-[#5B8DEF]",
  },
  {
    title: "Stock Updated",
    subtitle: "Latest System Activities and updates",
    time: "15 minutes ago",
    icon: RefreshCw,
    iconWrap: "bg-[#E8F8EA]",
    iconColor: "text-[#34C759]",
  },
  {
    title: "Setting Updated",
    subtitle: "System",
    time: "1 hour ago",
    icon: Settings2,
    iconWrap: "bg-[#F2E8FF]",
    iconColor: "text-[#A855F7]",
  },
  {
    title: "Sales Transaction",
    subtitle: "Sale completed - $4,500",
    time: "7 hours ago",
    icon: Wallet,
    iconWrap: "bg-[#FFF6D7]",
    iconColor: "text-[#E5B800]",
  },
  {
    title: "Stock Alert",
    subtitle: "Low stock alert from #2461",
    time: "22 hours ago",
    icon: Bell,
    iconWrap: "bg-[#FDE9E9]",
    iconColor: "text-[#F04438]",
  },
];

export const logoutItem = {
  label: "Log Out",
  icon: LogOut,
};