"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, LayoutDashboard, ScrollText } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { cn, resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";

const MENU = [
    { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/user/api-keys", label: "API Keys", icon: KeyRound },
    { href: "/user/usage", label: "Usage", icon: ScrollText }
];

export default function UserSidebar() {
    const pathname = usePathname();
    const settings = useAppSelector((state) => state.settings);
    const user = useAppSelector((state) => state.user);
    const logoSrc = resolveFileUrl(settings.logo);

    return (
        <aside className="flex h-full min-h-[calc(100vh-3.5rem)] flex-col rounded-2xl border border-indigo-100 bg-linear-to-b from-white via-[#f6f9ff] to-[#ecf2ff] p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:from-secondary-900 dark:via-[#15213f] dark:to-[#1c2f53] dark:text-slate-100">
            <div className="mb-4 rounded-xl border border-indigo-100 bg-white p-3 dark:border-slate-600 dark:bg-white/5">
                <div className="flex items-center gap-2">
                    {logoSrc ? <Image src={logoSrc} alt="" className="h-8 w-8 rounded object-cover" /> : null}
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{settings.application_name || "Service API"}</p>
                </div>
                <div className="mt-3 border-t border-indigo-100 pt-3 dark:border-slate-600">
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300">Developer</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name || "User"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">{user.email}</p>
                    <p className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-300">{user.balance} credits</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                {MENU.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 rounded px-3 py-2 text-sm transition",
                            pathname === item.href
                                ? "bg-indigo-600 text-white dark:bg-slate-100 dark:text-slate-900"
                                : "text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:text-slate-100/90 dark:hover:bg-white/10"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
