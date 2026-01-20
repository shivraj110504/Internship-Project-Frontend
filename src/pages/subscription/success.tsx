// Training/stackoverflow/stack/src/pages/subscription/success.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (session_id) {
      // Start countdown to redirect
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
  }, [session_id, router]);

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
            <p className="text-gray-600 text-lg">
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
              Redirecting to home page in <span className="font-bold text-gray-700">{countdown}</span> seconds...
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
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