"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authRequest } from "@/lib/api";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("loading");
    setMessage("");

    try {
      await authRequest(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        fullName: String(form.get("fullName") || ""),
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
      });
      setStatus("success");
      setMessage(mode === "login" ? "Dang nhap thanh cong." : "Dang ky tai khoan thanh cong.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Da co loi xay ra.");
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
          <p className="eyebrow">{isRegister ? "Bat dau ho so moi" : "Tro lai lam viec"}</p>
          <h1>{isRegister ? "Tao tai khoan ung vien hoac nha tuyen dung." : "Dang nhap de quan ly ho so va viec da luu."}</h1>
          <p>
            Tai khoan giup ung vien theo doi viec da ung tuyen, con nha tuyen dung co the dang tin va quan ly pipeline.
          </p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{isRegister ? "Dang ky" : "Dang nhap"}</h2>
          {isRegister && (
            <label>
              Ho ten
              <input name="fullName" placeholder="Nguyen Van A" required minLength={5} />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Mat khau
            <input name="password" type="password" placeholder="Toi thieu 8 ky tu" required minLength={8} />
          </label>
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Dang xu ly..." : isRegister ? "Tao tai khoan" : "Dang nhap"}
          </button>
          {message && <p className={`form-message ${status}`}>{message}</p>}
          <p className="switch-auth">
            {isRegister ? "Da co tai khoan?" : "Chua co tai khoan?"}{" "}
            <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Dang nhap" : "Dang ky"}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
