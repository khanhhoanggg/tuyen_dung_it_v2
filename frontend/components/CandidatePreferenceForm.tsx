"use client";

import { useState } from "react";
import { FormEvent } from "react";
import {
  updateMyCandidatePreference,
  type CandidatePreference,
  type Job,
} from "@/lib/api";

type Props = {
  initialPreference: CandidatePreference | null;
};

const levels: Job["level"][] = ["Intern", "Fresher", "Junior", "Middle", "Senior", "Lead"];
const types: Job["type"][] = ["Onsite", "Hybrid", "Remote"];

function toCommaList(value?: string[]) {
  return (value || []).join(", ");
}

function fromCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CandidatePreferenceForm({ initialPreference }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);

    const minSalaryRaw = String(form.get("minSalary") || "");
    const maxSalaryRaw = String(form.get("maxSalary") || "");
    const desiredLevelRaw = String(form.get("desiredLevel") || "");
    const desiredTypeRaw = String(form.get("desiredType") || "");

    try {
      await updateMyCandidatePreference({
        desiredSkills: fromCommaList(String(form.get("desiredSkills") || "")),
        desiredLocations: fromCommaList(String(form.get("desiredLocations") || "")),
        desiredLevel: desiredLevelRaw ? (desiredLevelRaw as Job["level"]) : undefined,
        desiredType: desiredTypeRaw ? (desiredTypeRaw as Job["type"]) : undefined,
        minSalary: minSalaryRaw ? Number(minSalaryRaw) : undefined,
        maxSalary: maxSalaryRaw ? Number(maxSalaryRaw) : undefined,
        isOpenToWork: form.get("isOpenToWork") === "on",
      });
      setStatus("success");
      setMessage("Cập nhật tiêu chí thành công.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Không thể cập nhật tiêu chí.");
    }
  }

  return (
    <form className="auth-form job-form" onSubmit={handleSubmit}>
      <h2>Tiêu chí nhận việc làm phù hợp</h2>

      <label>
        <input
          type="checkbox"
          name="isOpenToWork"
          defaultChecked={initialPreference?.isOpenToWork ?? true}
        />
        {" "}Đang tìm việc / sẵn sàng nhận cơ hội mới
      </label>

      <label>
        Ngành nghề / kỹ năng quan tâm (phân cách bằng dấu phẩy)
        <input
          name="desiredSkills"
          defaultValue={toCommaList(initialPreference?.desiredSkills)}
          placeholder="Backend, React, DevOps"
        />
      </label>

      <label>
        Địa điểm mong muốn (phân cách bằng dấu phẩy)
        <input
          name="desiredLocations"
          defaultValue={toCommaList(initialPreference?.desiredLocations)}
          placeholder="Hà Nội, Đà Nẵng, Remote"
        />
      </label>

      <label>
        Cấp bậc mong muốn
        <select name="desiredLevel" defaultValue={initialPreference?.desiredLevel || ""}>
          <option value="">-- Không yêu cầu --</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </label>

      <label>
        Hình thức làm việc mong muốn
        <select name="desiredType" defaultValue={initialPreference?.desiredType || ""}>
          <option value="">-- Không yêu cầu --</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label>
        Mức lương mong muốn tối thiểu (triệu)
        <input
          type="number"
          name="minSalary"
          min={0}
          defaultValue={initialPreference?.minSalary ?? ""}
        />
      </label>

      <label>
        Mức lương mong muốn tối đa (triệu)
        <input
          type="number"
          name="maxSalary"
          min={0}
          defaultValue={initialPreference?.maxSalary ?? ""}
        />
      </label>

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Đang lưu..." : "Lưu tiêu chí"}
      </button>
      {message && (
        <p className={`form-message ${status === "error" ? "error" : ""}`}>{message}</p>
      )}
    </form>
  );
}