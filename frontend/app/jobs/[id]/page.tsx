import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountNav } from "@/components/AccountNav";
import { ApplyPanel } from "@/components/ApplyPanel";
import { getJob } from "@/lib/api";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;

  const job = await getJob(id).catch(() => null);

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
        <AccountNav />
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

        <ApplyPanel jobId={job._id} />
      </section>
    </main>
  );
}