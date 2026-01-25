// Training/stackoverflow/stack/src/pages/subscription/cancel.tsx

import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SubscriptionCancel() {
  const { t } = useTranslation();
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
            <CardTitle className="text-3xl">{t("payment_cancel.title")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-gray-600 text-lg">
              {t("payment_cancel.desc")}
            </p>

            <p className="text-sm text-gray-500">
              {t("payment_cancel.issue_desc")}
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => router.push("/subscription")}>
                {t("payment_cancel.view_plans_btn")}
              </Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                {t("payment_cancel.back_home_btn")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Mainlayout>
  );
}