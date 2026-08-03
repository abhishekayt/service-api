"use client";

import { useEffect, useState } from "react";
import { User, KeyRound, Save, ShieldAlert, BadgeInfo } from "lucide-react";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/userSlice";

export default function UserSettingsPage() {
    const dispatch = useAppDispatch();
    
    // Profile form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);

    // Password form states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Fetch current profile info on mount
    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperUser.getData("/profile");
            if (data?.status && data?.data) {
                setName(data.data.name || "");
                setEmail(data.data.email || "");
                setMobile(data.data.mobile || "");
            }
        })();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            toast.error("Name and email are required fields");
            return;
        }

        setProfileLoading(true);
        try {
            const { data } = await AxiosHelperUser.putData("/profile", {
                name,
                email,
                mobile: mobile.trim() || undefined
            });

            if (data?.status) {
                toast.success(data.message || "Profile updated successfully!");
                // Update redux store with new details
                dispatch(updateUser({ name, email, mobile }));
            } else {
                toast.error(data?.message || "Failed to update profile");
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            toast.error("All password fields are required");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long");
            return;
        }

        setPasswordLoading(true);
        try {
            const { data } = await AxiosHelperUser.putData("/profile/password", {
                currentPassword,
                newPassword
            });

            if (data?.status) {
                toast.success("Password changed successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(data?.message || "Failed to change password");
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Account Settings
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Update your developer profile details and security passwords.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Settings Card */}
                <Card className="border-slate-200/80 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-500" />
                            Profile Details
                        </CardTitle>
                        <CardDescription>Update your contact and application details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            {/* Email Address */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="developer@example.com"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            {/* Mobile Number */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Mobile Number</span>
                                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                                </label>
                                <input
                                    type="text"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="+1234567890"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="gradient"
                                disabled={profileLoading}
                                className="w-full gap-2 mt-2"
                            >
                                <Save className="h-4 w-4" />
                                {profileLoading ? "Saving Details..." : "Save Profile"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Password / Security Card */}
                <Card className="border-slate-200/80 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-indigo-500" />
                            Change Password
                        </CardTitle>
                        <CardDescription>Update your password to secure your account access.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {/* Current Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            {/* New Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="gradient"
                                disabled={passwordLoading}
                                className="w-full gap-2 mt-2"
                            >
                                <Save className="h-4 w-4" />
                                {passwordLoading ? "Changing Password..." : "Change Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
