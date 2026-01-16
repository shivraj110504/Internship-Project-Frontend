import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [method, setMethod] = useState<"email" | "phone">("email");
    const [generatedPassword, setGeneratedPassword] = useState("");
    const { sendForgotPasswordEmail, resetPasswordWithOtp, forgotPasswordByPhone, loading } = useAuth();
    const router = useRouter();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }
        try {
            const data = await sendForgotPasswordEmail(email);
            if (data.newPassword) {
                setGeneratedPassword(data.newPassword);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleOtpReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !otp) {
            toast.error("Enter phone and OTP");
            return;
        }
        try {
            const data = await resetPasswordWithOtp({ phone, otp });
            if (data.newPassword) {
                setGeneratedPassword(data.newPassword);
                toast.success("Password reset successful");
            }
        } catch (err) {
            // Error toast handled by context
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="flex items-center justify-center mb-4">
                        <div className="w-8 h-8 bg-orange-500 rounded mr-2 flex items-center justify-center">
                            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                                <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
                            </div>
                        </div>
                        <span className="text-xl font-bold text-gray-800">
                            stack<span className="font-normal">overflow</span>
                        </span>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Forgot Password</CardTitle>
                        <CardDescription>
                            Reset your password using SMS OTP
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!generatedPassword ? (
                            <>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${method === "email"
                                            ? "bg-white shadow-sm text-blue-600"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                        onClick={() => setMethod("email")}
                                    >
                                        Email
                                    </button>
                                    <button
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${method === "phone"
                                            ? "bg-white shadow-sm text-blue-600"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                        onClick={() => setMethod("phone")}
                                    >
                                        Phone
                                    </button>
                                </div>

                                {method === "email" ? (
                                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            disabled={loading}
                                        >
                                            {loading ? "Sending..." : "Send OTP to Mobile"}
                                        </Button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleOtpReset} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="e.g. 9876543210"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                type="button"
                                                onClick={async () => {
                                                    if (!phone) {
                                                        toast.error("Enter phone number");
                                                        return;
                                                    }
                                                    try {
                                                        await forgotPasswordByPhone(phone);
                                                    } catch (e) {}
                                                }}
                                                className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300"
                                                disabled={loading}
                                            >
                                                {loading ? "Sending..." : "Send OTP"}
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="otp">OTP</Label>
                                            <Input
                                                id="otp"
                                                type="text"
                                                placeholder="6-digit OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            disabled={loading}
                                        >
                                            {loading ? "Verifying..." : "Reset Password"}
                                        </Button>
                                    </form>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4 py-4">
                                <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                                    <div className="mb-4">
                                        <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-green-800 font-semibold text-lg mb-2">
                                        Password Reset Successful!
                                    </p>
                                    <p className="text-green-700 text-sm break-all">
                                        Your new password is: <span className="font-mono font-semibold">{generatedPassword}</span>
                                    </p>
                                </div>
                                <Button
                                    onClick={() => router.push("/auth")}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    Go to Login
                                </Button>
                            </div>
                        )}

                        <div className="text-center text-sm">
                            Remember your password?{" "}
                            <Link href="/auth" className="text-blue-600 hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
