"use client";

import { Form, Formik, Field, ErrorMessage } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Mail, Lock, User as UserIcon, Phone, Sparkles, ArrowRight, CheckCircle2, Terminal } from "lucide-react";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Button } from "@/components/ui/Button";
import { useAppSelector } from "@/store/hooks";
import { resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";
import { Badge } from "@/components/ui/Badge";

const schema = Yup.object({
    name: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(5, "Password must be at least 5 characters").required("Password is required"),
    mobile: Yup.string().optional()
});

export default function UserRegisterPage() {
    const router = useRouter();
    const settings = useAppSelector((state) => state.settings);
    const appName = settings.application_name || "Service API";
    const logoSrc = resolveFileUrl(settings.logo);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans text-slate-100">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl md:grid md:grid-cols-12">
                
                {/* Left Side: Hero Panel */}
                <div className="relative flex flex-col justify-between bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-8 md:col-span-5 md:p-10 border-b md:border-b-0 md:border-r border-slate-800">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_50%)]" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 p-1 text-white shadow-lg shadow-indigo-500/30">
                                {logoSrc ? (
                                    <Image src={logoSrc} alt={`${appName} logo`} className="h-full w-full rounded-lg object-cover bg-white" />
                                ) : (
                                    <Terminal className="h-5 w-5" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold tracking-tight text-white">{appName}</h3>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Developer Registration</p>
                            </div>
                        </div>

                        <div className="mt-10 space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Sign up Bonus</span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
                                Claim 100 Free Credits on Account Creation
                            </h2>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Start testing SMS and Email API endpoints immediately with full access to key management and live logs.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-8 space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
                        <p className="text-xs font-semibold text-indigo-300">Why Developers Choose Us</p>
                        <ul className="space-y-2 text-xs text-slate-300">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                <span>No credit card required for trial</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Production-ready REST APIs</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Razorpay automated credit top-up</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Side: Form Panel */}
                <div className="flex flex-col justify-center p-8 md:col-span-7 md:p-10 bg-slate-900/90">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Create your developer account</h2>
                        <p className="mt-1.5 text-sm text-slate-400">
                            Get started in seconds with 100 welcome credits.
                        </p>
                    </div>

                    <Formik
                        initialValues={{ name: "", email: "", password: "", mobile: "" }}
                        validationSchema={schema}
                        onSubmit={async (values, { setSubmitting }) => {
                            const { data } = await AxiosHelperUser.postData("/register", values);
                            if (data.status) {
                                toast.success(data.message || "Account created successfully!");
                                router.push("/user/dashboard");
                            } else {
                                toast.error(data.message || "Registration failed");
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="mt-6 space-y-3.5">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                                        <Field
                                            name="name"
                                            placeholder="Alex Mercer"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <ErrorMessage className="text-xs font-medium text-rose-400" name="name" component="p" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                                        <Field
                                            name="email"
                                            type="email"
                                            placeholder="alex@company.com"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <ErrorMessage className="text-xs font-medium text-rose-400" name="email" component="p" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Mobile Number (Optional)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                                        <Field
                                            name="mobile"
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                                        <Field
                                            type="password"
                                            name="password"
                                            placeholder="••••••••"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <ErrorMessage className="text-xs font-medium text-rose-400" name="password" component="p" />
                                </div>

                                <Button
                                    type="submit"
                                    variant="gradient"
                                    size="lg"
                                    fullWidth
                                    disabled={isSubmitting}
                                    className="mt-4"
                                >
                                    {isSubmitting ? (
                                        "Creating Account..."
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Register & Claim 100 Credits <ArrowRight className="h-4 w-4" />
                                        </span>
                                    )}
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    <div className="mt-6 border-t border-slate-800 pt-5 text-center">
                        <p className="text-xs text-slate-400">
                            Already registered?{" "}
                            <Link href="/user/login" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
