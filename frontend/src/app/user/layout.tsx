"use client";

import UserSidebar from "@/components/user/UserSidebar";
import DocsSidebar from "@/components/user/DocsSidebar";
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
    const { sidebarCollapsed, loading, mobileSidebarOpen } = useAppSelector((state) => state.app);

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

    const isDocsPage = pathname.startsWith("/user/docs");

    return (
        <section className={`relative min-h-screen bg-slate-50/70 p-3 md:p-4 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans md:grid md:gap-5 ${
            sidebarCollapsed ? "md:grid-cols-[88px_1fr]" : "md:grid-cols-[260px_1fr]"
        }`}>
            {/* Mobile Overlay */}
            {mobileSidebarOpen ? (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
                    onClick={() => dispatch(setMobileSidebarOpen(false))}
                    aria-hidden="true"
                />
            ) : null}

            {/* Navigation Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-[280px] p-3 transition-transform duration-300 md:relative md:z-30 md:w-auto md:p-0 ${
                    mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
                {isDocsPage ? <DocsSidebar /> : <UserSidebar />}
            </div>

            {/* Main Application Area */}
            <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 md:gap-5">
                <UserTopbar />
                <main className="flex-1 rounded-2xl border border-slate-200/80 bg-white/80 p-5 md:p-6 shadow-xs backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90">
                    {children}
                </main>
                <footer className="rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-3 text-center text-xs text-slate-500 shadow-2xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-400">
                    {settings.copyright?.trim() || `Copyright © ${new Date().getFullYear()} ${settings.application_name || 'Service API'}. All rights reserved.`}
                </footer>
            </div>
        </section>
    );
}
