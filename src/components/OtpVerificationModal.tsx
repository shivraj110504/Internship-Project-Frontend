import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface OtpVerificationModalProps {
    userId: string;
    language: string;
    onVerify: () => void;
    onClose: () => void;
}

const langNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    hi: 'Hindi',
    pt: 'Portuguese',
    zh: 'Chinese',
    fr: 'French',
};

const OtpVerificationModal = ({ userId, language, onVerify, onClose }: OtpVerificationModalProps) => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'request' | 'verify'>('request');
    const [method, setMethod] = useState<'email' | 'mobile'>('email');

    const displayName = langNames[language] || language;

    const requestOtp = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/send-language-otp`, {
                userId,
                language // Now passing the code
            });
            toast.success(res.data.message);
            setMethod(res.data.method);
            setStep('verify');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async () => {
        setIsLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify-language-otp`, {
                userId,
                otp
            });
            toast.success("Verified! Switching language...");
            onVerify();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Verify Identity</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {step === 'request' ? (
                        <div className="text-center">
                            <p className="text-gray-600 mb-6">
                                To switch to <strong>{displayName}</strong>, we need to verify your identity.
                                An OTP will be sent to your {language.toLowerCase() === 'fr' ? 'registered email' : 'mobile number'}.
                            </p>
                            <button
                                onClick={requestOtp}
                                disabled={isLoading}
                                className="w-full py-2.5 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition disabled:opacity-50"
                            >
                                {isLoading ? "Sending..." : "Send OTP"}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-600 mb-4 text-center">
                                Enter the 6-digit OTP sent to your {method}.
                            </p>
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full text-center text-2xl tracking-[1em] font-bold py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mb-6"
                            />
                            <button
                                onClick={verifyOtp}
                                disabled={isLoading || otp.length !== 6}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {isLoading ? "Verifying..." : "Verify & Switch"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OtpVerificationModal;
