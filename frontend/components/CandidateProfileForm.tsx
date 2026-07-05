"use client";

import { useState } from "react";
import {
  updateMyCandidateProfile,
  uploadMyCv,
  type CandidateProfile,
  type Experience,
  type Education,
} from "@/lib/api";

type Props = {
  initialProfile: CandidateProfile | null;
};

function emptyExperience(): Experience {
  return { company: "", position: "", startDate: "", endDate: "", description: "" };
}

function emptyEducation(): Education {
  return { school: "", major: "", startDate: "", endDate: "" };
}

export function CandidateProfileForm({ initialProfile }: Props) {
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [headline, setHeadline] = useState(initialProfile?.headline || "");
  const [bio, setBio] = useState(initialProfile?.bio || "");
  const [skillsText, setSkillsText] = useState(
    (initialProfile?.skills || []).join(", ")
  );
  const [experiences, setExperiences] = useState<Experience[]>(
    initialProfile?.experiences?.length ? initialProfile.experiences : [emptyExperience()]
  );
  const [educations, setEducations] = useState<Education[]>(
    initialProfile?.educations?.length ? initialProfile.educations : [emptyEducation()]
  );

  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState(initialProfile?.cvUrl || "");
  const [cvOriginalName, setCvOriginalName] = useState(initialProfile?.cvOriginalName || "");
  const [cvStatus, setCvStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [cvMessage, setCvMessage] = useState("");

  function updateExperience(index: number, field: keyof Experience, value: string) {
    setExperiences((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    );
  }

  function updateEducation(index: number, field: keyof Education, value: string) {
    setEducations((prev) =>
      prev.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu))
    );
  }

  function addExperience() {
    setExperiences((prev) => [...prev, emptyExperience()]);
  }

  function removeExperience(index: number) {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  }

  function addEducation() {
    setEducations((prev) => [...prev, emptyEducation()]);
  }

  function removeEducation(index: number) {
    setEducations((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Bo qua cac dong kinh nghiem/hoc van chua dien gi
    const cleanExperiences = experiences.filter((e) => e.company.trim() && e.position.trim());
    const cleanEducations = educations.filter((e) => e.school.trim() && e.major.trim());

    try {
      await updateMyCandidateProfile({
        phone,
        headline,
        bio,
        skills,
        experiences: cleanExperiences,
        educations: cleanEducations,
      });
      setStatus("success");
      setMessage("Cập nhật hồ sơ thành công.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Không thể cập nhật hồ sơ.");
    }
  }

  async function handleCvUpload() {
    if (!cvFile) return;
    setCvStatus("loading");
    setCvMessage("");
    try {
      const updated = await uploadMyCv(cvFile);
      setCvUrl(updated.cvUrl || "");
      setCvOriginalName(updated.cvOriginalName || "");
      setCvStatus("success");
      setCvMessage("Upload CV thành công.");
      setCvFile(null);
    } catch (error) {
      setCvStatus("error");
      setCvMessage(error instanceof Error ? error.message : "Không thể upload CV.");
    }
  }

  return (
    <div className="profile-page">
      <form className="auth-form job-form" onSubmit={handleSubmit}>
        <h2>Hồ sơ ứng viên</h2>

        <label>
          Số điện thoại
          <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
        </label>

        <label>
          Chức danh mong muốn
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="VD: Backend Developer 3 năm kinh nghiệm"
            maxLength={150}
          />
        </label>

        <label>
          Giới thiệu bản thân
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={2000}
          />
        </label>

        <label>
          Kỹ năng (phân cách bằng dấu phẩy)
          <input
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="React, Node.js, MongoDB"
          />
        </label>

        <h3>Kinh nghiệm làm việc</h3>
        {experiences.map((exp, index) => (
          <div key={index} className="dynamic-item">
            <label>
              Công ty
              <input
                value={exp.company}
                onChange={(e) => updateExperience(index, "company", e.target.value)}
              />
            </label>
            <label>
              Vị trí
              <input
                value={exp.position}
                onChange={(e) => updateExperience(index, "position", e.target.value)}
              />
            </label>
            <label>
              Ngày bắt đầu
              <input
                type="date"
                value={exp.startDate ? exp.startDate.slice(0, 10) : ""}
                onChange={(e) => updateExperience(index, "startDate", e.target.value)}
              />
            </label>
            <label>
              Ngày kết thúc (để trống nếu đang làm)
              <input
                type="date"
                value={exp.endDate ? exp.endDate.slice(0, 10) : ""}
                onChange={(e) => updateExperience(index, "endDate", e.target.value)}
              />
            </label>
            <label>
              Mô tả công việc
              <textarea
                value={exp.description}
                onChange={(e) => updateExperience(index, "description", e.target.value)}
                rows={2}
              />
            </label>
            <button type="button" onClick={() => removeExperience(index)}>
              Xóa kinh nghiệm này
            </button>
          </div>
        ))}
        <button type="button" onClick={addExperience}>
          + Thêm kinh nghiệm
        </button>

        <h3>Học vấn</h3>
        {educations.map((edu, index) => (
          <div key={index} className="dynamic-item">
            <label>
              Trường
              <input
                value={edu.school}
                onChange={(e) => updateEducation(index, "school", e.target.value)}
              />
            </label>
            <label>
              Chuyên ngành
              <input
                value={edu.major}
                onChange={(e) => updateEducation(index, "major", e.target.value)}
              />
            </label>
            <label>
              Ngày bắt đầu
              <input
                type="date"
                value={edu.startDate ? edu.startDate.slice(0, 10) : ""}
                onChange={(e) => updateEducation(index, "startDate", e.target.value)}
              />
            </label>
            <label>
              Ngày kết thúc (để trống nếu đang học)
              <input
                type="date"
                value={edu.endDate ? edu.endDate.slice(0, 10) : ""}
                onChange={(e) => updateEducation(index, "endDate", e.target.value)}
              />
            </label>
            <button type="button" onClick={() => removeEducation(index)}>
              Xóa học vấn này
            </button>
          </div>
        ))}
        <button type="button" onClick={addEducation}>
          + Thêm học vấn
        </button>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Đang lưu..." : "Lưu hồ sơ"}
        </button>
        {message && (
          <p className={`form-message ${status === "error" ? "error" : ""}`}>{message}</p>
        )}
      </form>

      <div className="auth-form job-form">
        <h2>CV của tôi</h2>
        {cvUrl ? (
          <p>
            CV hiện tại:{" "}
            <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${cvUrl}`} target="_blank" rel="noreferrer">
              {cvOriginalName || "Xem CV"}
            </a>
          </p>
        ) : (
          <p>Bạn chưa upload CV.</p>
        )}

        <label>
          Chọn file CV mới (PDF hoặc Word, tối đa 5MB)
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
          />
        </label>

        <button type="button" onClick={handleCvUpload} disabled={!cvFile || cvStatus === "loading"}>
          {cvStatus === "loading" ? "Đang upload..." : "Upload CV"}
        </button>
        {cvMessage && (
          <p className={`form-message ${cvStatus === "error" ? "error" : ""}`}>{cvMessage}</p>
        )}
      </div>
    </div>
  );
}