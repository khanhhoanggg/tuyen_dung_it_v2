import Link from "next/link";
import { notFound } from "next/navigation";
import { JobForm } from "@/components/JobForm";
import { getJob } from "@/lib/api";

type EditJobPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const job = await getJob(id).catch(() => null);

  if (!job) {
    notFound();
  }

  return (
    <main className="auth-shell">
      <Link className="brand" href="/">
        <span className="brand-mark">DJ</span>
        DevJobs Vietnam
      </Link>
      <div className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Sửa tin tuyển dụng</p>
          <h1>Cập nhật thông tin vị trí "{job.title}"</h1>
          <p>Chỉnh sửa nội dung tin hoặc đóng tin khi đã tuyển đủ.</p>
        </div>
        <JobForm mode="edit" initialJob={job} />
      </div>
    </main>
  );
}