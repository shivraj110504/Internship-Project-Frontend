// Training/stackoverflow/stack/src/pages/subscription/history.tsx

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { useTranslation } from "react-i18next";

export default function PaymentHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchPaymentHistory();
  }, [user]);

  const fetchPaymentHistory = async () => {
    try {
      const { data } = await axiosInstance.get("/subscription/payment-history");
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2" size={18} />
            {t("payment_history.back")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("payment_history.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">{t("payment_history.loading")}</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t("payment_history.no_history")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">{t("payment_history.table.date")}</th>
                      <th className="text-left py-3 px-4">{t("payment_history.table.plan")}</th>
                      <th className="text-left py-3 px-4">{t("payment_history.table.amount")}</th>
                      <th className="text-left py-3 px-4">{t("payment_history.table.status")}</th>
                      <th className="text-left py-3 px-4">{t("payment_history.table.invoice")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(payment.paymentDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{payment.plan}</Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          ₹{(payment.amount / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {payment.invoiceUrl ? (
                            <a
                              href={payment.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Download size={16} />
                              {t("payment_history.table.download")}
                            </a>
                          ) : (
                            <span className="text-gray-400">{t("payment_history.table.na")}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Mainlayout>
  );
}