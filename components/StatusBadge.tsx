import type { ProductStatus } from "@/lib/types";
import { statusLabels } from "@/lib/data";

export default function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className={`status-pill status-${status}`}>
      {statusLabels[status]}
    </span>
  );
}
