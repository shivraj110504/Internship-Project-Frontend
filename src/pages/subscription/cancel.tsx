// Training/stackoverflow/stack/src/pages/subscription/cancel.tsx

import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function SubscriptionCancel() {
  const router = useRouter();

  return (
    <Mainlayout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="text-red-600" size={48} />
              </div>
            </div>
            <CardTitle className="text-3xl">Payment Cancelled</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-gray-600 text-lg">
              Your payment was cancelled. No charges were made to your account.
            </p>

            <p className="text-sm text-gray-500">
              If you encountered any issues during checkout, please contact our support team.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => router.push("/subscription")}>
                View Plans Again
              </Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Mainlayout>
  );
}