"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    ShieldCheck,
    MessageSquare,
    Mail,
    AlertTriangle,
    ArrowLeft,
    Search,
    BookOpenCheck,
    HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import { setMobileSidebarOpen } from "@/store/slices/appSlice";

const DOCS_MENU = [
    {
        group: "Getting Started",
        items: [
            { href: "/user/docs", label: "Introduction", icon: BookOpen },
            { href: "/user/docs/auth", label: "Authentication", icon: ShieldCheck },
        ]
    },
    {
        group: "Services API",
        items: [
            { href: "/user/docs/sms", label: "SMS Service", icon: MessageSquare },
            { href: "/user/docs/email", label: "Email Service", icon: Mail },
        ]
    },
    {
        group: "Reference",
        items: [
            { href: "/user/docs/errors", label: "Error Reference", icon: AlertTriangle },
        ]
    }
];

export default function DocsSidebar() {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const isSidebarCollapsed = useAppSelector((state) => state.app.sidebarCollapsed);
    const [searchQuery, setSearchQuery] = useState("");
    const [isHoveringCollapsed, setIsHoveringCollapsed] = useState(false);

    const isHoverExpanded = isSidebarCollapsed && isHoveringCollapsed;
    const effectiveCollapsed = isSidebarCollapsed && !isHoverExpanded;

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
                "flex h-full min-h-[calc(100vh-2rem)] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-md backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80 text-slate-800 dark:text-slate-100 transition-[width] duration-200",
                (isHoverExpanded || isSidebarCollapsed === false) ? "md:w-[260px] md:px-4" : "md:w-[88px] md:px-2"
            )}
        >
            <div>
                {/* Back to Console Header */}
                <Link
                    href="/user/dashboard"
                    onClick={closeMobileSidebar}
                    className={cn(
                        "flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition group",
                        effectiveCollapsed ? "justify-center py-2" : "gap-2 px-2.5 py-2"
                    )}
                    title={effectiveCollapsed ? "Back to Console" : undefined}
                >
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                    {!effectiveCollapsed && <span>Back to Console</span>}
                </Link>

                {/* Brand Docs Title */}
                <div className={cn(
                    "flex items-center pb-4 border-b border-slate-100 dark:border-slate-800",
                    effectiveCollapsed ? "justify-center mt-3" : "gap-3 px-2.5 mt-3"
                )}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                        <BookOpenCheck className="h-5 w-5" />
                    </div>
                    {!effectiveCollapsed && (
                        <div>
                            <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                                Developer Docs
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                v1.0.0 API Specs
                            </p>
                        </div>
                    )}
                </div>

                {/* Search Input / Search Icon */}
                {!effectiveCollapsed ? (
                    <div className="mt-4 px-1">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Quick search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-slate-200/80 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 flex justify-center text-slate-400" title="Quick Search">
                        <Search className="h-4 w-4" />
                    </div>
                )}

                {/* Docs Navigation Links */}
                <nav className="mt-6 space-y-5">
                    {DOCS_MENU.map((group) => {
                        // Filter items if search query is present
                        const filteredItems = group.items.filter(item => 
                            item.label.toLowerCase().includes(searchQuery.toLowerCase())
                        );

                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={group.group} className="space-y-1.5">
                                {!effectiveCollapsed && (
                                    <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        {group.group}
                                    </p>
                                )}
                                <div className="space-y-1">
                                    {filteredItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={closeMobileSidebar}
                                                title={effectiveCollapsed ? item.label : undefined}
                                                className={cn(
                                                    "group flex items-center gap-2.5 rounded-lg py-2 text-xs font-semibold transition-all duration-150",
                                                    isActive
                                                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-100",
                                                    effectiveCollapsed ? "justify-center px-0" : "px-3"
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "h-4 w-4 transition-transform group-hover:scale-105",
                                                        isActive
                                                            ? "text-indigo-600 dark:text-indigo-400"
                                                            : "text-slate-400 group-hover:text-slate-500 dark:text-slate-500"
                                                    )}
                                                />
                                                {!effectiveCollapsed && <span>{item.label}</span>}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Credits / Help Icon */}
            {!effectiveCollapsed ? (
                <div className="rounded-xl border border-slate-200/50 bg-slate-50/50 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40 text-center">
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        Need technical help?
                    </p>
                    <a
                        href="mailto:support@adiyogifintech.com"
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Contact Support
                    </a>
                </div>
            ) : (
                <div className="flex justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition" title="Contact Support">
                    <a href="mailto:support@adiyogifintech.com">
                        <HelpCircle className="h-5 w-5" />
                    </a>
                </div>
            )}
        </aside>
    );
}
