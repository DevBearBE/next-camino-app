"use client";

import LucideIcon from "@/components/atoms/icons/lucide-icon";
import { cn } from "@/lib/utils/functions/styling";
import { toastManager } from "@/lib/utils/toasts/toast-manager";
import { Toast } from "@base-ui/react/toast";
import { PropsWithChildren } from "react";

type ToastType = "success" | "error";

const toastTypeConfig: Record<
  ToastType,
  {
    borderClass: string;
    iconBgClass: string;
    iconColorClass: string;
    iconName: "check" | "circleAlert";
  }
> = {
  success: {
    borderClass: "border-green-600",
    iconBgClass: "bg-green-100",
    iconColorClass: "text-green-700",
    iconName: "check",
  },
  error: {
    borderClass: "border-accent-500",
    iconBgClass: "bg-accent-100",
    iconColorClass: "text-accent-600",
    iconName: "circleAlert",
  },
};

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => {
    const type: ToastType = (toast.type as ToastType) ?? "success";
    const isCompact = !toast.description;
    const config = toastTypeConfig[type];

    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        className={cn(
          "relative flex gap-3 rounded-xl border-l-4 bg-white pl-4 pr-8 shadow-md shadow-black/15",
          config.borderClass,
          isCompact ? "items-center py-3" : "items-start py-4",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            config.iconBgClass,
          )}
        >
          <LucideIcon
            name={config.iconName}
            size="xs"
            className={config.iconColorClass}
          />
        </span>

        <div className="flex min-w-0 flex-col gap-y-0.5">
          <Toast.Title className="text-sm font-bold text-primary-800" />
          {!isCompact && (
            <Toast.Description className="text-sm text-primary-400" />
          )}
        </div>

        <Toast.Close
          aria-label="Sluiten"
          className="absolute top-3 right-3 text-primary-400 hover:text-primary-600"
        >
          <LucideIcon name="x" size="xs" />
        </Toast.Close>
      </Toast.Root>
    );
  });
}

export default function AppToastProvider({ children }: PropsWithChildren) {
  return (
    <Toast.Provider toastManager={toastManager}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed top-8 right-6 z-50 flex w-full max-w-sm flex-col gap-2">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
