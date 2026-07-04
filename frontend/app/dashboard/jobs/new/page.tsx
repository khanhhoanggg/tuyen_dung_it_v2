import Link from "next/link";
import { JobForm } from "@/components/JobForm";

export default function NewJobPage() {
  return (
    <main className="auth-shell">
      <Link className="brand" href="/">
        <span className="brand-mark">DJ</span>
        DevJobs Vietnam
      </Link>
      <div className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Đăng tin tuyển dụng</p>
          <h1>Đăng tin mới để tìm ứng viên phù hợp</h1>
          <p>
            Điền đầy đủ thông tin vị trí để ứng viên hiểu rõ yêu cầu công
            việc và chủ động ứng tuyển.
          </p>
        </div>
        <JobForm mode="create" />
      </div>
    </main>
  );
}