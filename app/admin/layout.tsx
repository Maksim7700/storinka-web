"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar, { type CurrentUser } from "../_components/Sidebar";
import TopBar from "../_components/TopBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      router.replace("/login");
      return;
    }
    try {
      setUser(JSON.parse(userStr) as CurrentUser);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked || !user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <TopBar onMenuClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar user={user} />}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
