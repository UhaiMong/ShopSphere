// CONFIRM DIALOG

import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
}
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  isLoading,
}: ConfirmProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-sm text-zinc-400 mb-5">{description}</p>
    <div className="flex gap-2 justify-end">
      <Button variant="outline" size="sm" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="danger"
        size="sm"
        isLoading={isLoading}
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);

// TABLE SORT ICON
export const SortIcon = ({
  direction,
}: {
  direction?: "asc" | "desc" | false;
}) => {
  if (direction === "asc")
    return <ChevronUp className="w-3.5 h-3.5 text-orange-400" />;
  if (direction === "desc")
    return <ChevronDown className="w-3.5 h-3.5 text-orange-400" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-600" />;
};
