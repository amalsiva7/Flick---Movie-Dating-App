import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-hot-toast";

const MagicLink = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = searchParams.get("token");
      if (!token) {
        toast.error("Invalid or missing verification token.");
        navigate("/otp");
        return;
      }

      try {
        const response = await axiosInstance.get("users/verify-magic-link/", {
          params: { token },
        });

        if (response.status === 200) {
            console.log("MAFIC LINK VEIFICATION SUCCESS*************")
          toast.success("Account verified successfully!");
          navigate("/login");
        }
      } catch (error) {
        const { response } = error;
        if (response) {
          const { status, data } = response;
          if (status === 404) {
            toast.error(data.error || "Verification record not found.");
          } else if (status === 410) {
            toast.error(data.error || "Verification token has expired.");
            navigate("/resend-verification-link");
          } else {
            toast.error(data.error || "An unexpected error occurred.");
          }
        } else {
          toast.error("Network error. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <p className="text-lg text-gray-600">Verifying your account...</p>
      ) : (
        <p className="text-lg text-gray-600">Redirecting...</p>
      )}
    </div>
  );
};

export default MagicLink;
