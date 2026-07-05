"use client";

import { useState } from "react";
import { FormEvent } from "react";
import {
  updateMyCompanyProfile,
  type CompanyProfile,
  type CompanySize,
} from "@/lib/api";

type Props = {
  initialProfile: CompanyProfile | null;
};

const companySizes: CompanySize[] = ["1-10", "11-50", "51-200", "201-500", "500+"];

export function CompanyProfileForm({ initialProfile }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const companyName = String(form.get("companyName") || "").trim();

    if (!companyName) {
      setStatus("error");
      setMessage("Vui lòng nhập tên công ty.");
      return;
    }

    const companySizeRaw = String(form.get("companySize") || "");
    const foundedYearRaw = String(form.get("foundedYear") || "");

    try {
      await updateMyCompanyProfile({
        companyName,
        logoUrl: String(form.get("logoUrl") || "").trim() || undefined,
        website: String(form.get("website") || "").trim() || undefined,
        industry: String(form.get("industry") || "").trim() || undefined,
        companySize: companySizeRaw ? (companySizeRaw as CompanySize) : undefined,
        description: String(form.get("description") || "").trim() || undefined,
        foundedYear: foundedYearRaw ? Number(foundedYearRaw) : undefined,
      });
      setStatus("success");
      setMessage("Cập nhật hồ sơ công ty thành công.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Không thể cập nhật hồ sơ công ty.");
    }
  }

  return (
    <form className="auth-form job-form" onSubmit={handleSubmit}>
      <h2>Hồ sơ công ty</h2>

      <label>
        Tên công ty *
        <input
          name="companyName"
          required
          minLength={2}
          maxLength={150}
          defaultValue={initialProfile?.companyName || ""}
          placeholder="Công ty TNHH ABC Tech"
        />
      </label>

      <label>
        Logo (URL ảnh)
        <input name="logoUrl" defaultValue={initialProfile?.logoUrl || ""} placeholder="https://..." />
      </label>

      <label>
        Website
        <input name="website" defaultValue={initialProfile?.website || ""} placeholder="https://congty.com" />
      </label>

      <label>
        Ngành nghề
        <input name="industry" maxLength={100} defaultValue={initialProfile?.industry || ""} placeholder="Công nghệ thông tin" />
      </label>

      <label>
        Quy mô công ty
        <select name="companySize" defaultValue={initialProfile?.companySize || ""}>
          <option value="">-- Chọn quy mô --</option>
          {companySizes.map((size) => (
            <option key={size} value={size}>
              {size} nhân viên
            </option>
          ))}
        </select>
      </label>

      <label>
        Năm thành lập
        <input
          type="number"
          name="foundedYear"
          min={1900}
          max={new Date().getFullYear()}
          defaultValue={initialProfile?.foundedYear ?? ""}
        />
      </label>

      <label>
        Mô tả công ty
        <textarea
          name="description"
          rows={5}
          maxLength={3000}
          defaultValue={initialProfile?.description || ""}
          placeholder="Giới thiệu ngắn về công ty, văn hóa, phúc lợi..."
        />
      </label>

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Đang lưu..." : "Lưu hồ sơ công ty"}
      </button>
      {message && <p className={`form-message ${status === "error" ? "error" : ""}`}>{message}</p>}
    </form>
  );
}