import Link from "next/link";

export default function HomePage() {
    return (
        <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 p-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Service API</p>
                <h1 className="mt-2 text-4xl font-bold text-slate-900">Credit-based API services</h1>
                <p className="mt-3 text-slate-600">Generate API keys, call SMS/email services, and pay with credits.</p>
            </div>
            <div className="flex flex-wrap gap-3">
                <Link href="/user/login" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                    Developer portal
                </Link>
                <Link href="/user/register" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Create account
                </Link>
                <Link href="/admin/login" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Admin
                </Link>
            </div>
        </section>
    );
}
