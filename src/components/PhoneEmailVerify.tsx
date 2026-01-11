// components/PhoneEmailVerify.tsx
import React, { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface PhoneEmailVerifyProps {
  userId: string; // Add userId prop for backend linking
  onSuccess?: () => void;
}

const PhoneEmailVerify: React.FC<PhoneEmailVerifyProps> = ({ userId, onSuccess }) => {
  useEffect(() => {
    // Load the phone.email script dynamically
    const script = document.createElement("script");
    script.src = "https://www.phone.email/sign_in_button_v1.js";
    script.async = true;
    document.body.appendChild(script);

    // Define global listener after script loads
    (window as any).phoneEmailListener = async (userObj: any) => {
      const { user_json_url } = userObj;

      if (!user_json_url) {
        toast.error("Phone verification failed: missing URL");
        return;
      }

      try {
        // Send JSON URL + userId to backend to verify & link phone/email
        const res = await axios.post("/api/auth/verify-phone-email", {
          user_json_url,
          userId,
        });

        if (res.status === 200) {
          toast.success("Phone verified successfully!");
          if (onSuccess) onSuccess();
        }
      } catch (err: any) {
        console.error("Phone verification error:", err);
        toast.error(err?.response?.data?.message || "Phone verification failed");
      }
    };

    return () => {
      document.body.removeChild(script);
      delete (window as any).phoneEmailListener;
    };
  }, [userId, onSuccess]);

  return (
    <div id="signInContainer" className="w-full">
      <div
        className="pe_signin_button"
        data-client-id={process.env.NEXT_PUBLIC_PHONE_EMAIL_CLIENT_ID}
      ></div>
    </div>
  );
};

export default PhoneEmailVerify;
