import Link from "next/link";
import { jobs } from "@/data/jobs";

const pipeline = [
  { label: "Hồ sơ mới", value: 18 },
  { label: "Đang phỏng vấn", value: 7 },
  { label: "Đã gửi offer", value: 3 },
  { label: "Chờ phản hồi", value: 11 },
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
          <a className="active" href="#overview">
            Tổng quan
          </a>
          <a href="#jobs">Tin đăng</a>
          <a href="#candidates">Ứng viên</a>
          <a href="#settings">Cài đặt</a>
        </nav>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Dashboard nhà tuyển dụng</p>
            <h1>Quản lý tin tuyển dụng và pipeline ứng viên</h1>
          </div>
          <button type="button" className="primary-button">
            Đăng tin mới
          </button>
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
            <h2>Tin đăng gần đây</h2>
            <Link href="/">Xem website</Link>
          </div>
          <div className="table-like">
            {jobs.slice(0, 3).map((job) => (
              <div className="table-row" key={job.id}>
                <div>
                  <strong>{job.title}</strong>
                  <span>
                    {job.location} - {job.type}
                  </span>
                </div>
                <span>{job.salary}</span>
                <button type="button" className="secondary-button">
                  Sửa
                </button>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}