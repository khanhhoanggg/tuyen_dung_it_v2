import Link from "next/link";
import { featuredCompanies, jobs, stats } from "@/data/jobs";

const skillFilters = ["React", "Node.js", "Java", "DevOps", "Data", "Remote"];

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
        <div className="header-actions">
          <Link className="ghost-button" href="/login">
            Đăng nhập
          </Link>
          <Link className="primary-button" href="/register">
            Đăng ký
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">Tuyển dụng IT tập trung vào chất lượng</p>
          <h1>Tìm việc công nghệ phù hợp với năng lực và tốc độ phát triển của bạn.</h1>
          <p className="hero-copy">
            Khám phá việc làm IT đã được sắp xếp theo stack, mức lương, hình
            thức làm việc và độ phù hợp với hồ sơ.
          </p>
          <form className="search-panel">
            <label>
              <span>Từ khóa</span>
              <input placeholder="Frontend, Backend, DevOps..." />
            </label>
            <label>
              <span>Địa điểm</span>
              <select defaultValue="all">
                <option value="all">Tất cả</option>
                <option>Hà Nội</option>
                <option>Hồ Chí Minh</option>
                <option>Đà Nẵng</option>
                <option>Remote</option>
              </select>
            </label>
            <button type="submit">Tìm việc</button>
          </form>
        </div>
      </section>

      <section className="stats-band" aria-label="Thống kê nền tảng">
        {stats.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="section" id="jobs">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Việc làm nổi bật</p>
            <h2>Cơ hội đang tuyển hôm nay</h2>
          </div>
          <div className="filter-row" aria-label="Lọc kỹ năng">
            {skillFilters.map((skill) => (
              <button key={skill} type="button">
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="job-grid">
          {jobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-card-top">
                <div>
                  <p>{job.company}</p>
                  <h3>{job.title}</h3>
                </div>
                <span>{job.type}</span>
              </div>
              <div className="job-meta">
                <span>{job.location}</span>
                <span>{job.salary}</span>
                <span>{job.level}</span>
              </div>
              <p className="job-summary">{job.summary}</p>
              <div className="tag-row">
                {job.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
              <div className="job-actions">
                <Link href={`/jobs/${job.id}`}>Xem chi tiết</Link>
                <button type="button">Lưu việc</button>
              </div>
            </article>
          ))}
        </div>
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