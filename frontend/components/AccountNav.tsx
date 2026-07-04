"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredUser, logout, type User } from "@/lib/api";

export function AccountNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  // Chưa xác định xong (đang đọc localStorage) thì không hiện gì để tránh nhấp nháy
  if (user === undefined) {
    return <div className="header-actions" />;
  }

  if (!user) {
    return (
      <div className="header-actions">
        <Link className="ghost-button" href="/login">
          Đăng nhập
        </Link>
        <Link className="primary-button" href="/register">
          Đăng ký
        </Link>
      </div>
    );
  }

  return (
    <div className="header-actions account-nav">
      <Link className="ghost-button" href="/dashboard">
        {user.fullName}
        <span className="role-badge">
          {user.role === "company" ? "Nhà tuyển dụng" : "Ứng viên"}
        </span>
      </Link>
      <button type="button" className="secondary-button" onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  );
}