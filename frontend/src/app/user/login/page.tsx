"use client";

import { Form, Formik, Field, ErrorMessage } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import * as Yup from "yup";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Button } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";

const schema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(5, "Password must be at least 5 characters").required("Password is required")
});

export default function UserLoginPage() {
    const router = useRouter();
    const settings = useAppSelector((state) => state.settings);
    const appName = settings.application_name || "Service API";
    const logoSrc = resolveFileUrl(settings.logo);

    return (
        <div className="min-h-screen flex items-center justify-center p-2 lg:p-4">
            <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
                <div className="bg-linear-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 text-white">
                    <div className="flex items-center gap-2">
                        {logoSrc ? (
                            <Image src={logoSrc} alt={`${appName} logo`} className="h-8 w-8 rounded object-cover" />
                        ) : null}
                        <p className="text-xs uppercase tracking-widest text-slate-300">{appName}</p>
                    </div>
                    <h1 className="mt-3 text-3xl font-semibold">Developer Control Hub</h1>
                    <p className="mt-3 text-sm text-slate-200">
                        Secure access to your API keys, credits, usage analytics, and messaging services.
                    </p>
                    <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
                        <p>Use your developer email and password to continue.</p>
                    </div>
                </div>

                <div className="p-8">
                    <h2 className="text-xl font-semibold text-slate-900">Login</h2>
                    <p className="mb-4 mt-1 text-sm text-slate-600">Sign in to manage your developer account.</p>

                    <Formik
                        initialValues={{ email: "", password: "" }}
                        validationSchema={schema}
                        onSubmit={async (values, { setSubmitting }) => {
                            const { data } = await AxiosHelperUser.postData("/login", values);
                            if (data.status) {
                                toast.success(data.message || "Logged in successfully");
                                router.push("/user/dashboard");
                            } else {
                                toast.error(data.message || "Invalid credentials");
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-3">
                                <div>
                                    <Field
                                        name="email"
                                        type="email"
                                        placeholder="Email address"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                                    />
                                    <ErrorMessage className="text-xs text-red-600" name="email" component="small" />
                                </div>
                                <div>
                                    <Field
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                                    />
                                    <ErrorMessage className="text-xs text-red-600" name="password" component="small" />
                                </div>
                                <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
                                    {isSubmitting ? "Please wait..." : "Login"}
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    <p className="mt-6 text-center text-sm text-slate-600">
                        Don&apos;t have a developer account?{" "}
                        <Link href="/user/register" className="font-medium text-indigo-600 hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
