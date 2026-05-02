import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/app";

export const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        return navigate("/auth/login", { replace: true });
      }

      try {
        const res = await api.get(`/auth/verify-email/${token}`);

        setStatus("success");

        // backend message
        toast.success(res.data?.message || "Email verified successfully");

        // immediate redirect after success
        navigate("/auth/login", { replace: true });
      } catch (error: any) {
        setStatus("error");

        const message =
          error?.response?.data?.message || "Invalid or expired link";

        toast.error(message);

        // redirect immediately on failure as well
        navigate("/auth/login", { replace: true });
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="max-w-4xl mx-auto text-center my-4">
      {status === "loading" && <h2>Verifying your email...</h2>}
      {status === "success" && (
        <h2>Verification successful. Redirecting Login page...</h2>
      )}
      {status === "error" && (
        <h2>Verification failed. Redirecting to Home page...</h2>
      )}
    </div>
  );
};
