"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listMyCompanyLocations,
  getStoredUser,
  type CompanyLocation,
  type User,
} from "@/lib/api";
import { CompanyLocationManager } from "@/components/CompanyLocationManager";

export default function CompanyLocationsPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    if (storedUser?.role === "company") {
      listMyCompanyLocations()
        .then((data) => setLocations(data))
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Không thể tải danh sách địa điểm");
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
          <p className="eyebrow">Địa điểm làm việc</p>
          <h1>Chỉ nhà tuyển dụng mới có thể quản lý địa điểm</h1>
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
          <Link href="/dashboard/company-profile">Hồ sơ công ty</Link>
          <Link className="active" href="/dashboard/company-locations">
            Địa điểm làm việc
          </Link>
        </nav>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Xin chào, {user.fullName}</p>
            <h1>Quản lý địa điểm làm việc</h1>
          </div>
        </div>

        {error && <p className="form-message error">{error}</p>}

        <CompanyLocationManager initialLocations={locations} />
      </section>
    </main>
  );
}