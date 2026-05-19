"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export type CurrentUser = {
  id: number;
  email: string;
  fullName: string | null;
  role: "USER" | "MANAGER" | "ADMIN";
  avatarUrl: string | null;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  minRole?: "MANAGER" | "ADMIN";
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Мої сайти", icon: <SitesIcon /> },
  { href: "/admin/catalog", label: "Каталог", icon: <CatalogIcon /> },
  { href: "/admin/profile", label: "Профіль", icon: <UserIcon /> },
  { href: "/support", label: "Підтримка", icon: <SupportIcon /> },
  {
    href: "/admin/templates",
    label: "Шаблони",
    icon: <TemplatesIcon />,
    minRole: "MANAGER",
  },
  {
    href: "/admin/users",
    label: "Користувачі",
    icon: <UsersIcon />,
    minRole: "ADMIN",
  },
];

function roleSatisfies(
  userRole: CurrentUser["role"],
  required?: NavItem["minRole"],
) {
  if (!required) return true;
  const order = { USER: 0, MANAGER: 1, ADMIN: 2 };
  return order[userRole] >= order[required];
}

export default function Sidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[#E6E6E6] bg-white">
      <nav className="flex-1 px-3 pt-4">
        <ul className="space-y-1">
          {navItems
            .filter((item) => roleSatisfies(user.role, item.minRole))
            .map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-neutral-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      <div className="border-t border-[#E6E6E6] px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <LogoutIcon />
          Log Out
        </button>
      </div>
    </aside>
  );
}

function SitesIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 9h16.5"
      />
    </svg>
  );
}

function CatalogIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 19.5V6.75A2.25 2.25 0 016 4.5h3.75v15H6a2.25 2.25 0 01-2.25-2.25v-.75z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 4.5h8.25a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H9.75"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
      />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.879 16.121a3 3 0 104.243-4.243 3 3 0 00-4.243 4.243zM12 3a9 9 0 100 18 9 9 0 000-18zM4.93 4.93l3.536 3.536M15.536 15.536l3.535 3.535M19.07 4.93l-3.535 3.536M8.464 15.536l-3.535 3.535"
      />
    </svg>
  );
}

function TemplatesIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 4.5h6v6h-6zM14.25 4.5h6v6h-6zM3.75 14.25h6v6h-6zM14.25 14.25h6v6h-6z"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.5a3 3 0 00-6 0M19.5 19.5a3 3 0 00-3-3M4.5 19.5a3 3 0 013-3M12 12a3 3 0 100-6 3 3 0 000 6zM17.25 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM6.75 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
      />
    </svg>
  );
}
