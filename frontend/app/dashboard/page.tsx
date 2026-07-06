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
  listMyInterviews,
  listMyInvitations,
  listMyOffers,
  respondToInvitation,
  type Application,
  type CompanyStats,
  type Job,
  type SavedJob,
  type User,
  type InterviewSchedule,
  type JobInvitation,
  type Offer
} from "@/lib/api";
import { ChatModal } from "@/components/ChatModal";
import { OfferDetailModal } from "@/components/OfferDetailModal";

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
            <Link className="primary-button" href="/login">Đăng nhập</Link>
            <Link className="ghost-button" href="/register">Đăng ký</Link>
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

// ---------- 1. DASHBOARD DÀNH CHO ỨNG VIÊN (CANDIDATE) ----------
type CandidateTab = "apps" | "saved" | "interviews" | "invitations" | "offers";

function CandidateDashboard({ user }: { user: User }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);
  const [invitations, setInvitations] = useState<JobInvitation[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  const [activeTab, setActiveTab] = useState<CandidateTab>("apps");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Chat & Offer detail
  const [activeChatAppId, setActiveChatAppId] = useState<string | null>(null);
  const [activeChatTitle, setActiveChatTitle] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  function loadData() {
    setLoading(true);
    Promise.all([
      getMyApplications(),
      listSavedJobs(),
      listMyInterviews(),
      listMyInvitations(),
      listMyOffers()
    ])
      .then(([apps, saved, ints, invs, offs]) => {
        setApplications(apps);
        setSavedJobs(saved);
        setInterviews(ints);
        setInvitations(invs);
        setOffers(offs);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUnsave(jobId: string) {
    try {
      await unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job._id !== jobId));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không thể bỏ lưu việc");
    }
  }

  async function handleRespondInvitation(id: string, status: "accepted" | "declined") {
    if (!window.confirm(`Bạn có chắc muốn ${status === "accepted" ? "chấp nhận" : "từ chối"} lời mời này?`)) return;
    try {
      await respondToInvitation(id, status);
      window.alert("Phản hồi thành công!");
      loadData();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Lỗi xử lý phản hồi");
    }
  }

  const statusLabel: Record<Application["status"], string> = {
    new: "Đang chờ duyệt",
    interviewing: "Phỏng vấn",
    offered: "Nhận Offer",
    rejected: "Từ chối",
  };

  const offerStatusLabels: Record<Offer["status"], string> = {
    draft: "Bản nháp",
    sent: "Thư mới",
    accepted: "Đã ký nhận",
    declined: "Đã từ chối",
    withdrawn: "Đã rút lại",
  };

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">DJ</span>DevJobs
        </Link>
        <nav>
          <button className={activeTab === "apps" ? "active" : ""} onClick={() => setActiveTab("apps")}>Đơn ứng tuyển</button>
          <button className={activeTab === "saved" ? "active" : ""} onClick={() => setActiveTab("saved")}>Việc đã lưu</button>
          <button className={activeTab === "interviews" ? "active" : ""} onClick={() => setActiveTab("interviews")}>Lịch phỏng vấn ({interviews.length})</button>
          <button className={activeTab === "invitations" ? "active" : ""} onClick={() => setActiveTab("invitations")}>Lời mời tuyển dụng ({invitations.length})</button>
          <button className={activeTab === "offers" ? "active" : ""} onClick={() => setActiveTab("offers")}>Offer ({offers.length})</button>
          <Link href="/dashboard/profile">Hồ sơ của tôi</Link>
          <Link href="/dashboard/preferences">Tiêu chí việc làm</Link>
        </nav>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Xin chào, {user.fullName}</p>
            <h1>Trang quản lý việc làm cá nhân</h1>
          </div>
        </div>

        {loading && <p className="form-message">Đang tải dữ liệu...</p>}
        {error && <p className="form-message error">{error}</p>}

        {/* TAB 1: ĐƠN ỨNG TUYỂN */}
        {activeTab === "apps" && !loading && (
          <section className="dashboard-panel">
            <h2>Đơn đã ứng tuyển ({applications.length})</h2>
            <div className="table-like">
              {applications.length === 0 && <p className="form-message">Bạn chưa nộp đơn vào vị trí nào.</p>}
              {applications.map((app) => (
                <div className="table-row" key={app._id}>
                  <div>
                    <strong>{app.job.title}</strong>
                    <span>{app.job.company} - {app.job.location}</span>
                  </div>
                  <span className={`status-tag ${app.status}`}>{statusLabel[app.status]}</span>
                  <div className="row-actions">
                    <button
                      className="primary-button mini"
                      onClick={() => {
                        setActiveChatAppId(app._id);
                        setActiveChatTitle(app.job.company);
                      }}
                    >
                      Nhắn tin
                    </button>
                    <Link href={`/jobs/${app.job._id}`} className="secondary-button">Xem tin</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: VIỆC ĐÃ LƯU */}
        {activeTab === "saved" && !loading && (
          <section className="dashboard-panel">
            <h2>Việc làm đã lưu ({savedJobs.length})</h2>
            <div className="table-like">
              {savedJobs.length === 0 && <p className="form-message">Bạn chưa lưu công việc nào.</p>}
              {savedJobs.map((saved) => (
                <div className="table-row" key={saved._id}>
                  <div>
                    <strong>{saved.job.title}</strong>
                    <span>{saved.job.company} - {saved.job.location}</span>
                  </div>
                  <span>{saved.job.salary}</span>
                  <div className="row-actions">
                    <Link href={`/jobs/${saved.job._id}`} className="secondary-button">Ứng tuyển</Link>
                    <button type="button" className="ghost-button" onClick={() => handleUnsave(saved.job._id)}>Bỏ lưu</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: LỊCH PHỎNG VẤN */}
        {activeTab === "interviews" && !loading && (
          <section className="dashboard-panel">
            <h2>Lịch phỏng vấn sắp tới ({interviews.length})</h2>
            <div className="table-like">
              {interviews.length === 0 && <p className="form-message">Bạn chưa có lịch phỏng vấn nào được xếp.</p>}
              {interviews.map((int) => (
                <div className="table-row flex-column" key={int._id}>
                  <div>
                    <strong>Phỏng vấn: {typeof int.job === "string" ? "Vị trí" : int.job.title}</strong>
                    <span>Thời gian: {new Date(int.scheduledAt).toLocaleString("vi-VN")} ({int.durationMinutes} phút)</span>
                    <span>Hình thức: {int.type === "online" ? "Online" : "Trực tiếp tại văn phòng"}</span>
                  </div>
                  <div className="detail-meta">
                    {int.meetingLink && <p>Link họp: <a href={int.meetingLink} target="_blank" rel="noreferrer">{int.meetingLink}</a></p>}
                    {int.address && <p>Địa chỉ: {int.address}</p>}
                    {int.note && <p>Ghi chú: {int.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: LỜI MỜI TUYỂN DỤNG */}
        {activeTab === "invitations" && !loading && (
          <section className="dashboard-panel">
            <h2>Lời mời tuyển dụng trực tiếp từ Công ty ({invitations.length})</h2>
            <div className="table-like">
              {invitations.length === 0 && <p className="form-message">Bạn chưa có lời mời tuyển dụng nào.</p>}
              {invitations.map((inv) => (
                <div className="table-row flex-column" key={inv._id}>
                  <div className="flex-between">
                    <div>
                      <strong>Lời mời vị trí: {inv.job.title}</strong>
                      <span>Từ công ty: {inv.job.company} | Trạng thái: {inv.status === "pending" ? "Đang chờ" : inv.status === "accepted" ? "Chấp nhận" : "Từ chối"}</span>
                      {inv.message && <p className="inv-message">Lời nhắn: "{inv.message}"</p>}
                    </div>
                    {inv.status === "pending" && (
                      <div className="row-actions">
                        <button className="primary-button mini" onClick={() => handleRespondInvitation(inv._id, "accepted")}>Chấp nhận</button>
                        <button className="danger-button mini" onClick={() => handleRespondInvitation(inv._id, "declined")}>Từ chối</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 5: OFFER */}
        {activeTab === "offers" && !loading && (
          <section className="dashboard-panel">
            <h2>Hồ sơ Thư mời nhận việc (Offers) ({offers.length})</h2>
            <div className="table-like">
              {offers.length === 0 && <p className="form-message">Bạn chưa nhận được thư mời làm việc nào.</p>}
              {offers.map((off) => (
                <div className="table-row" key={off._id}>
                  <div>
                    <strong>Thư mời vị trí: {off.position}</strong>
                    <span>Lương đề xuất: {off.salary} | Trạng thái: {offerStatusLabels[off.status]}</span>
                  </div>
                  <div className="row-actions">
                    <button className="secondary-button" onClick={() => setSelectedOffer(off)}>Xem chi tiết</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>

      {/* RENDER CÁC MODAL */}
      {activeChatAppId && (
        <ChatModal
          applicationId={activeChatAppId}
          title={activeChatTitle}
          currentUser={user}
          onClose={() => setActiveChatAppId(null)}
        />
      )}

      {selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onActionSuccess={loadData}
        />
      )}
    </main>
  );
}

// ---------- 2. DASHBOARD DÀNH CHO NHÀ TUYỂN DỤNG (COMPANY) ----------
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
  }, []);

  async function handleDelete(jobId: string) {
    if (!window.confirm("Bạn có chắc muốn xóa tin tuyển dụng này?")) return;
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không thể xóa tin");
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
          <span className="brand-mark">DJ</span>DevJobs
        </Link>
        <nav>
          <a className="active" href="#overview">Tổng quan</a>
          <a href="#jobs">Tin đăng tuyển dụng</a>
          <Link href="/dashboard/company-profile">Hồ sơ công ty</Link>
          <Link href="/dashboard/company-locations">Địa điểm làm việc</Link>
        </nav>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Dashboard nhà tuyển dụng - {user.fullName}</p>
            <h1>Quản lý tin đăng & Quy trình tuyển dụng</h1>
          </div>
          <Link href="/dashboard/jobs/new" className="primary-button">Đăng tin mới</Link>
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
            <h2>Tin tuyển dụng của bạn ({jobs.length})</h2>
          </div>
          <div className="table-like">
            {jobs.length === 0 && !loading && <p className="form-message">Bạn chưa đăng tin tuyển dụng nào.</p>}
            {jobs.map((job) => (
              <div className="table-row" key={job._id}>
                <div>
                  <strong>{job.title}</strong>
                  <span>{job.location} - {job.type} - {job.status === "open" ? "Đang mở" : "Đã đóng"}</span>
                </div>
                <span>{job.salary}</span>
                <div className="row-actions">
                  <Link href={`/dashboard/jobs/${job._id}/applications`} className="primary-button mini">
                    Quản lý ứng viên
                  </Link>
                  <Link href={`/jobs/${job._id}`} className="secondary-button">Xem tin</Link>
                  <Link href={`/dashboard/jobs/${job._id}/edit`} className="secondary-button">Sửa</Link>
                  <button type="button" className="ghost-button" onClick={() => handleDelete(job._id)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}