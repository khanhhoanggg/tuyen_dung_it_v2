"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/api";

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Không tìm thấy mã xác thực (token) trên đường dẫn. Vui lòng kiểm tra lại liên kết trong email.");
    }
  }, [token]);

  // Countdown redirect to login on success
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    // Client-side regex check matching backend Joi logic
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (password.length < 8 || !passwordRegex.test(password)) {
      setStatus("error");
      setMessage("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, sềEvà ký tự đặc biệt.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await resetPassword({ token: token as string, password });
      setStatus("success");
      setMessage("Đặt lại mật khẩu thành công! Mật khẩu mới của bạn đã được cập nhật.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  }

  if (status === "error" && !token) {
    return (
      <div className="auth-form" style={{ padding: "28px", display: "grid", gap: "18px" }}>
        <h2>Lỗi liên kết</h2>
        <p className="form-message error">{message}</p>
        <p className="switch-auth">
          <Link href="/forgot-password">Yêu cầu liên kết mới</Link>
        </p>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Đặt lại mật khẩu</h2>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "0 0 10px 0" }}>
        Tạo mật khẩu mới cho tài khoản của bạn:
      </p>

      <label>
        Mật khẩu mới
        <div style={{ position: "relative", width: "100%" }}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Tối thiểu 8 ký tự, có viết hoa, sềE ký tự đặc biệt"
            required
            minLength={8}
            disabled={status === "loading" || status === "success"}
            style={{ width: "100%", paddingRight: "44px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={status === "loading" || status === "success"}
            aria-label={showPassword ? "An mat khau" : "Hien thi mat khau"}
            title={showPassword ? "An mat khau" : "Hien thi mat khau"}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: status === "loading" || status === "success" ? "not-allowed" : "pointer",
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </label>

      <label>
        Xác nhận mật khẩu mới
        <div style={{ position: "relative", width: "100%" }}>
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu mới"
            required
            minLength={8}
            disabled={status === "loading" || status === "success"}
            style={{ width: "100%", paddingRight: "44px" }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            disabled={status === "loading" || status === "success"}
            aria-label={showConfirmPassword ? "An mat khau xac nhan" : "Hien thi mat khau xac nhan"}
            title={showConfirmPassword ? "An mat khau xac nhan" : "Hien thi mat khau xac nhan"}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: status === "loading" || status === "success" ? "not-allowed" : "pointer",
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {showConfirmPassword ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </label>

      <button type="submit" disabled={status === "loading" || status === "success" || !token}>
        {status === "loading" ? "Đang xử lý..." : "Cập nhật mật khẩu"}
      </button>

      {message && <p className={`form-message ${status}`}>{message}</p>}

      {status === "success" && (
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", margin: 0 }}>
          HềEthống sẽ chuyển hướng bạn vềEtrang đăng nhập sau <strong>{countdown}</strong> giây...
        </p>
      )}

      <p className="switch-auth">
        <Link href="/login">Quay lại Đăng nhập</Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="auth-shell">
      <Link className="brand" href="/">
        <span className="brand-mark">DJ</span>
        DevJobs Vietnam
      </Link>
      <div className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Khôi phục quyền truy cập</p>
          <h1>Mật khẩu mới</h1>
          <p>
            Vui lòng nhập mật khẩu mới phức tạp đềEbảo mật tài khoản của bạn. Mật khẩu phải bao gồm chữ hoa, chữ thường, sềEvà ký tự đặc biệt.
          </p>
        </div>
        <Suspense fallback={
          <div className="auth-form" style={{ padding: "28px", textAlign: "center" }}>
            <h2>Đang tải trang...</h2>
          </div>
        }>
          <ResetPasswordFormContent />
        </Suspense>
      </div>
    </section>
  );
}
