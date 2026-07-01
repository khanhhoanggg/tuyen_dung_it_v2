import Link from "next/link";
import { jobs } from "@/data/jobs";

const pipeline = [
  { label: "Ho so moi", value: 18 },
  { label: "Dang phong van", value: 7 },
  { label: "Da gui offer", value: 3 },
  { label: "Cho phan hoi", value: 11 },
];

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">DJ</span>
          DevJobs
        </Link>
        <nav>
          <a className="active" href="#overview">Tong quan</a>
          <a href="#jobs">Tin dang</a>
          <a href="#candidates">Ung vien</a>
          <a href="#settings">Cai dat</a>
        </nav>
      </aside>
      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Dashboard nha tuyen dung</p>
            <h1>Quan ly tin tuyen dung va pipeline ung vien</h1>
          </div>
          <button type="button">Dang tin moi</button>
        </div>
        <div className="metric-grid">
          {pipeline.map((item) => (
            <article className="metric-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
        <section className="dashboard-panel" id="jobs">
          <div className="panel-heading">
            <h2>Tin dang gan day</h2>
            <Link href="/">Xem website</Link>
          </div>
          <div className="table-like">
            {jobs.slice(0, 3).map((job) => (
              <div className="table-row" key={job.id}>
                <div>
                  <strong>{job.title}</strong>
                  <span>{job.location} - {job.type}</span>
                </div>
                <span>{job.salary}</span>
                <button type="button">Sua</button>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
