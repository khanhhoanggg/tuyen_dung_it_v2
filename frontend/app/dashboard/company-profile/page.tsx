"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyCompanyProfile,
  getStoredUser,
  type CompanyProfile,
  type User,
} from "@/lib/api";
import { CompanyProfileForm } from "@/components/CompanyProfileForm";

export default function CompanyProfilePage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    if (storedUser?.role === "company") {
      getMyCompanyProfile()
        .then((data) => setProfile(data))
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Không thể tải hồ sơ công ty");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (user === undefined || loading) {
    return (
      <main className="dashboard-page">
        <p className="form-message">Đang tải...</p>
      </main>
    );
  }

  if (!user || user.role !== "company") {
    return (
      <main className="dashboard-page">
        <div className="dashboard-content">
          <p className="eyebrow">Hồ sơ công ty</p>
          <h1>Chỉ nhà tuyển dụng mới có thể cài đặt hồ sơ này</h1>
          <Link className="primary-button" href="/dashboard">
            Quay lại Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">DJ</span>
          DevJobs
        </Link>
        <nav>
          <a href="/dashboard#overview">Tổng quan</a>
          <a href="/dashboard#jobs">Tin đăng</a>
          <Link className="active" href="/dashboard/company-profile">
            Hồ sơ công ty
          </Link>
          <Link href="/dashboard/company-locations">Địa điểm làm việc</Link>
        </nav>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Xin chào, {user.fullName}</p>
            <h1>Thiết lập hồ sơ công ty</h1>
          </div>
        </div>

        {error && <p className="form-message error">{error}</p>}

        <CompanyProfileForm initialProfile={profile} />
      </section>
    </main>
  );
}