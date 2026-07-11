"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, register, type Role } from "@/lib/api";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<Role>("candidate");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("loading");
    setMessage("");

    try {
      if (mode === "login") {
        const result = await login({
          email: String(form.get("email") || ""),
          password: String(form.get("password") || ""),
        });
        setStatus("success");
        setMessage("Đăng nhập thành công.");
        router.push(result.user.role === "company" ? "/dashboard" : "/");
        router.refresh();
      } else {
        await register({
          fullName: String(form.get("fullName") || ""),
          email: String(form.get("email") || ""),
          password: String(form.get("password") || ""),
          role,
        });
        setStatus("success");
        setMessage("Đăng ký tài khoản thành công. Vui lòng kiểm tra email của bạn để xác minh tài khoản trước khi đăng nhập.");
        setTimeout(() => router.push("/login"), 5000);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Đã có lỗi xảy ra.");
    }
  }

  const isRegister = mode === "register";

  return (
    <section className="auth-shell">
      <Link className="brand" href="/">
        <span className="brand-mark">DJ</span>
        DevJobs Vietnam
      </Link>
      <div className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">{isRegister ? "Bắt đầu hồ sơ mới" : "Trở lại làm việc"}</p>
          <h1>
            {isRegister
              ? "Tạo tài khoản ứng viên hoặc nhà tuyển dụng."
              : "Đăng nhập để quản lý hồ sơ và việc đã lưu."}
          </h1>
          <p>
            Tài khoản giúp ứng viên theo dõi việc đã ứng tuyển, còn nhà tuyển
            dụng có thể đăng tin và quản lý pipeline.
          </p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{isRegister ? "Đăng ký" : "Đăng nhập"}</h2>
          {isRegister && (
            <label>
              Họ tên
              <input name="fullName" placeholder="Nguyễn Văn A" required minLength={5} />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Mật khẩu</span>
              {!isRegister && (
                <Link href="/forgot-password" style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--signal)" }}>
                  Quên mật khẩu?
                </Link>
              )}
            </div>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 8 ký tự"
                required
                minLength={8}
                style={{ width: "100%", paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
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
          {isRegister && (
            <div className="role-select">
              <span>Bạn là</span>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="candidate"
                  checked={role === "candidate"}
                  onChange={() => setRole("candidate")}
                />
                Ứng viên
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="company"
                  checked={role === "company"}
                  onChange={() => setRole("company")}
                />
                Nhà tuyển dụng
              </label>
            </div>
          )}
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          </button>
          {message && <p className={`form-message ${status}`}>{message}</p>}
          <p className="switch-auth">
            {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
            <Link href={isRegister ? "/login" : "/register"}>
              {isRegister ? "Đăng nhập" : "Đăng ký"}
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}