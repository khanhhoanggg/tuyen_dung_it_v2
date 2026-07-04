"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getStoredUser,
  listJobs,
  listSavedJobs,
  saveJob,
  unsaveJob,
  type Job,
  type User,
} from "@/lib/api";

const skillFilters = ["React", "Node.js", "Java", "DevOps", "Data", "Remote"];
const locationOptions = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Remote"];

export function JobBoard() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("all");
  const [skill, setSkill] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  // Lấy danh sách job đã lưu (chỉ khi là ứng viên đã đăng nhập)
  useEffect(() => {
    if (!user || user.role !== "candidate") return;
    listSavedJobs()
      .then((saved) => {
        setSavedIds(new Set(saved.map((item) => item.job._id)));
      })
      .catch(() => {
        // Bỏ qua lỗi lấy danh sách đã lưu, không chặn trang chính
      });
  }, [user]);

  // Lấy danh sách job theo bộ lọc hiện tại
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError("");

    listJobs({
      q: keyword || undefined,
      location: location === "all" ? undefined : location,
      skill: skill || undefined,
      limit: 12,
    })
      .then((result) => {
        if (!isCancelled) setJobs(result.jobs);
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Không thể tải việc làm");
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [keyword, location, skill]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setKeyword(String(form.get("keyword") || ""));
    setLocation(String(form.get("location") || "all"));
  }

  async function handleToggleSave(jobId: string) {
    if (!user) {
      window.alert("Bạn cần đăng nhập bằng tài khoản ứng viên để lưu việc.");
      return;
    }
    if (user.role !== "candidate") {
      window.alert("Chỉ tài khoản ứng viên mới lưu được việc làm.");
      return;
    }

    setSavingId(jobId);
    try {
      if (savedIds.has(jobId)) {
        await unsaveJob(jobId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await saveJob(jobId);
        setSavedIds((prev) => new Set(prev).add(jobId));
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không thể lưu việc làm");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">Tuyển dụng IT tập trung vào chất lượng</p>
          <h1>Tìm việc công nghệ phù hợp với năng lực và tốc độ phát triển của bạn.</h1>
          <p className="hero-copy">
            Khám phá việc làm IT đã được sắp xếp theo stack, mức lương, hình
            thức làm việc và độ phù hợp với hồ sơ.
          </p>
          <form className="search-panel" onSubmit={handleSearchSubmit}>
            <label>
              <span>Từ khóa</span>
              <input name="keyword" placeholder="Frontend, Backend, DevOps..." defaultValue={keyword} />
            </label>
            <label>
              <span>Địa điểm</span>
              <select name="location" defaultValue={location}>
                <option value="all">Tất cả</option>
                {locationOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Tìm việc</button>
          </form>
        </div>
      </section>

      <section className="section" id="jobs">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Việc làm nổi bật</p>
            <h2>Cơ hội đang tuyển hôm nay</h2>
          </div>
          <div className="filter-row" aria-label="Lọc kỹ năng">
            {skillFilters.map((item) => (
              <button
                key={item}
                type="button"
                className={skill === item ? "active" : ""}
                onClick={() => setSkill((prev) => (prev === item ? null : item))}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="form-message">Đang tải danh sách việc làm...</p>}
        {error && <p className="form-message error">{error}</p>}
        {!loading && !error && jobs.length === 0 && (
          <p className="form-message">Không tìm thấy việc làm phù hợp.</p>
        )}

        <div className="job-grid">
          {jobs.map((job) => (
            <article className="job-card" key={job._id}>
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
                {job.skills.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div className="job-actions">
                <Link href={`/jobs/${job._id}`}>Xem chi tiết</Link>
                <button
                  type="button"
                  disabled={savingId === job._id}
                  onClick={() => handleToggleSave(job._id)}
                >
                  {savedIds.has(job._id) ? "Đã lưu" : "Lưu việc"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}