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
          Quay lai
        </Link>
      </header>
      <section className="job-detail-hero">
        <p className="eyebrow">{job.company}</p>
        <h1>{job.title}</h1>
        <div className="job-meta detail">
          <span>{job.location}</span>
          <span>{job.salary}</span>
          <span>{job.level}</span>
          <span>{job.type}</span>
        </div>
        <div className="tag-row">
          {job.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>
      <section className="detail-grid">
        <article>
          <h2>Mo ta cong viec</h2>
          <p>{job.summary}</p>
          <h2>Trach nhiem</h2>
          <ul>
            {job.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2>Yeu cau</h2>
          <ul>
            {job.requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <aside className="apply-panel">
          <h2>Ung tuyen vi tri nay</h2>
          <p>Gui ho so cua ban den nha tuyen dung va theo doi trang thai trong dashboard.</p>
          <button type="button">Ung tuyen ngay</button>
          <Link href="/register">Tao ho so ung vien</Link>
        </aside>
      </section>
    </main>
  );
}
