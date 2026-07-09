"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getJob,
  getJobApplications,
  getCandidateProfile,
  updateApplicationStatus,
  updateApplicationAts,
  createInterview,
  listCompanyInterviews,
  createOffer,
  listCompanyOffers,
  sendOffer,
  withdrawOffer,
  inviteCandidate,
  type Job,
  type Application,
  type CandidateProfile,
  type InterviewSchedule,
  type Offer,
  type User,
  getStoredUser
} from "@/lib/api";
import { ChatModal } from "@/components/ChatModal";

type PageProps = {
  params: Promise<{ id: string }>;
};

type ActiveTab = "profile" | "interview" | "offer" | "ats";

export default function JobApplicationsPage({ params }: PageProps) {
  const router = useRouter();
  const { id: jobId } = use(params);

  const [user, setUser] = useState<User | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Trạng thái cho ứng viên đang được chọn
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CandidateProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  // Dữ liệu mở rộng
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  // Trạng thái modal/forms
  const [showChatModal, setShowChatModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviting, setInviting] = useState(false);

  // Form Lịch phỏng vấn
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("45");
  const [intType, setIntType] = useState<"onsite" | "online">("online");
  const [meetingLink, setMeetingLink] = useState("");
  const [address, setAddress] = useState("");
  const [intNote, setIntNote] = useState("");

  // Form Offer
  const [offPosition, setOffPosition] = useState("");
  const [offSalary, setOffSalary] = useState("");
  const [offStartDate, setOffStartDate] = useState("");
  const [offContent, setOffContent] = useState("");

  // Form ATS/CRM (đánh giá + ghi chú nội bộ)
  const [atsRating, setAtsRating] = useState(0);
  const [atsNote, setAtsNote] = useState("");
  const [atsTags, setAtsTags] = useState<string[]>([]);
  const [atsTagInput, setAtsTagInput] = useState("");
  const [atsSaving, setAtsSaving] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored || stored.role !== "company") {
      router.push("/login");
      return;
    }
    setUser(stored);
    loadAllData();
  }, [jobId]);

  async function loadAllData() {
    try {
      setLoading(true);
      const [jobData, appsData, intsData, offsData] = await Promise.all([
        getJob(jobId),
        getJobApplications(jobId),
        listCompanyInterviews(),
        listCompanyOffers(),
      ]);
      setJob(jobData);
      setApps(appsData);
      setInterviews(intsData);
      setOffers(offsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  // Khi bấm vào 1 ứng viên trong danh sách
  async function handleSelectApp(app: Application) {
    setSelectedApp(app);
    setProfileLoading(true);
    setActiveTab("profile");
    // Nạp lại form ATS theo ứng viên vừa chọn
    setAtsRating(app.rating || 0);
    setAtsNote(app.internalNote || "");
    setAtsTags(app.tags || []);
    setAtsTagInput("");
    try {
      const candidateId = typeof app.candidate === "string" ? app.candidate : ((app.candidate as any)._id || (app.candidate as any).id);
      const profile = await getCandidateProfile(candidateId);
      setSelectedProfile(profile);
    } catch (err) {
      console.error(err);
      setSelectedProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }

  // Thay đổi trạng thái hồ sơ
  async function handleChangeStatus(status: Application["status"]) {
    if (!selectedApp) return;
    try {
      const updated = await updateApplicationStatus(selectedApp._id, status);
      setApps((prev) => prev.map((a) => (a._id === updated._id ? { ...a, status: updated.status } : a)));
      setSelectedApp((prev) => (prev ? { ...prev, status: updated.status } : null));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không thể đổi trạng thái");
    }
  }
  
  // Thêm 1 tag vào form ATS (Enter hoặc dấu phẩy)
  function handleAddAtsTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const value = atsTagInput.trim();
    if (!value) return;
    if (!atsTags.includes(value)) {
      setAtsTags((prev) => [...prev, value]);
    }
    setAtsTagInput("");
  }

  function handleRemoveAtsTag(tag: string) {
    setAtsTags((prev) => prev.filter((t) => t !== tag));
  }

  // Lưu đánh giá / ghi chú nội bộ / tag cho ứng viên
  async function handleSaveAts() {
    if (!selectedApp) return;
    setAtsSaving(true);
    try {
      const updated = await updateApplicationAts(selectedApp._id, {
        rating: atsRating || undefined,
        internalNote: atsNote,
        tags: atsTags,
      });
      setApps((prev) =>
        prev.map((a) =>
          a._id === updated._id
            ? { ...a, rating: updated.rating, internalNote: updated.internalNote, tags: updated.tags }
            : a
        )
      );
      setSelectedApp((prev) =>
        prev ? { ...prev, rating: updated.rating, internalNote: updated.internalNote, tags: updated.tags } : null
      );
      window.alert("Đã lưu đánh giá nội bộ!");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không thể lưu đánh giá");
    } finally {
      setAtsSaving(false);
    }
  }

  // Đặt lịch phỏng vấn
  async function handleCreateInterview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      await createInterview(selectedApp._id, {
        scheduledAt,
        durationMinutes: parseInt(duration),
        type: intType,
        meetingLink: intType === "online" ? meetingLink : undefined,
        address: intType === "onsite" ? address : undefined,
        note: intNote,
      });
      window.alert("Lên lịch phỏng vấn thành công!");
      // Reset form & reload
      setScheduledAt("");
      setIntNote("");
      const intsData = await listCompanyInterviews();
      setInterviews(intsData);
      // Cập nhật trạng thái hiển thị
      handleChangeStatus("interviewing");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Lỗi đặt lịch phỏng vấn");
    }
  }

  // Tạo Offer
  async function handleCreateOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      await createOffer(selectedApp._id, {
        position: offPosition,
        salary: offSalary,
        startDate: offStartDate,
        content: offContent,
        status: "draft",
      });
      window.alert("Tạo offer nháp thành công!");
      // Reset form & reload
      setOffPosition("");
      setOffSalary("");
      setOffStartDate("");
      setOffContent("");
      const offsData = await listCompanyOffers();
      setOffers(offsData);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Lỗi tạo offer");
    }
  }

  // Gửi Offer
  async function handleSendOffer(offerId: string) {
    try {
      await sendOffer(offerId);
      window.alert("Đã gửi offer tới ứng viên!");
      const offsData = await listCompanyOffers();
      setOffers(offsData);
      handleChangeStatus("offered");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Lỗi gửi offer");
    }
  }

  // Rút lại Offer
  async function handleWithdrawOffer(offerId: string) {
    if (!window.confirm("Bạn có chắc muốn rút lại Offer này?")) return;
    try {
      await withdrawOffer(offerId);
      window.alert("Đã rút lại offer.");
      const offsData = await listCompanyOffers();
      setOffers(offsData);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Lỗi rút offer");
    }
  }

  // Mời ứng viên trực tiếp bằng Email
  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await inviteCandidate(jobId, inviteEmail.trim(), inviteMsg.trim());
      window.alert(`Đã gửi lời mời ứng tuyển tới ${inviteEmail}!`);
      setInviteEmail("");
      setInviteMsg("");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không thể gửi lời mời");
    } finally {
      setInviting(false);
    }
  }

  if (loading) return <main className="dashboard-page"><p className="form-message">Đang tải danh sách ứng tuyển...</p></main>;
  if (error) return <main className="dashboard-page"><p className="form-message error">{error}</p></main>;

  const currentInterview = interviews.find((i) => i.application === selectedApp?._id);
  const currentOffer = offers.find((o) => o.application === selectedApp?._id);

  const statusLabel: Record<Application["status"], string> = {
    new: "Hồ sơ mới",
    interviewing: "Đang phỏng vấn",
    offered: "Đã gửi offer",
    rejected: "Từ chối",
  };

  const statusOfferLabel: Record<Offer["status"], string> = {
    draft: "Bản nháp",
    sent: "Đã gửi ứng viên",
    accepted: "Ứng viên đã ký nhận",
    declined: "Ứng viên từ chối",
    withdrawn: "Đã rút lại",
  };

  return (
    <main className="dashboard-page ats-layout">
      {/* CỘT TRÁI: DANH SÁCH ỨNG VIÊN */}
      <aside className="sidebar ats-sidebar">
        <Link href="/dashboard" className="brand">&larr; Dashboard</Link>
        <div className="ats-sidebar-header">
          <h3>Ứng viên nộp đơn</h3>
          <span className="sub-title">{job?.title}</span>
        </div>

        {/* Form mời ứng viên nhanh */}
        <form onSubmit={handleInvite} className="invite-form-mini">
          <h4>Gửi lời mời trực tiếp</h4>
          <input
            type="email"
            placeholder="Nhập email ứng viên..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <textarea
            placeholder="Lời nhắn..."
            value={inviteMsg}
            onChange={(e) => setInviteMsg(e.target.value)}
            rows={2}
          />
          <button type="submit" className="primary-button mini" disabled={inviting}>
            {inviting ? "Đang gửi..." : "Mời ứng tuyển"}
          </button>
        </form>

        <hr />

        <div className="ats-candidate-list">
          {apps.length === 0 && <p className="form-message">Chưa có ứng viên nào ứng tuyển.</p>}
          {apps.map((app) => {
            const cand = app.candidate as User;
            const isSelected = selectedApp?._id === app._id;
            return (
              <div
                key={app._id}
                className={`ats-candidate-card ${isSelected ? "active" : ""}`}
                onClick={() => handleSelectApp(app)}
              >
                <strong>{cand.fullName}</strong>
                <span>{cand.email}</span>
                <div className="card-footer">
                  <span className={`status-tag ${app.status}`}>{statusLabel[app.status]}</span>
                  <span className="date-time">{new Date(app.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* CỘT PHẢI: CHI TIẾT ỨNG VIÊN ĐƯỢC CHỌN */}
      <section className="dashboard-content ats-detail-panel">
        {selectedApp ? (
          <>
            {/* Header thông tin nhanh */}
            <div className="ats-detail-header">
              <div>
                <h2>{(selectedApp.candidate as User).fullName}</h2>
                <p>Email: {(selectedApp.candidate as User).email} | Ngày nộp: {new Date(selectedApp.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="ats-status-actions">
                <label>Trạng thái hồ sơ: </label>
                <select value={selectedApp.status} onChange={(e) => handleChangeStatus(e.target.value as any)}>
                  <option value="new">Hồ sơ mới</option>
                  <option value="interviewing">Đang phỏng vấn</option>
                  <option value="offered">Đã gửi offer</option>
                  <option value="rejected">Từ chối</option>
                </select>
                <button className="primary-button" onClick={() => setShowChatModal(true)}>
                  Nhắn tin trao đổi
                </button>
              </div>
            </div>

            {/* Điều hướng các tab */}
            <div className="ats-tabs">
              <button className={activeTab === "ats" ? "active" : ""} onClick={() => setActiveTab("ats")}>Đánh giá nội bộ</button>
              <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Hồ sơ ứng viên</button>
              <button className={activeTab === "interview" ? "active" : ""} onClick={() => setActiveTab("interview")}>Lịch phỏng vấn</button>
              <button className={activeTab === "offer" ? "active" : ""} onClick={() => setActiveTab("offer")}>Offer tuyển dụng</button>
            </div>

            {/* Nội dung chi tiết các tab */}
            <div className="ats-tab-content">
              {profileLoading && <p className="form-message">Đang tải hồ sơ...</p>}

              {/* TAB 1: HỒ SƠ ỨNG VIÊN */}
              {activeTab === "profile" && !profileLoading && (
                <div className="candidate-profile-tab">
                  {selectedProfile ? (
                    <>
                      <div className="profile-group">
                        <h3>Thông tin chung</h3>
                        {selectedProfile.headline && <p><strong>Tiêu đề:</strong> {selectedProfile.headline}</p>}
                        {selectedProfile.phone && <p><strong>Số điện thoại:</strong> {selectedProfile.phone}</p>}
                        {selectedProfile.bio && <p><strong>Giới thiệu:</strong> {selectedProfile.bio}</p>}
                        <p><strong>Kỹ năng:</strong> {selectedProfile.skills.join(", ") || "Chưa cập nhật"}</p>
                        {selectedProfile.cvUrl && (
                          <div className="cv-download-box">
                            <p><strong>CV đính kèm:</strong> {selectedProfile.cvOriginalName || "CV_Ung_Vien.pdf"}</p>
                            <a
                              href={`http://localhost:4000${selectedProfile.cvUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="secondary-button"
                            >
                              Tải xuống CV của ứng viên
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="profile-group">
                        <h3>Kinh nghiệm làm việc</h3>
                        {selectedProfile.experiences?.length === 0 && <p>Chưa cập nhật kinh nghiệm.</p>}
                        {selectedProfile.experiences?.map((exp, idx) => (
                          <div key={idx} className="profile-item-card">
                            <strong>{exp.position} tại {exp.company}</strong>
                            <span className="time-range">{exp.startDate} - {exp.endDate || "Hiện tại"}</span>
                            {exp.description && <p>{exp.description}</p>}
                          </div>
                        ))}
                      </div>

                      <div className="profile-group">
                        <h3>Học văn / Bằng cấp</h3>
                        {selectedProfile.educations?.length === 0 && <p>Chưa cập nhật học vấn.</p>}
                        {selectedProfile.educations?.map((edu, idx) => (
                          <div key={idx} className="profile-item-card">
                            <strong>Chuyên ngành {edu.major} tại {edu.school}</strong>
                            <span className="time-range">{edu.startDate} - {edu.endDate || "Tốt nghiệp"}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="form-message">Ứng viên chưa cập nhật thông tin hồ sơ chi tiết trên hệ thống.</p>
                  )}
                  {selectedApp.message && (
                    <div className="profile-group cover-letter">
                      <h3>Thư giới thiệu của ứng viên:</h3>
                      <p className="letter-box">{selectedApp.message}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LỊCH PHỎNG VẤN */}
              {activeTab === "interview" && (
                <div className="interview-tab">
                  {currentInterview ? (
                    <div className="interview-info-box">
                      <h3>Lịch phỏng vấn hiện tại</h3>
                      <p><strong>Thời gian:</strong> {new Date(currentInterview.scheduledAt).toLocaleString("vi-VN")}</p>
                      <p><strong>Thời lượng:</strong> {currentInterview.durationMinutes} phút</p>
                      <p><strong>Hình thức:</strong> {currentInterview.type === "online" ? "Phỏng vấn Online" : "Phỏng vấn trực tiếp tại văn phòng"}</p>
                      {currentInterview.meetingLink && (
                        <p>
                          <strong>Link phòng họp:</strong>{" "}
                          <a href={currentInterview.meetingLink} target="_blank" rel="noreferrer">
                            {currentInterview.meetingLink}
                          </a>
                        </p>
                      )}
                      {currentInterview.address && <p><strong>Địa chỉ:</strong> {currentInterview.address}</p>}
                      {currentInterview.note && <p><strong>Ghi chú:</strong> {currentInterview.note}</p>}
                    </div>
                  ) : (
                    <form onSubmit={handleCreateInterview} className="ats-form">
                      <h3>Lên lịch phỏng vấn mới</h3>
                      <label>
                        Thời gian phỏng vấn:
                        <input
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        Thời lượng (phút):
                        <input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          min="15"
                          required
                        />
                      </label>
                      <label>
                        Hình thức:
                        <select value={intType} onChange={(e) => setIntType(e.target.value as any)}>
                          <option value="online">Online (Google Meet/Zoom)</option>
                          <option value="onsite">Onsite (Trực tiếp)</option>
                        </select>
                      </label>
                      {intType === "online" ? (
                        <label>
                          Link phòng họp:
                          <input
                            type="url"
                            placeholder="https://meet.google.com/..."
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            required
                          />
                        </label>
                      ) : (
                        <label>
                          Địa điểm:
                          <input
                            type="text"
                            placeholder="Nhập địa chỉ văn phòng..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                          />
                        </label>
                      )}
                      <label>
                        Ghi chú gửi ứng viên:
                        <textarea
                          placeholder="Mang theo laptop, chuẩn bị tinh thần giới thiệu bản thân..."
                          value={intNote}
                          onChange={(e) => setIntNote(e.target.value)}
                          rows={3}
                        />
                      </label>
                      <button type="submit" className="primary-button">Tạo lịch và gửi thông báo</button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: OFFER TUYỂN DỤNG */}
              {activeTab === "offer" && (
                <div className="offer-tab">
                  {currentOffer ? (
                    <div className="offer-info-box">
                      <h3>Chi tiết thư mời đã tạo</h3>
                      <p><strong>Vị trí:</strong> {currentOffer.position}</p>
                      <p><strong>Mức lương:</strong> {currentOffer.salary}</p>
                      <p><strong>Ngày bắt đầu làm:</strong> {new Date(currentOffer.startDate).toLocaleDateString("vi-VN")}</p>
                      <p><strong>Chi tiết:</strong> {currentOffer.content || "Không có ghi chú thêm."}</p>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        <span className={`status-badge status-${currentOffer.status}`}>
                          {statusOfferLabel[currentOffer.status]}
                        </span>
                      </p>
                      {currentOffer.status === "accepted" && (
                        <p><strong>Chữ ký ứng viên:</strong> <span className="sig-handwritten">{currentOffer.candidateSignature}</span></p>
                      )}

                      <div className="offer-actions">
                        {currentOffer.status === "draft" && (
                          <button className="primary-button" onClick={() => handleSendOffer(currentOffer._id)}>
                            Gửi Offer tới ứng viên
                          </button>
                        )}
                        {(currentOffer.status === "sent" || currentOffer.status === "draft") && (
                          <button className="danger-button" onClick={() => handleWithdrawOffer(currentOffer._id)}>
                            Rút lại / Hủy bỏ Offer
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateOffer} className="ats-form">
                      <h3>Tạo thư mời nhận việc (Offer)</h3>
                      <label>
                        Vị trí công việc (Position):
                        <input
                          type="text"
                          placeholder="VD: Junior Frontend Developer"
                          value={offPosition}
                          onChange={(e) => setOffPosition(e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        Mức lương đề xuất:
                        <input
                          type="text"
                          placeholder="VD: 15.000.000 VNĐ (net)"
                          value={offSalary}
                          onChange={(e) => setOffSalary(e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        Ngày bắt đầu đi làm (Start Date):
                        <input
                          type="date"
                          value={offStartDate}
                          onChange={(e) => setOffStartDate(e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        Nội dung chi tiết & Thỏa thuận thêm:
                        <textarea
                          placeholder="Mô tả chế độ thử việc, phụ cấp, thưởng..."
                          value={offContent}
                          onChange={(e) => setOffContent(e.target.value)}
                          rows={6}
                        />
                      </label>
                      <button type="submit" className="primary-button">Lưu bản nháp Offer</button>
                    </form>
                  )}
                </div>
              )}
              {/* TAB 4: ĐÁNH GIÁ NỘI BỘ (ATS/CRM) */}
              {activeTab === "ats" && (
                <div className="ats-review-tab">
                  <div className="ats-form">
                    <h3>Đánh giá & ghi chú nội bộ</h3>
                    <p className="form-message">Thông tin này chỉ nội bộ công ty xem được, ứng viên không thấy.</p>

                    <label>
                      Mức đánh giá:
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            className={`star ${star <= atsRating ? "filled" : ""}`}
                            onClick={() => setAtsRating(star === atsRating ? 0 : star)}
                            aria-label={`Đánh giá ${star} sao`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </label>

                    <label>
                      Ghi chú nội bộ:
                      <textarea
                        placeholder="Nhận xét về ứng viên (kỹ năng, thái độ phỏng vấn, mức lương thoả thuận nội bộ...)"
                        value={atsNote}
                        onChange={(e) => setAtsNote(e.target.value)}
                        rows={5}
                      />
                    </label>

                    <label>
                      Gắn tag:
                      <input
                        type="text"
                        placeholder="Nhập tag rồi nhấn Enter (VD: giỏi thuật toán, cần đào tạo thêm...)"
                        value={atsTagInput}
                        onChange={(e) => setAtsTagInput(e.target.value)}
                        onKeyDown={handleAddAtsTag}
                      />
                    </label>
                    <div className="ats-tag-list">
                      {atsTags.length === 0 && <span className="form-message">Chưa có tag nào.</span>}
                      {atsTags.map((tag) => (
                        <span key={tag} className="ats-tag-chip">
                          {tag}
                          <button type="button" onClick={() => handleRemoveAtsTag(tag)} aria-label={`Xóa tag ${tag}`}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleSaveAts}
                      disabled={atsSaving}
                    >
                      {atsSaving ? "Đang lưu..." : "Lưu đánh giá"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Modal hỗ trợ nhắn tin */}
            {showChatModal && user && (
              <ChatModal
                applicationId={selectedApp._id}
                title={(selectedApp.candidate as User).fullName}
                currentUser={user}
                onClose={() => setShowChatModal(false)}
              />
            )}
          </>
        ) : (
          <div className="ats-empty-state">
            <p>Vui lòng chọn một ứng viên ở danh sách bên trái để quản lý tiến trình tuyển dụng.</p>
          </div>
        )}
      </section>
    </main>
  );
}
