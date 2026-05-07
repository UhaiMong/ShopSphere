import { cn } from "@/utils";
import { forwardRef } from "react";

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...rest }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={4}
        className={cn(
          "w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors hover:border-zinc-600",
          className,
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  ),
);
Textarea.displayName = "Textarea";
