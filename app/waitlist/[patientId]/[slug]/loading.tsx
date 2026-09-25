import { panelClasses } from "@/components/templates/basic-page-template";

export default function Loading() {
  return (
    <main className={panelClasses}>
      <div className="px-6 py-4 min-h-20 shadow-header animate-pulse">
        <div className="h-6 w-56 rounded bg-primary-100" />
      </div>
      <div className="grow min-h-0 overflow-auto p-8 flex flex-col gap-y-6 animate-pulse">
        <div className="h-48 rounded-2xl bg-primary-50" />
        <div className="h-32 rounded-2xl bg-primary-50" />
      </div>
    </main>
  );
}
