"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/lib/api";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Không tìm thấy mã xác thực (token). Vui lòng kiểm tra lại liên kết trong email.");
      return;
    }

    let active = true;
    async function performVerification() {
      try {
        await verifyEmail(token as string);
        if (!active) return;
        setStatus("success");
        setMessage("Tài khoản của bạn đã được xác thực thành công!");
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Xác thực thất bại. Vui lòng thử lại sau.");
      }
    }

    performVerification();

    return () => {
      active = false;
    };
  }, [token]);

  // Countdown timer for redirection on success
  useEffect(() => {
    if (status !== "success") return;
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, router]);

  return (
    <div className="verify-card">
      {status === "loading" && (
        <div className="verify-state loading">
          <div className="spinner"></div>
          <h2>Đang xác thực tài khoản</h2>
          <p>Vui lòng đợi trong giây lát, chúng tôi đang xử lý yêu cầu xác minh của bạn...</p>
        </div>
      )}

      {status === "success" && (
        <div className="verify-state success">
          <div className="icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2>Xác thực thành công!</h2>
          <p className="success-msg">{message}</p>
          <p className="redirect-note">
            Hệ thống sẽ chuyển hướng bạn về trang đăng nhập sau <strong>{countdown}</strong> giây...
          </p>
          <Link href="/login" className="verify-btn primary">
            Đăng nhập ngay
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="verify-state error">
          <div className="icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2>Xác thực thất bại</h2>
          <p className="error-msg">{message}</p>
          <div className="action-buttons">
            <Link href="/login" className="verify-btn secondary">
              Về trang đăng nhập
            </Link>
            <Link href="/" className="verify-btn ghost">
              Quay lại Trang chủ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <section className="auth-shell verify-shell">
      <div className="brand-header">
        <Link className="brand" href="/">
          <span className="brand-mark">DJ</span>
          DevJobs Vietnam
        </Link>
      </div>
      <div className="verify-container">
        <Suspense fallback={
          <div className="verify-card">
            <div className="verify-state loading">
              <div className="spinner"></div>
              <h2>Đang tải thông tin xác thực...</h2>
            </div>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </section>
  );
}
