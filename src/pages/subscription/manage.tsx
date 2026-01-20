// Training/stackoverflow/stack/src/pages/subscription/manage.tsx

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";

export default function ManageSubscription() {
  const { user } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data } = await axiosInstance.get("/subscription/current");
      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.")) {
      return;
    }

    setCancelling(true);
    try {
      const { data } = await axiosInstance.post("/subscription/cancel");
      toast.success(data.message || "Subscription cancelled successfully");
      setSubscription(data.subscription);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to cancel subscription";
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Mainlayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Mainlayout>
    );
  }

  if (!subscription || subscription.plan === "FREE") {
    return (
      <Mainlayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">You don't have an active subscription to manage.</p>
              <Button onClick={() => router.push("/subscription")}>
                View Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2" size={18} />
            Back
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Manage Subscription</h1>

        <div className="grid gap-6">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Plan</span>
                <Badge className="text-lg px-4 py-1">
                  {subscription.plan}
                </Badge>
              </CardTitle>
              <CardDescription>
                {subscription.cancelAtPeriodEnd ? (
                  <span className="text-orange-600 font-semibold">
                    Cancels at end of billing period
                  </span>
                ) : (
                  "Your active subscription details"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Daily Question Limit</p>
                    <p className="font-semibold">
                      {subscription.dailyQuestionLimit === 999999 
                        ? "Unlimited" 
                        : subscription.dailyQuestionLimit}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Questions Used Today</p>
                    <p className="font-semibold">
                      {subscription.questionsAskedToday} / {subscription.dailyQuestionLimit === 999999 ? "∞" : subscription.dailyQuestionLimit}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Billing Period Ends</p>
                    <p className="font-semibold">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={subscription.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {subscription.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancel Subscription Card */}
          {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle size={24} />
                  Cancel Subscription
                </CardTitle>
                <CardDescription>
                  You can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Subscription"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Cancelled Subscription Info */}
          {subscription.cancelAtPeriodEnd && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-orange-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-1">Subscription Cancelled</h3>
                    <p className="text-orange-800 text-sm mb-3">
                      Your subscription will end on{" "}
                      <strong>
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>
                      . You'll continue to have access until then.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/subscription")}
                      className="border-orange-600 text-orange-600 hover:bg-orange-100"
                    >
                      Reactivate Subscription
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 flex-wrap">
              <Button
                variant="outline"
                onClick={() => router.push("/subscription")}
              >
                View All Plans
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/subscription/history")}
              >
                Payment History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Mainlayout>
  );
}