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
    const [method, setMethod] = useState<"email" | "phone">("email");
    const [generatedPassword, setGeneratedPassword] = useState("");
    const { sendForgotPasswordEmail, verifyPhoneEmail, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Define the phoneEmailListener function
        (window as any).phoneEmailListener = async (userObj: any) => {
            const { user_json_url } = userObj;
            try {
                const data = await verifyPhoneEmail({ user_json_url, resetPassword: true });
                if (data.newPassword) {
                    setGeneratedPassword(data.newPassword);
                    toast.success("Password reset successful!");
                }
            } catch (err) {
                console.error(err);
            }
        };
    }, [verifyPhoneEmail]);

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

    const loadPhoneScript = () => {
        const script = document.createElement("script");
        script.src = "https://www.phone.email/sign_in_button_v1.js";
        script.async = true;
        document.body.appendChild(script);
    };

    useEffect(() => {
        if (method === "phone") {
            loadPhoneScript();
        }
    }, [method]);

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
                            Choose a method to reset your password
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
                                            {loading ? "Sending..." : "Reset via Email"}
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="flex flex-col items-center space-y-4 py-4">
                                        <p className="text-sm text-gray-600 text-center">
                                            Verify your identity using your phone number to generate a
                                            new password.
                                        </p>
                                        <div id="signInContainer">
                                            <div
                                                className="pe_signin_button"
                                                data-client-id="11350679121622574492"
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4 py-4 text-center">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <p className="text-green-800 font-medium mb-1">
                                        Success! Your new password is:
                                    </p>
                                    <p className="text-2xl font-mono font-bold tracking-wider text-green-900 bg-white inline-block px-4 py-2 rounded shadow-inner mb-2">
                                        {generatedPassword}
                                    </p>
                                    <p className="text-xs text-green-700">
                                        Please copy this password and log in. You should change it
                                        in your profile settings immediately.
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
