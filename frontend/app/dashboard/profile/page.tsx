"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyCandidateProfile, getStoredUser, type CandidateProfile, type User } from "@/lib/api";
import { CandidateProfileForm } from "@/components/CandidateProfileForm";

export default function CandidateProfilePage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    if (storedUser?.role === "candidate") {
      getMyCandidateProfile()
        .then((data) => setProfile(data))
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Không thể tải hồ sơ");
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
          <p className="eyebrow">Hồ sơ ứng viên</p>
          <h1>Chỉ ứng viên mới có thể chỉnh sửa hồ sơ này</h1>
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
          <Link className="active" href="/dashboard/profile">
            Hồ sơ của tôi
          </Link>
        </nav>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Xin chào, {user.fullName}</p>
            <h1>Cập nhật hồ sơ ứng viên</h1>
          </div>
        </div>

        {error && <p className="form-message error">{error}</p>}

        <CandidateProfileForm initialProfile={profile} />
      </section>
    </main>
  );
}