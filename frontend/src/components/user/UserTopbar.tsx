"use client";

import { LogOut, Menu, User as UserIcon, Coins, Sparkles, ExternalLink, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Button } from "@/components/ui/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleMobileSidebarOpen } from "@/store/slices/appSlice";
import { resetUser } from "@/store/slices/userSlice";
import Link from "next/link";

export default function UserTopbar() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);

    const handleLogout = async () => {
        const { data } = await AxiosHelperUser.postData("/logout", {});
        if (data.status) {
            dispatch(resetUser());
            toast.success("Logged out successfully");
            router.push("/user/login");
            router.refresh();
        } else {
            toast.error(data.message || "Failed to logout");
        }
    };

    return (
        <header className="flex h-16 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 md:px-6 shadow-xs backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90">
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => dispatch(toggleMobileSidebarOpen())}
                    aria-label="Toggle Navigation"
                >
                    <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                </Button>
                <div>
                    <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                        Welcome back, {user.name || "Developer"} 👋
                    </h2>
                    <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                        Manage API keys, check live usage, and top up credits.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Quick Action Top Up Pill */}
                <Link
                    href="/user/credits"
                    className="hidden sm:flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition"
                >
                    <Coins className="h-3.5 w-3.5" />
                    <span>{user.balance ?? 0} Credits</span>
                </Link>

                {/* User Profile Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            {user.name ? user.name.charAt(0).toUpperCase() : "D"}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">
                                    {user.name || "Developer"}
                                </p>
                                <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                                    {user.email || "developer@api.local"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/user/dashboard")}>
                            <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
                            <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/user/api-keys")}>
                            <KeyRound className="mr-2 h-4 w-4 text-slate-500" />
                            <span>API Keys</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/user/credits")}>
                            <Coins className="mr-2 h-4 w-4 text-slate-500" />
                            <span>Buy Credits</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 dark:text-red-400">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
