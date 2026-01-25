// Training/stackoverflow/stack/src/pages/subscription/index.tsx

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Rocket, AlertCircle } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  const PLANS = [
    {
      name: t("subscription.plans.free.name"),
      price: "₹0",
      plan: "FREE",
      limit: t("subscription.plans.free.limit"),
      icon: Zap,
      features: t("subscription.plans.free.features", { returnObjects: true }),
      color: "bg-gray-100 text-gray-800",
      buttonText: t("subscription.plans.free.button"),
      disabled: true,
    },
    {
      name: t("subscription.plans.bronze.name"),
      price: "₹100",
      plan: "BRONZE",
      limit: t("subscription.plans.bronze.limit"),
      icon: Zap,
      features: t("subscription.plans.bronze.features", { returnObjects: true }),
      color: "bg-orange-100 text-orange-800",
      buttonText: t("subscription.plans.bronze.button"),
    },
    {
      name: t("subscription.plans.silver.name"),
      price: "₹300",
      plan: "SILVER",
      limit: t("subscription.plans.silver.limit"),
      icon: Crown,
      features: t("subscription.plans.silver.features", { returnObjects: true }),
      color: "bg-gray-200 text-gray-800",
      buttonText: t("subscription.plans.silver.button"),
      popular: true,
    },
    {
      name: t("subscription.plans.gold.name"),
      price: "₹1000",
      plan: "GOLD",
      limit: t("subscription.plans.gold.limit"),
      icon: Rocket,
      features: t("subscription.plans.gold.features", { returnObjects: true }),
      color: "bg-yellow-100 text-yellow-800",
      buttonText: t("subscription.plans.gold.button"),
    },
  ];
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchCurrentSubscription();
    checkPaymentTime();
  }, [user]);

  const checkPaymentTime = () => {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const hour = istTime.getHours();

    if (hour < 10 || hour >= 11) {
      setTimeWarning(true);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const { data } = await axiosInstance.get("/subscription/current");
      setCurrentSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleUpgrade = async (plan: string) => {
    if (plan === "FREE") return;

    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/subscription/create-checkout-session", { plan });

      // Simply redirect to the Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Invalid response from server");
        setLoading(false);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create checkout session";
      toast.error(message);

      if (error.response?.data?.allowedTime) {
        toast.info(`Payment window: ${error.response.data.allowedTime}`);
      }
      setLoading(false);
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("subscription.title")}</h1>
          <p className="text-gray-600 text-lg">
            {t("subscription.desc")}
          </p>

          {timeWarning && (
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                <div className="text-left">
                  <p className="font-semibold text-yellow-800">{t("subscription.payment_window_title")}</p>
                  <p className="text-yellow-700 text-sm">
                    {t("subscription.payment_window_desc")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentSubscription && (
            <div className="mt-6">
              <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
                {t("subscription.current_plan", { plan: currentSubscription.plan })}
                {currentSubscription.plan !== "FREE" && (
                  <span className="ml-2">
                    ({t("subscription.used_today", { asked: currentSubscription.questionsAskedToday, limit: currentSubscription.dailyQuestionLimit })})
                  </span>
                )}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((planItem) => {
            const Icon = planItem.icon;
            const isCurrent = currentSubscription?.plan === planItem.plan;

            return (
              <Card
                key={planItem.plan}
                className={`relative ${planItem.popular ? 'border-2 border-blue-500 shadow-lg' : ''}`}
              >
                {planItem.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">{t("subscription.most_popular")}</Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full ${planItem.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={32} />
                  </div>
                  <CardTitle className="text-2xl">{planItem.name}</CardTitle>
                  <CardDescription className="text-3xl font-bold text-gray-900 mt-2">
                    {planItem.price}
                    <span className="text-sm font-normal text-gray-500">{t("subscription.per_month")}</span>
                  </CardDescription>
                  <p className="text-sm text-gray-600 mt-2">{planItem.limit}</p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {(planItem.features as string[]).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(planItem.plan)}
                    disabled={loading || isCurrent || planItem.disabled || timeWarning}
                    variant={isCurrent ? "outline" : "default"}
                  >
                    {loading ? t("subscription.processing") : isCurrent ? t("subscription.plans.free.button") : planItem.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            onClick={() => router.push("/subscription/history")}
            className="mr-4"
          >
            {t("subscription.view_history")}
          </Button>
          {currentSubscription?.plan !== "FREE" && (
            <Button
              variant="destructive"
              onClick={() => router.push("/subscription/manage")}
            >
              {t("subscription.manage_sub")}
            </Button>
          )}
        </div>
      </div>
    </Mainlayout>
  );
}