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
import React, { useState } from "react";
import { toast } from "react-toastify";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [method, setMethod] = useState<"email" | "phone">("email");
    const [otpSent, setOtpSent] = useState(false);
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
            setOtpSent(true);
            if (data.hasPhone) {
                setPhone(data.phone || "");
            }
            toast.success("OTP sent! Check your email and/or phone.");
        } catch (err: any) {
            // Check for daily limit error
            if (err.response?.status === 429) {
                toast.error(err.response?.data?.message || "Daily limit reached");
            }
        }
    };

    const handlePhoneOtpRequest = async () => {
        if (!phone) {
            toast.error("Enter phone number");
            return;
        }
        try {
            await forgotPasswordByPhone(phone);
            setOtpSent(true);
        } catch (err: any) {
            // Check for daily limit error
            if (err.response?.status === 429) {
                toast.error(err.response?.data?.message || "Daily limit reached");
            }
        }
    };

    const handleOtpReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!otp) {
            toast.error("Enter OTP");
            return;
        }

        // Use phone or email based on method
        const resetData = method === "phone" && phone 
            ? { phone, otp } 
            : { email, otp };

        try {
            const data = await resetPasswordWithOtp(resetData);
            if (data.newPassword) {
                setGeneratedPassword(data.newPassword);
                toast.success("Password reset successful!");
            }
        } catch (err: any) {
            // Error handled by context
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
                            Reset your password using email or phone number
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!generatedPassword ? (
                            <>
                                {/* Method Selector */}
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                            method === "email"
                                                ? "bg-white shadow-sm text-blue-600"
                                                : "text-gray-500 hover:text-gray-700"
                                        }`}
                                        onClick={() => {
                                            setMethod("email");
                                            setOtpSent(false);
                                            setOtp("");
                                        }}
                                    >
                                        Email
                                    </button>
                                    <button
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                            method === "phone"
                                                ? "bg-white shadow-sm text-blue-600"
                                                : "text-gray-500 hover:text-gray-700"
                                        }`}
                                        onClick={() => {
                                            setMethod("phone");
                                            setOtpSent(false);
                                            setOtp("");
                                        }}
                                    >
                                        Phone
                                    </button>
                                </div>

                                {/* Email Method */}
                                {method === "email" && !otpSent && (
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
                                            {loading ? "Sending..." : "Send OTP to Email"}
                                        </Button>
                                        <p className="text-xs text-gray-500 text-center">
                                            OTP will be sent to your registered email address
                                        </p>
                                    </form>
                                )}

                                {/* Phone Method - Send OTP */}
                                {method === "phone" && !otpSent && (
                                    <div className="space-y-4">
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
                                        <Button
                                            type="button"
                                            onClick={handlePhoneOtpRequest}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            disabled={loading}
                                        >
                                            {loading ? "Sending..." : "Send OTP to Phone"}
                                        </Button>
                                        <p className="text-xs text-gray-500 text-center">
                                            OTP will be sent to your registered mobile number via SMS
                                        </p>
                                    </div>
                                )}

                                {/* OTP Verification Form */}
                                {otpSent && (
                                    <form onSubmit={handleOtpReset} className="space-y-4">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                            <p className="text-sm text-green-800">
                                                ✅ OTP sent successfully! Check your {method === "email" ? "email" : "phone"}.
                                            </p>
                                        </div>

                                        {method === "phone" && (
                                            <div className="space-y-2">
                                                <Label htmlFor="phone-display">Phone Number</Label>
                                                <Input
                                                    id="phone-display"
                                                    type="tel"
                                                    value={phone}
                                                    disabled
                                                    className="bg-gray-100"
                                                />
                                            </div>
                                        )}

                                        {method === "email" && (
                                            <div className="space-y-2">
                                                <Label htmlFor="email-display">Email Address</Label>
                                                <Input
                                                    id="email-display"
                                                    type="email"
                                                    value={email}
                                                    disabled
                                                    className="bg-gray-100"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="otp">Enter OTP</Label>
                                            <Input
                                                id="otp"
                                                type="text"
                                                placeholder="6-digit OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                maxLength={6}
                                                required
                                            />
                                            <p className="text-xs text-gray-500">
                                                OTP is valid for 5 minutes
                                            </p>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            disabled={loading || otp.length !== 6}
                                        >
                                            {loading ? "Verifying..." : "Reset Password"}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setOtpSent(false);
                                                setOtp("");
                                            }}
                                        >
                                            ← Back
                                        </Button>
                                    </form>
                                )}
                            </>
                        ) : (
                            /* Success State - Show New Password */
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
                                    <div className="bg-white rounded-lg p-4 mb-4">
                                        <p className="text-sm text-gray-600 mb-2">Your new password is:</p>
                                        <p className="text-2xl font-mono font-bold text-gray-800 break-all select-all">
                                            {generatedPassword}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            (Click to copy)
                                        </p>
                                    </div>
                                    <p className="text-sm text-green-700">
                                        Save this password in a secure place. You can change it after logging in.
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

                        {/* Back to Login Link */}
                        {!generatedPassword && (
                            <div className="text-center text-sm">
                                Remember your password?{" "}
                                <Link href="/auth" className="text-blue-600 hover:underline">
                                    Back to Login
                                </Link>
                            </div>
                        )}

                        {/* Daily Limit Warning */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-xs text-yellow-800">
                                ⚠️ You can only request password reset once per day
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;