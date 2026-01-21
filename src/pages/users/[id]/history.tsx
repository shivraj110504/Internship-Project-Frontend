// users/[id]/history.tsx

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import Mainlayout from "@/layout/Mainlayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Laptop, Smartphone, Tablet, Monitor, Info } from "lucide-react";
import moment from "moment";

const LoginHistoryPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { GetLoginHistory, user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            GetLoginHistory(id).then((data: any) => {
                setHistory(data);
                setLoading(false);
            });
        }
    }, [id, GetLoginHistory]);

    const getDeviceIcon = (type: any) => {
        switch (type?.toLowerCase()) {
            case "mobile":
                return <Smartphone className="w-4 h-4" />;
            case "tablet":
                return <Tablet className="w-4 h-4" />;
            default:
                return <Monitor className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: any) => {
        switch (status) {
            case "SUCCESS":
                return "text-green-600 bg-green-50 border-green-200";
            case "BLOCKED":
                return "text-red-600 bg-red-50 border-red-200";
            case "PENDING_OTP":
                return "text-orange-600 bg-orange-50 border-orange-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    if (loading) return <Mainlayout><div>Loading...</div></Mainlayout>;

    return (
        <Mainlayout>
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Login History</h1>
                    <p className="text-gray-600">
                        Monitor your account activity and the devices you use to access Stack Overflow.
                    </p>
                </div>

                <Card className="border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Device / Browser</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">IP Address</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Time</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Auth Method</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded text-gray-600">
                                                    {getDeviceIcon(log.deviceType)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 capitalize">
                                                        {log.deviceType} • {log.os}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{log.browser}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                            {log.ip}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {moment(log.loginTime).format("MMM DD, YYYY")}
                                            <p className="text-xs text-gray-400">
                                                {moment(log.loginTime).format("hh:mm A")}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium px-2 py-1 rounded border bg-gray-50 text-gray-600">
                                                {log.authMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(log.status)}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {history.length === 0 && (
                            <div className="py-12 text-center text-gray-500 italic">
                                No login history found.
                            </div>
                        )}
                    </div>
                </Card>

                <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="text-xs text-blue-700 leading-relaxed">
                        <p className="font-semibold mb-1">Security Tip</p>
                        If you see any suspicious login activity on your account, please change your password immediately and contact support. We track your device data to help keep your account secure.
                    </div>
                </div>
            </div>
        </Mainlayout>
    );
};

export default LoginHistoryPage;
