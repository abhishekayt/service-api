"use client";

import UserSidebar from "@/components/user/UserSidebar";
import UserTopbar from "@/components/user/UserTopbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import AxiosHelper from "@/helpers/AxiosHelper";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSettings } from "@/store/slices/settingSlice";
import { updateUser } from "@/store/slices/userSlice";
import PageLoader from "@/components/admin/PageLoader";
import { setLoading, setMobileSidebarOpen } from "@/store/slices/appSlice";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.settings);
    const { loading, mobileSidebarOpen } = useAppSelector((state) => state.app);

    const isAuthPage = useMemo(() => ["/user/login", "/user/register"].includes(pathname), [pathname]);

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelper.getData("/general-settings");
            if (data.status) dispatch(updateSettings(data.data));
        })();
    }, [dispatch]);

    useEffect(() => {
        (async () => {
            if (isAuthPage) {
                dispatch(setLoading(false));
                return;
            }
            dispatch(setLoading(true));
            const { data } = await AxiosHelperUser.getData("/profile");
            if (data.status) {
                dispatch(updateUser(data.data));
                dispatch(setLoading(false));
            } else {
                router.push("/user/login");
                dispatch(setLoading(false));
            }
        })();
    }, [dispatch, isAuthPage, router]);

    if (loading && !isAuthPage) return <PageLoader />;
    if (isAuthPage) return children;

    return (
        <section className="relative min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-[#f3f7ff] via-white to-[#e8efff] p-3 dark:from-[#0b1020] dark:via-[#111a2f] dark:to-[#172443] md:grid md:grid-cols-[260px_1fr] md:gap-4">
            {mobileSidebarOpen ? (
                <button className="fixed inset-0 z-30 bg-slate-900/40 md:hidden" onClick={() => dispatch(setMobileSidebarOpen(false))} aria-label="Close sidebar overlay" />
            ) : null}
            <div className={`fixed inset-y-0 left-0 z-40 w-[284px] p-3 transition-transform md:static md:z-auto md:w-auto md:p-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <UserSidebar />
            </div>
            <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4">
                <UserTopbar />
                <div className="flex-1 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">{children}</div>
                <footer className="rounded-2xl border border-indigo-100 bg-white/90 px-4 py-3 text-center text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-400">
                    {settings.copyright?.trim() || `Copyright © ${new Date().getFullYear()}. All rights reserved.`}
                </footer>
            </div>
        </section>
    );
}
