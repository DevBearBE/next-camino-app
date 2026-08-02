import UserLogoutButton from "@/components/atoms/buttons/user-logout-button";
import NavListItem from "@/components/atoms/nav/nav-list-item";
import Logo from "@/components/modules/logos/logo";
import NavCategory from "@/components/modules/nav/nav-category";

export default function Sidebar() {
  return (
    <aside className="h-full w-72 px-4 py-6 flex flex-col gap-10">
      <section>
        <Logo />
      </section>

      <section className="grow">
        <nav className="flex flex-col gap-6">
          <NavCategory label="Praktijk">
            <NavListItem path="/waitlist" label="Wachtlijst" />
            <NavListItem path="/new-registrations" label="Nieuwe aanvragen" />
            <NavListItem path="/patients" label="Patiënten" />
          </NavCategory>
          <NavCategory label="Andere toepassingen">
            <NavListItem
              path="https://account.crossuite.app"
              label="Crossuite"
              isExternalLink
            />
          </NavCategory>
        </nav>
      </section>

      <section className="flex">
        <UserLogoutButton />
      </section>
    </aside>
  );
}
