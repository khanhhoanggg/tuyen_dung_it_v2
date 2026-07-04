import Link from "next/link";
import { AccountNav } from "@/components/AccountNav";
import { JobBoard } from "@/components/JobBoard";
import { featuredCompanies, stats } from "@/data/jobs";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">DJ</span>
          DevJobs Vietnam
        </Link>
        <nav className="nav-links" aria-label="Điều hướng chính">
          <a href="#jobs">Việc làm</a>
          <a href="#companies">Công ty</a>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <AccountNav />
      </header>

      <JobBoard />

      <section className="stats-band" aria-label="Thống kê nền tảng">
        {stats.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="section company-section" id="companies">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Nhà tuyển dụng</p>
            <h2>Công ty đang mở rộng đội ngũ IT</h2>
          </div>
          <Link className="text-link" href="/dashboard">
            Đăng tin tuyển dụng
          </Link>
        </div>
        <div className="company-grid">
          {featuredCompanies.map((company) => (
            <article className="company-card" key={company.name}>
              <div className="company-logo">{company.initials}</div>
              <h3>{company.name}</h3>
              <p>{company.description}</p>
              <span>{company.openings} vị trí đang tuyển</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}