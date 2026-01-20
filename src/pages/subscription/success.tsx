import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { sessionId } = router.query;
  const { refreshUser } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (sessionId) {
      refreshUser();
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sessionId]);

  return (
    <Mainlayout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={48} />
              </div>
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-gray-600">
              Your subscription has been activated successfully.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Mail className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="text-left">
                <p className="font-semibold text-blue-800">Invoice Sent</p>
                <p className="text-blue-700 text-sm">
                  We've sent an invoice with your subscription details to your registered email address.
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Redirecting to home page in {countdown} seconds...
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/")}>
                Go to Home
              </Button>
              <Button variant="outline" onClick={() => router.push("/subscription")}>
                View Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Mainlayout>
  );
}