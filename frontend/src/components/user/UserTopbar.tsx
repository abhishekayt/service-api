"use client";

import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Button } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleMobileSidebarOpen } from "@/store/slices/appSlice";
import { resetUser } from "@/store/slices/userSlice";

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
            toast.error(data.message);
        }
    };

    return (
        <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-linear-to-r from-white via-[#f4f7ff] to-[#edf3ff] px-5 py-2 shadow-sm dark:border-slate-700 dark:from-[#11192b] dark:via-[#16223a] dark:to-[#1b2c4d]">
            <Button type="button" variant="ghost" size="sm" className="md:hidden" onClick={() => dispatch(toggleMobileSidebarOpen())}>
                <Menu className="h-4 w-4" />
            </Button>
            <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Welcome, {user.name || "Developer"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Balance: {user.balance} credits</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" />
                Logout
            </Button>
        </div>
    );
}
