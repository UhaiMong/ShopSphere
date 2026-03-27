import { OrderStatus } from "@/types/typeOrder";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCcw,
} from "lucide-react";

// Status helpers
export const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: "neutral" | "brand" | "success" | "warning" | "danger";
    icon: React.ElementType;
  }
> = {
  pending: { label: "Pending", color: "neutral", icon: Clock },
  confirmed: { label: "Confirmed", color: "brand", icon: CheckCircle2 },
  processing: { label: "Processing", color: "brand", icon: Package },
  shipped: { label: "Shipped", color: "warning", icon: Truck },
  delivered: { label: "Delivered", color: "success", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "danger", icon: XCircle },
  refunded: { label: "Refunded", color: "danger", icon: RefreshCcw },
};
