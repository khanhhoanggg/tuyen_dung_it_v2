"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    
    setStatus("loading");
    setMessage("");

    try {
      await forgotPassword(email);
      setStatus("success");
      setMessage("Nếu email tồn tại trên hệ thống, một liên kết khôi phục mật khẩu mới đã được gửi. Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư rác).");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  }

  return (
    <section className="auth-shell">
      <Link className="brand" href="/">
        <span className="brand-mark">DJ</span>
        DevJobs Vietnam
      </Link>
      <div className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Khôi phục quyền truy cập</p>
          <h1>Quên mật khẩu?</h1>
          <p>
            Nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi một liên kết bảo mật để bạn có thể đặt lại mật khẩu mới cho tài khoản của mình.
          </p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Lấy lại mật khẩu</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "0 0 10px 0" }}>
            Điền email tài khoản của bạn bên dưới:
          </p>
          
          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" required disabled={status === "loading" || status === "success"} />
          </label>

          <button type="submit" disabled={status === "loading" || status === "success"}>
            {status === "loading" ? "Đang xử lý..." : "Gửi yêu cầu khôi phục"}
          </button>
          
          {message && <p className={`form-message ${status}`}>{message}</p>}
          
          <p className="switch-auth">
            <Link href="/login">
              Quay lại Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
