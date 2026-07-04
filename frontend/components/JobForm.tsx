"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createJob,
  updateJob,
  type Job,
  type JobInput,
} from "@/lib/api";

type JobFormProps = {
  mode: "create" | "edit";
  initialJob?: Job;
};

const levels: Job["level"][] = ["Intern", "Fresher", "Junior", "Middle", "Senior", "Lead"];
const types: Job["type"][] = ["Onsite", "Hybrid", "Remote"];

function toLines(value?: string[]) {
  return (value || []).join("\n");
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toCommaList(value?: string[]) {
  return (value || []).join(", ");
}

function fromCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function JobForm({ mode, initialJob }: JobFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("loading");
    setMessage("");

    const payload: JobInput = {
      title: String(form.get("title") || ""),
      company: String(form.get("company") || ""),
      location: String(form.get("location") || ""),
      salary: String(form.get("salary") || ""),
      level: String(form.get("level") || "Middle") as Job["level"],
      type: String(form.get("type") || "Onsite") as Job["type"],
      summary: String(form.get("summary") || ""),
      skills: fromCommaList(String(form.get("skills") || "")),
      responsibilities: fromLines(String(form.get("responsibilities") || "")),
      requirements: fromLines(String(form.get("requirements") || "")),
      status: (String(form.get("status") || "open") as Job["status"]) || "open",
    };

    try {
      if (mode === "create") {
        await createJob(payload);
      } else if (initialJob) {
        await updateJob(initialJob._id, payload);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Không thể lưu tin tuyển dụng.");
    }
  }

  return (
    <form className="auth-form job-form" onSubmit={handleSubmit}>
      <h2>{mode === "create" ? "Đăng tin tuyển dụng mới" : "Sửa tin tuyển dụng"}</h2>

      <label>
        Tên vị trí
        <input name="title" defaultValue={initialJob?.title} required minLength={3} maxLength={120} />
      </label>

      <label>
        Tên công ty
        <input name="company" defaultValue={initialJob?.company} required minLength={2} maxLength={120} />
      </label>

      <label>
        Địa điểm
        <input name="location" defaultValue={initialJob?.location} required maxLength={120} />
      </label>

      <label>
        Mức lương
        <input name="salary" defaultValue={initialJob?.salary} required placeholder="VD: 30-45 triệu" maxLength={60} />
      </label>

      <label>
        Cấp bậc
        <select name="level" defaultValue={initialJob?.level || "Middle"}>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </label>

      <label>
        Hình thức làm việc
        <select name="type" defaultValue={initialJob?.type || "Onsite"}>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label>
        Mô tả công việc
        <textarea
          name="summary"
          defaultValue={initialJob?.summary}
          required
          minLength={10}
          maxLength={2000}
          rows={4}
        />
      </label>

      <label>
        Kỹ năng (phân cách bằng dấu phẩy)
        <input
          name="skills"
          defaultValue={toCommaList(initialJob?.skills)}
          placeholder="React, TypeScript, Next.js"
        />
      </label>

      <label>
        Trách nhiệm (mỗi dòng một mục)
        <textarea
          name="responsibilities"
          defaultValue={toLines(initialJob?.responsibilities)}
          rows={4}
        />
      </label>

      <label>
        Yêu cầu (mỗi dòng một mục)
        <textarea
          name="requirements"
          defaultValue={toLines(initialJob?.requirements)}
          rows={4}
        />
      </label>

      {mode === "edit" && (
        <label>
          Trạng thái tin
          <select name="status" defaultValue={initialJob?.status || "open"}>
            <option value="open">Đang mở</option>
            <option value="closed">Đã đóng</option>
          </select>
        </label>
      )}

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Đang lưu..." : mode === "create" ? "Đăng tin" : "Lưu thay đổi"}
      </button>
      {message && <p className="form-message error">{message}</p>}
    </form>
  );
}