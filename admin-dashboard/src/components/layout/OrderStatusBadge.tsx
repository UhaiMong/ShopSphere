// ORDER STATUS BADGE
import { OrderStatus } from "@/types";
import { Badge } from "../ui/Badge";

const ORDER_COLORS: Record<OrderStatus, string> = {
  pending: "yellow",
  confirmed: "blue",
  processing: "blue",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
  refunded: "zinc",
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge color={ORDER_COLORS[status]}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
);
