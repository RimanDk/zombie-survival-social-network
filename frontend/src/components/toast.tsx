// libs
import { Progress } from "@radix-ui/themes";
import classNames from "classnames";
import { Toast as RadixToast } from "radix-ui";

interface ToastProps {
  open: boolean;
  duration?: number;
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  description?: string;
  titleIcon?: React.ReactNode;
  descriptionIcon?: React.ReactNode;
  onOpenChange: (open: boolean) => void;
}
export function Toast({
  open,
  duration = 1500,
  type = "info",
  onOpenChange,
  title,
  titleIcon,
  description,
  descriptionIcon,
}: ToastProps) {
  return (
    <RadixToast.Root
      open={open}
      onOpenChange={onOpenChange}
      duration={duration}
      className={classNames(
        "ToastRoot",
        "h-fit border border-l-2 border-zinc-700 bg-zinc-900 p-3",
        {
          "border-l-blue-500": type === "info",
          "border-l-green-500": type === "success",
          "border-l-amber-500": type === "warning",
          "border-l-red-500": type === "error",
        },
      )}
    >
      {title && (
        <RadixToast.Title className="mb-1 flex items-center gap-2 font-semibold text-white">
          {titleIcon}
          {title}
        </RadixToast.Title>
      )}
      {description && (
        <RadixToast.Description className="flex items-center gap-2 text-sm text-white">
          {descriptionIcon}
          {description}
        </RadixToast.Description>
      )}
      <Progress size="1" color="lime" duration={`${duration / 1000}s`} />
    </RadixToast.Root>
  );
}
