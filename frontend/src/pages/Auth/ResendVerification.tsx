import api from "@/services/app";
import { useState } from "react";
import toast from "react-hot-toast";

export const ResendVerification = () => {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    try {
      setLoading(true);

      const res = await api.post("/auth/resend-verification");

      toast.success(res.data.message || "Verification email sent");

      // start cooldown (2 minutes fallback)
      startCooldown(120);
    } catch (error: any) {
      const remaining = error?.response?.data?.remainingTime;

      if (remaining) {
        startCooldown(remaining);
        toast.error(`Wait ${remaining}s before retrying`);
      } else {
        toast.error("Failed to resend email");
      }
    } finally {
      setLoading(false);
    }
  };

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <button onClick={handleResend} disabled={loading || cooldown > 0}>
      {cooldown > 0
        ? `Resend in ${cooldown}s`
        : loading
          ? "Sending..."
          : "Resend Verification Email"}
    </button>
  );
};
