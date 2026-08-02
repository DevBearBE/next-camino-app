import Avatar from "@/components/atoms/icons/avatar";
import { cn } from "@/lib/utils/functions/styling";
import LucideIcon from "@/components/atoms/icons/lucide-icon";

export default function UserLogoutButton() {
  // TODO get first and last name from Clerk after implementing authentication flow
  const firstName = "Kevin";
  const lastName = "Bervoets";

  return (
    <button
      className={cn(
        "grow min-h-10 px-3 py-2 bg-white flex items-center justify-between",
        "shadow-card rounded-2xl cursor-pointer",
        "transition-all ease-in-out duration-150",
        "hover:shadow-raised hover:ring-2 hover:ring-accent-500/40 hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar firstName={firstName} lastName={lastName} />
        <p className="font-bold">
          {firstName} {lastName.charAt(0)}.
        </p>
      </div>
      <LucideIcon name="logout" size="xs" className="text-accent-600" />
    </button>
  );
}
