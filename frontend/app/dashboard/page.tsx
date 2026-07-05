"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteJob,
  getCompanyStats,
  getMyApplications,
  getMyJobs,
  getStoredUser,
  listSavedJobs,
  unsaveJob,
  type Application,
  type CompanyStats,
  type Job,
  type SavedJob,
  type User,
} from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  if (user === undefined) {
    return (
      <main className="dashboard-page">
        <p className="form-message">Đang tải...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-content">
          <p className="eyebrow">Dashboard</p>
          <h1>Bạn cần đăng nhập để xem dashboard</h1>
          <div className="header-actions">
            <Link className="primary-button" href="/login">
              Đăng nhập
            </Link>
            <Link className="ghost-button" href="/register">
              Đăng ký
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return user.role === "candidate" ? (
    <CandidateDashboard user={user} />
  ) : (
    <CompanyDashboard user={user} />
  );
}

// ---------- Dashboard cho ứng viên ----------

function CandidateDashboard({ user }: { user: User }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMyApplications(), listSavedJobs()])
      .then(([apps, saved]) => {
        setApplications(apps);
        setSavedJobs(saved);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleUnsave(jobId: string) {
    try {
      await unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job._id !== jobId));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không thể bỏ lưu việc làm");
    }
  }

  const statusLabel: Record<Application["status"], string> = {
    new: "Hồ sơ mới",
    interviewing: "Đang phỏng vấn",
    offered: "Đã gửi offer",
    rejected: "Từ chối",
  };

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">DJ</span>
          DevJobs
        </Link>
        <nav>
          <a className="active" href="#applications">
            Đơn ứng tuyển
          </a>
          <a href="#saved">Việc đã lưu</a>
          <Link href="/dashboard/profile">Hồ sơ của tôi</Link>
          <Link href="/dashboard/preferences">Tiêu chí việc làm</Link>
        </nav>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Xin chào, {user.fullName}</p>
            <h1>Theo dõi đơn ứng tuyển và việc làm đã lưu</h1>
          </div>
          <Link className="primary-button" href="/">
            Tìm thêm việc làm
          </Link>
        </div>

        {loading && <p className="form-message">Đang tải dữ liệu...</p>}
        {error && <p className="form-message error">{error}</p>}

        <section className="dashboard-panel" id="applications">
          <div className="panel-heading">
            <h2>Đơn đã ứng tuyển ({applications.length})</h2>
          </div>
          <div className="table-like">
            {applications.length === 0 && !loading && (
              <p className="form-message">Bạn chưa ứng tuyển vị trí nào.</p>
            )}
            {applications.map((app) => (
              <div className="table-row" key={app._id}>
                <div>
                  <strong>{app.job.title}</strong>
                  <span>
                    {app.job.company} - {app.job.location}
                  </span>
                </div>
                <span>{statusLabel[app.status]}</span>
                <Link href={`/jobs/${app.job._id}`} className="secondary-button">
                  Xem tin
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel" id="saved">
          <div className="panel-heading">
            <h2>Việc đã lưu ({savedJobs.length})</h2>
          </div>
          <div className="table-like">
            {savedJobs.length === 0 && !loading && (
              <p className="form-message">Bạn chưa lưu việc làm nào.</p>
            )}
            {savedJobs.map((saved) => (
              <div className="table-row" key={saved._id}>
                <div>
                  <strong>{saved.job.title}</strong>
                  <span>
                    {saved.job.company} - {saved.job.location}
                  </span>
                </div>
                <span>{saved.job.salary}</span>
                <div className="row-actions">
                  <Link href={`/jobs/${saved.job._id}`} className="secondary-button">
                    Xem tin
                  </Link>
                  <button type="button" onClick={() => handleUnsave(saved.job._id)}>
                    Bỏ lưu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

// ---------- Dashboard cho nhà tuyển dụng ----------

function CompanyDashboard({ user }: { user: User }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadData() {
    setLoading(true);
    Promise.all([getMyJobs(), getCompanyStats()])
      .then(([myJobs, myStats]) => {
        setJobs(myJobs);
        setStats(myStats);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(jobId: string) {
    if (!window.confirm("Bạn có chắc muốn xóa tin tuyển dụng này?")) return;
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không thể xóa tin tuyển dụng");
    }
  }

  const pipeline = stats
    ? [
        { label: "Hồ sơ mới", value: stats.new },
        { label: "Đang phỏng vấn", value: stats.interviewing },
        { label: "Đã gửi offer", value: stats.offered },
        { label: "Tổng tin đăng", value: stats.totalJobs },
      ]
    : [];

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">DJ</span>
          DevJobs
        </Link>
        <nav>
          <a className="active" href="#overview">
            Tổng quan
          </a>
          <a href="#jobs">Tin đăng</a>
        </nav>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Dashboard nhà tuyển dụng - {user.fullName}</p>
            <h1>Quản lý tin tuyển dụng và pipeline ứng viên</h1>
          </div>
          <Link href="/dashboard/jobs/new" className="primary-button">
            Đăng tin mới
          </Link>
        </div>

        {loading && <p className="form-message">Đang tải dữ liệu...</p>}
        {error && <p className="form-message error">{error}</p>}

        <div className="metric-grid" id="overview">
          {pipeline.map((item) => (
            <article className="metric-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>

        <section className="dashboard-panel" id="jobs">
          <div className="panel-heading">
            <h2>Tin đăng của bạn ({jobs.length})</h2>
            <Link href="/">Xem website</Link>
          </div>
          <div className="table-like">
            {jobs.length === 0 && !loading && (
              <p className="form-message">Bạn chưa đăng tin tuyển dụng nào.</p>
            )}
            {jobs.map((job) => (
              <div className="table-row" key={job._id}>
                <div>
                  <strong>{job.title}</strong>
                  <span>
                    {job.location} - {job.type} - {job.status === "open" ? "Đang mở" : "Đã đóng"}
                  </span>
                </div>
                <span>{job.salary}</span>
                <div className="row-actions">
                  <Link href={`/jobs/${job._id}`} className="secondary-button">
                    Xem tin
                  </Link>
                  <Link href={`/dashboard/jobs/${job._id}/edit`} className="secondary-button">
                    Sửa
                  </Link>
                  <button type="button" onClick={() => handleDelete(job._id)}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}