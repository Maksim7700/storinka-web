"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";
import {
  CatalogIcon,
  LogoutIcon,
  SitesIcon,
  SupportIcon,
  TemplatesIcon,
  TransactionsIcon,
  UserIcon,
  UsersIcon,
} from "./icons";

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
  /** Render a thin separator above this item to group sections visually. */
  separatorAbove?: boolean;
};

const ICON_CLASS = "h-5 w-5";

const navItems: NavItem[] = [
  { href: "/admin", label: "Мої сайти", icon: <SitesIcon className={ICON_CLASS} /> },
  { href: "/admin/catalog", label: "Каталог", icon: <CatalogIcon className={ICON_CLASS} /> },
  {
    href: "/admin/profile",
    label: "Профіль",
    icon: <UserIcon className={ICON_CLASS} />,
    separatorAbove: true,
  },
  {
    href: "/admin/transactions",
    label: "Транзакції",
    icon: <TransactionsIcon className={ICON_CLASS} />,
  },
  { href: "/support", label: "Підтримка", icon: <SupportIcon className={ICON_CLASS} /> },
  {
    href: "/admin/templates",
    label: "Шаблони",
    icon: <TemplatesIcon className={ICON_CLASS} />,
    minRole: "MANAGER",
    separatorAbove: true,
  },
  {
    href: "/admin/users",
    label: "Користувачі",
    icon: <UsersIcon className={ICON_CLASS} />,
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
            .map((item, idx) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Fragment key={item.href}>
                  {item.separatorAbove && idx > 0 && (
                    <li
                      role="separator"
                      aria-hidden="true"
                      className="my-2 border-t border-[#E6E6E6]"
                    />
                  )}
                  <li>
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
                </Fragment>
              );
            })}
        </ul>
      </nav>

      <div className="border-t border-[#E6E6E6] px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <LogoutIcon className={ICON_CLASS} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
