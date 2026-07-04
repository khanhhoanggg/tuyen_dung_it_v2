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
        setMessage("Đăng ký tài khoản thành công. Bạn có thể đăng nhập ngay.");
        setTimeout(() => router.push("/login"), 1000);
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
            Mật khẩu
            <input name="password" type="password" placeholder="Tối thiểu 8 ký tự" required minLength={8} />
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