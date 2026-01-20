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
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    plan: "FREE",
    limit: "1 question/day",
    icon: Zap,
    features: ["1 question per day", "Community support", "Basic features"],
    color: "bg-gray-100 text-gray-800",
    buttonText: "Current Plan",
    disabled: true,
  },
  {
    name: "Bronze",
    price: "₹100",
    plan: "BRONZE",
    limit: "5 questions/day",
    icon: Zap,
    features: ["5 questions per day", "Priority support", "Email notifications", "No ads"],
    color: "bg-orange-100 text-orange-800",
    buttonText: "Upgrade to Bronze",
  },
  {
    name: "Silver",
    price: "₹300",
    plan: "SILVER",
    limit: "10 questions/day",
    icon: Crown,
    features: ["10 questions per day", "Premium support", "Advanced analytics", "Priority answers"],
    color: "bg-gray-200 text-gray-800",
    buttonText: "Upgrade to Silver",
    popular: true,
  },
  {
    name: "Gold",
    price: "₹1000",
    plan: "GOLD",
    limit: "Unlimited questions",
    icon: Rocket,
    features: ["Unlimited questions", "VIP support", "Custom badges", "All features"],
    color: "bg-yellow-100 text-yellow-800",
    buttonText: "Upgrade to Gold",
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
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
      
      const stripe = await stripePromise;
      if (!stripe) {
        toast.error("Stripe failed to load");
        return;
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create checkout session";
      toast.error(message);
      
      if (error.response?.data?.allowedTime) {
        toast.info(`Payment window: ${error.response.data.allowedTime}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-600 text-lg">
            Upgrade to ask more questions and unlock premium features
          </p>
          
          {timeWarning && (
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                <div className="text-left">
                  <p className="font-semibold text-yellow-800">Payment Time Window</p>
                  <p className="text-yellow-700 text-sm">
                    Payments are only allowed between <strong>10:00 AM - 11:00 AM IST</strong>. 
                    Please return during this time to upgrade your subscription.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentSubscription && (
            <div className="mt-6">
              <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
                Current Plan: {currentSubscription.plan} 
                {currentSubscription.plan !== "FREE" && (
                  <span className="ml-2">
                    ({currentSubscription.questionsAskedToday}/{currentSubscription.dailyQuestionLimit} used today)
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
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full ${planItem.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={32} />
                  </div>
                  <CardTitle className="text-2xl">{planItem.name}</CardTitle>
                  <CardDescription className="text-3xl font-bold text-gray-900 mt-2">
                    {planItem.price}
                    <span className="text-sm font-normal text-gray-500">/month</span>
                  </CardDescription>
                  <p className="text-sm text-gray-600 mt-2">{planItem.limit}</p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {planItem.features.map((feature, idx) => (
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
                    {isCurrent ? "Current Plan" : planItem.buttonText}
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
            View Payment History
          </Button>
          {currentSubscription?.plan !== "FREE" && (
            <Button
              variant="destructive"
              onClick={() => router.push("/subscription/manage")}
            >
              Manage Subscription
            </Button>
          )}
        </div>
      </div>
    </Mainlayout>
  );
}