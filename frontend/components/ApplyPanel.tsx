"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  applyToJob,
  getMyApplications,
  getStoredUser,
  type User,
} from "@/lib/api";

type ApplyPanelProps = {
  jobId: string;
};

export function ApplyPanel({ jobId }: ApplyPanelProps) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    if (!storedUser || storedUser.role !== "candidate") {
      setChecking(false);
      return;
    }

    getMyApplications()
      .then((applications) => {
        const found = applications.some((app) => app.job._id === jobId);
        setAlreadyApplied(found);
      })
      .catch(() => {
        // Không chặn form nếu không lấy được danh sách đơn đã nộp
      })
      .finally(() => setChecking(false));
  }, [jobId]);

  async function handleApply() {
    setStatus("loading");
    setFeedback("");

    try {
      await applyToJob(jobId, message);
      setStatus("success");
      setFeedback("Ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.");
      setAlreadyApplied(true);
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Không thể ứng tuyển lúc này.");
    }
  }

  if (user === undefined || checking) {
    return (
      <aside className="apply-panel">
        <h2>Ứng tuyển vị trí này</h2>
        <p>Đang kiểm tra trạng thái...</p>
      </aside>
    );
  }

  if (!user) {
    return (
      <aside className="apply-panel">
        <h2>Ứng tuyển vị trí này</h2>
        <p>
          Gửi hồ sơ của bạn đến nhà tuyển dụng và theo dõi trạng thái ứng
          tuyển trong dashboard cá nhân.
        </p>
        <Link href="/login" className="primary-button">
          Đăng nhập để ứng tuyển
        </Link>
        <Link href="/register" className="secondary-link">
          Tạo hồ sơ ứng viên
        </Link>
      </aside>
    );
  }

  if (user.role !== "candidate") {
    return (
      <aside className="apply-panel">
        <h2>Ứng tuyển vị trí này</h2>
        <p>Chỉ tài khoản ứng viên mới có thể ứng tuyển vào vị trí này.</p>
      </aside>
    );
  }

  if (alreadyApplied) {
    return (
      <aside className="apply-panel">
        <h2>Ứng tuyển vị trí này</h2>
        <p>Bạn đã ứng tuyển vị trí này rồi. Theo dõi trạng thái trong dashboard.</p>
        <Link href="/dashboard" className="primary-button">
          Xem dashboard
        </Link>
      </aside>
    );
  }

  return (
    <aside className="apply-panel">
      <h2>Ứng tuyển vị trí này</h2>
      <p>
        Gửi hồ sơ của bạn đến nhà tuyển dụng và theo dõi trạng thái ứng
        tuyển trong dashboard cá nhân.
      </p>
      <label>
        Lời nhắn (tùy chọn)
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Giới thiệu ngắn về bản thân..."
          rows={4}
        />
      </label>
      <button
        type="button"
        className="primary-button"
        disabled={status === "loading"}
        onClick={handleApply}
      >
        {status === "loading" ? "Đang gửi..." : "Ứng tuyển ngay"}
      </button>
      {feedback && <p className={`form-message ${status}`}>{feedback}</p>}
    </aside>
  );
}