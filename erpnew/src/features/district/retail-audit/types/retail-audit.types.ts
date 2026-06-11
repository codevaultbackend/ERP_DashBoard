/* -------------------------------------------------------------------------- */
/*                              STORE TYPES                                   */
/* -------------------------------------------------------------------------- */

export type RetailAuditStore = {
  id: number;

  store_name: string;

  store_code: string;

  organization_level?: string;

  state?: string;

  district?: string;

  address?: string;

  is_active?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                              AUDIT TYPES                                   */
/* -------------------------------------------------------------------------- */

export type RetailAuditStatus =
  | "pending"
  | "completed"
  | "approved"
  | "rejected"
  | "in_progress"
  | string;

export type RetailAudit = {
  id: number;

  audit_no?: string;

  audit_name?: string;

  audit_title?: string;

  organization_id?: number;

  store_id?: number;

  store_name?: string;

  organization_name?: string;

  auditor_name?: string;

  status?: RetailAuditStatus;

  remarks?: string;

  created_at?: string;

  updated_at?: string;
};

/* -------------------------------------------------------------------------- */
/*                          AUDIT ITEM TYPES                                  */
/* -------------------------------------------------------------------------- */

export type RetailAuditItem = {
  id: number;

  item_name?: string;

  article_code?: string;

  sku_code?: string;

  category?: string;

  expected_qty?: number;

  actual_qty?: number;

  variance_qty?: number;

  expected_weight?: number;

  actual_weight?: number;

  variance_weight?: number;

  remarks?: string;
};

/* -------------------------------------------------------------------------- */
/*                         AUDIT DETAILS TYPE                                 */
/* -------------------------------------------------------------------------- */

export type RetailAuditDetails = {
  id: number;

  audit_no?: string;

  audit_name?: string;

  audit_title?: string;

  organization_id?: number;

  store_id?: number;

  store_name?: string;

  organization_name?: string;

  auditor_name?: string;

  status?: RetailAuditStatus;

  remarks?: string;

  created_at?: string;

  updated_at?: string;

  items?: RetailAuditItem[];

  variance_items?: RetailAuditItem[];
};

/* -------------------------------------------------------------------------- */
/*                             FILTER TYPES                                   */
/* -------------------------------------------------------------------------- */

export type RetailAuditFilters = {
  search: string;

  storeId: number | null;

  date: string;
};

/* -------------------------------------------------------------------------- */
/*                              CARD TYPES                                    */
/* -------------------------------------------------------------------------- */

export type RetailAuditCardProps = {
  audit: RetailAudit;

  onView: (
    audit: RetailAudit
  ) => void;

  onDownload: (
    auditId: number
  ) => void;
};

/* -------------------------------------------------------------------------- */
/*                           HEADER TYPES                                     */
/* -------------------------------------------------------------------------- */

export type RetailAuditHeaderProps = {
  totalAudits: number;

  loading?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                           FILTER COMPONENT                                 */
/* -------------------------------------------------------------------------- */

export type RetailAuditFiltersProps = {
  search: string;

  selectedStore:
    | number
    | null;

  selectedDate: string;

  stores: RetailAuditStore[];

  onSearchChange: (
    value: string
  ) => void;

  onStoreChange: (
    value:
      | number
      | null
  ) => void;

  onDateChange: (
    value: string
  ) => void;
};

/* -------------------------------------------------------------------------- */
/*                            GRID COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export type RetailAuditGridProps = {
  audits: RetailAudit[];

  loading: boolean;

  onView: (
    audit: RetailAudit
  ) => void;

  onDownload: (
    auditId: number
  ) => void;
};

/* -------------------------------------------------------------------------- */
/*                          DETAILS DRAWER                                    */
/* -------------------------------------------------------------------------- */

export type RetailAuditDetailsDrawerProps =
  {
    open: boolean;

    auditId:
      | number
      | null;

    onClose: () => void;
  };

/* -------------------------------------------------------------------------- */
/*                              METRICS                                       */
/* -------------------------------------------------------------------------- */

export type RetailAuditMetrics = {
  totalAudits: number;

  completedAudits: number;

  pendingAudits: number;

  rejectedAudits: number;
};

/* -------------------------------------------------------------------------- */
/*                              STATUS COLORS                                 */
/* -------------------------------------------------------------------------- */

export const AUDIT_STATUS_COLORS: Record<
  string,
  string
> = {
  completed:
    "bg-green-50 text-green-700 border-green-200",

  approved:
    "bg-green-50 text-green-700 border-green-200",

  pending:
    "bg-yellow-50 text-yellow-700 border-yellow-200",

  in_progress:
    "bg-blue-50 text-blue-700 border-blue-200",

  rejected:
    "bg-red-50 text-red-700 border-red-200",
};

/* -------------------------------------------------------------------------- */
/*                           EMPTY FILTERS                                    */
/* -------------------------------------------------------------------------- */

export const DEFAULT_AUDIT_FILTERS: RetailAuditFilters =
  {
    search: "",

    storeId: null,

    date: "",
  };