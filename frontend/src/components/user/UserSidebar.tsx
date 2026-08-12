"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, KeyRound, LayoutDashboard, ScrollText, Sparkles, Terminal, ChevronRight, BookOpen, Settings, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import { resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";
import { Badge } from "@/components/ui/Badge";
import { setMobileSidebarOpen } from "@/store/slices/appSlice";

const NAV_ITEMS = [
    { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
    { href: "/user/api-keys", label: "API Keys", icon: KeyRound, badge: null },
    { href: "/user/credits", label: "Buy Credits", icon: Coins, badge: "Packs" },
    { href: "/user/ledger", label: "Credit Ledger", icon: TrendingUp, badge: null },
    { href: "/user/usage", label: "Usage Logs", icon: ScrollText, badge: null },
    { href: "/user/playground", label: "API Playground", icon: Terminal, badge: "Live" },
    { href: "/user/settings", label: "Settings", icon: Settings, badge: null },
];

export default function UserSidebar() {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.settings);
    const user = useAppSelector((state) => state.user);
    const isSidebarCollapsed = useAppSelector((state) => state.app.sidebarCollapsed);

    const [isHoveringCollapsed, setIsHoveringCollapsed] = useState(false);

    const isHoverExpanded = isSidebarCollapsed && isHoveringCollapsed;
    const effectiveCollapsed = isSidebarCollapsed && !isHoverExpanded;

    const logoSrc = resolveFileUrl(settings.logo);

    const closeMobileSidebar = () => {
        dispatch(setMobileSidebarOpen(false));
    };

    return (
        <aside
            onMouseEnter={() => {
                if (isSidebarCollapsed) setIsHoveringCollapsed(true);
            }}
            onMouseLeave={() => {
                if (isSidebarCollapsed) setIsHoveringCollapsed(false);
            }}
            className={cn(
                "flex h-full min-h-[calc(100vh-2rem)] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 transition-[width] duration-200",
                (isHoverExpanded || isSidebarCollapsed === false) ? "md:w-[260px] md:px-4" : "md:w-[88px] md:px-2"
            )}
        >
            <div>
                {/* Brand Logo & Application Title */}
                <Link
                    href="/user/dashboard"
                    onClick={closeMobileSidebar}
                    className={cn(
                        "flex items-center py-2 transition-opacity hover:opacity-90",
                        effectiveCollapsed ? "justify-center" : "gap-3 px-2"
                    )}
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 text-white shadow-md shadow-indigo-500/20">
                        {logoSrc ? (
                            <Image src={logoSrc} alt="" className="h-full w-full rounded-[10px] object-cover bg-white dark:bg-slate-950" />
                        ) : (
                            <Terminal className="h-5 w-5 text-white" />
                        )}
                    </div>
                    {!effectiveCollapsed && (
                        <div className="overflow-hidden">
                            <p className="truncate font-bold tracking-tight text-slate-900 dark:text-white">
                                {settings.application_name || "Service API"}
                            </p>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Developer Portal</p>
                        </div>
                    )}
                </Link>

                {/* Developer Credit Widget */}
                {!effectiveCollapsed ? (
                    <div className="mt-5 rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-purple-50/40 p-3.5 dark:border-indigo-900/40 dark:from-indigo-950/40 dark:to-purple-950/20">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                                Available Balance
                            </span>
                            <Badge variant="gradient" className="text-[10px] px-1.5 py-0.5 font-bold">
                                LIVE
                            </Badge>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                {user.balance ?? 0}{" "}
                                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">credits</span>
                            </p>
                            <Link
                                href="/user/credits"
                                onClick={closeMobileSidebar}
                                className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                Top-up <ChevronRight className="ml-0.5 h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="mt-5 flex flex-col items-center gap-1 rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-purple-50/40 p-2 dark:border-indigo-900/40 dark:from-indigo-950/40 dark:to-purple-950/20" title={`${user.balance ?? 0} Credits`}>
                        <Coins className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-black">{user.balance ?? 0}</span>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="mt-6 space-y-1.5">
                    {!effectiveCollapsed && (
                        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Menu
                        </p>
                    )}
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileSidebar}
                                title={effectiveCollapsed ? item.label : undefined}
                                className={cn(
                                    "group relative flex items-center justify-between rounded-xl py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 dark:bg-indigo-500 dark:text-white"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100",
                                    effectiveCollapsed ? "justify-center px-0" : "px-3.5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon
                                        className={cn(
                                            "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                                            isActive
                                                ? "text-white"
                                                : "text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200"
                                        )}
                                    />
                                    {!effectiveCollapsed && <span>{item.label}</span>}
                                </div>
                                {!effectiveCollapsed && item.badge && (
                                    <span
                                        className={cn(
                                            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                                            isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                        )}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Developer Info Card */}
            {!effectiveCollapsed ? (
                <div className="mt-6 rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 dark:border-slate-800/60 dark:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {user.name ? user.name.charAt(0).toUpperCase() : "D"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                                {user.name || "Developer"}
                            </p>
                            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                {user.email || "developer@api.local"}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-6 flex justify-center" title={user.name || "Developer"}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {user.name ? user.name.charAt(0).toUpperCase() : "D"}
                    </div>
                </div>
            )}
        </aside>
    );
}
