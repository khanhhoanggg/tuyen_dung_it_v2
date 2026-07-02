import Link from "next/link";
import { notFound } from "next/navigation";
import { jobs } from "@/data/jobs";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = jobs.find((item) => item.id === id);

  if (!job) {
    notFound();
  }

  return (
    <main className="detail-page">
      <header className="site-header compact">
        <Link className="brand" href="/">
          <span className="brand-mark">DJ</span>
          DevJobs Vietnam
        </Link>
        <Link className="ghost-button" href="/">
          ← Quay lại
        </Link>
      </header>

      <section className="job-detail-hero">
        <p className="eyebrow">{job.company}</p>
        <h1>{job.title}</h1>
        <div className="job-meta detail">
          <span>📍 {job.location}</span>
          <span>💰 {job.salary}</span>
          <span>🧑‍💻 {job.level}</span>
          <span>🕒 {job.type}</span>
        </div>
        <div className="tag-row">
          {job.skills.map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="detail-grid">
        <article className="job-content">
          <div className="content-block">
            <h2>Mô tả công việc</h2>
            <p>{job.summary}</p>
          </div>

          <div className="content-block">
            <h2>Trách nhiệm</h2>
            <ul>
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="content-block">
            <h2>Yêu cầu</h2>
            <ul>
              {job.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </article>

        <aside className="apply-panel">
          <h2>Ứng tuyển vị trí này</h2>
          <p>
            Gửi hồ sơ của bạn đến nhà tuyển dụng và theo dõi trạng thái ứng
            tuyển trong dashboard cá nhân.
          </p>
          <button type="button" className="primary-button">
            Ứng tuyển ngay
          </button>
          <Link href="/register" className="secondary-link">
            Tạo hồ sơ ứng viên
          </Link>
        </aside>
      </section>
    </main>
  );
}