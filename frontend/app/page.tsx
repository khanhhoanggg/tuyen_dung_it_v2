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
        <nav className="nav-links" aria-label="Dieu huong chinh">
          <a href="#jobs">Viec lam</a>
          <a href="#companies">Cong ty</a>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <div className="header-actions">
          <Link className="ghost-button" href="/login">
            Dang nhap
          </Link>
          <Link className="primary-button" href="/register">
            Dang ky
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">Tuyen dung IT tap trung vao chat luong</p>
          <h1>Tim viec cong nghe phu hop voi nang luc va toc do phat trien cua ban.</h1>
          <p className="hero-copy">
            Kham pha viec lam IT da duoc sap xep theo stack, muc luong, hinh thuc lam viec va do phu hop voi ho so.
          </p>
          <form className="search-panel">
            <label>
              <span>Tu khoa</span>
              <input placeholder="Frontend, Backend, DevOps..." />
            </label>
            <label>
              <span>Dia diem</span>
              <select defaultValue="all">
                <option value="all">Tat ca</option>
                <option>Ha Noi</option>
                <option>Ho Chi Minh</option>
                <option>Da Nang</option>
                <option>Remote</option>
              </select>
            </label>
            <button type="submit">Tim viec</button>
          </form>
        </div>
      </section>

      <section className="stats-band" aria-label="Thong ke nen tang">
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
            <p className="eyebrow">Viec lam noi bat</p>
            <h2>Co hoi dang tuyen hom nay</h2>
          </div>
          <div className="filter-row" aria-label="Loc ky nang">
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
                <Link href={`/jobs/${job.id}`}>Xem chi tiet</Link>
                <button type="button">Luu viec</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section company-section" id="companies">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Nha tuyen dung</p>
            <h2>Cong ty dang mo rong doi ngu IT</h2>
          </div>
          <Link className="text-link" href="/dashboard">
            Dang tin tuyen dung
          </Link>
        </div>
        <div className="company-grid">
          {featuredCompanies.map((company) => (
            <article className="company-card" key={company.name}>
              <div className="company-logo">{company.initials}</div>
              <h3>{company.name}</h3>
              <p>{company.description}</p>
              <span>{company.openings} vi tri dang tuyen</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
