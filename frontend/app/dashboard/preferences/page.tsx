"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyCandidatePreference,
  getStoredUser,
  type CandidatePreference,
  type User,
} from "@/lib/api";
import { CandidatePreferenceForm } from "@/components/CandidatePreferenceForm";

export default function CandidatePreferencePage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [preference, setPreference] = useState<CandidatePreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    if (storedUser?.role === "candidate") {
      getMyCandidatePreference()
        .then((data) => setPreference(data))
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Không thể tải tiêu chí");
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

  if (!user || user.role !== "candidate") {
    return (
      <main className="dashboard-page">
        <div className="dashboard-content">
          <p className="eyebrow">Tiêu chí việc làm</p>
          <h1>Chỉ ứng viên mới có thể cài đặt tiêu chí này</h1>
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
          <a href="/dashboard#applications">Đơn ứng tuyển</a>
          <a href="/dashboard#saved">Việc đã lưu</a>
          <Link href="/dashboard/profile">Hồ sơ của tôi</Link>
          <Link className="active" href="/dashboard/preferences">
            Tiêu chí việc làm
          </Link>
        </nav>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Xin chào, {user.fullName}</p>
            <h1>Cài đặt tiêu chí nhận việc làm phù hợp</h1>
          </div>
        </div>

        {error && <p className="form-message error">{error}</p>}

        <CandidatePreferenceForm initialPreference={preference} />
      </section>
    </main>
  );
}