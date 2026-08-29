import Avatar from "@/components/atoms/icons/avatar";
import LucideIcon from "@/components/atoms/icons/lucide-icon";
import { cn } from "@/lib/utils/functions/styling";
import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function UserLogoutButton() {
  const user = await currentUser();

  if (!user) return null;

  const firstName = user.firstName ?? "John";
  const lastName = user.lastName ?? "Doe";

  return (
    <SignOutButton>
      <button
        type="button"
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
    </SignOutButton>
  );
}
