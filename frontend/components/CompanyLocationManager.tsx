"use client";

import { useEffect, useState } from "react";
import { FormEvent } from "react";
import {
  addMyCompanyLocation,
  deleteMyCompanyLocation,
  listVietnamLocations,
  type CompanyLocation,
  type VietnamLocation,
} from "@/lib/api";

type Props = {
  initialLocations: CompanyLocation[];
};

export function CompanyLocationManager({ initialLocations }: Props) {
  const [locations, setLocations] = useState<CompanyLocation[]>(initialLocations);
  const [provinces, setProvinces] = useState<VietnamLocation[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    listVietnamLocations()
      .then(setProvinces)
      .catch(() => setMessage("Không thể tải danh mục tỉnh/thành."))
      .finally(() => setLoadingProvinces(false));
  }, []);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const vietnamLocation = String(form.get("vietnamLocation") || "");

    if (!vietnamLocation) {
      setStatus("error");
      setMessage("Vui lòng chọn tỉnh/thành.");
      return;
    }

    try {
      const created = await addMyCompanyLocation({
        vietnamLocation,
        addressDetail: String(form.get("addressDetail") || "").trim() || undefined,
        isHeadquarters: form.get("isHeadquarters") === "on",
      });
      setLocations((prev) => [...prev, created]);
      setStatus("success");
      setMessage("Thêm địa điểm thành công.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Không thể thêm địa điểm.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Bạn có chắc muốn xóa địa điểm này?")) return;
    try {
      await deleteMyCompanyLocation(id);
      setLocations((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Không thể xóa địa điểm.");
    }
  }

  return (
    <>
      <form className="auth-form job-form" onSubmit={handleAdd}>
        <h2>Thêm địa điểm làm việc</h2>

        <label>
          Tỉnh/Thành phố *
          <select name="vietnamLocation" required disabled={loadingProvinces}>
            <option value="">{loadingProvinces ? "Đang tải..." : "-- Chọn tỉnh/thành --"}</option>
            {provinces.map((province) => (
              <option key={province._id} value={province._id}>
                {province.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Địa chỉ chi tiết
          <input name="addressDetail" maxLength={300} placeholder="Số 123, đường ABC, quận XYZ" />
        </label>

        <label>
          <input type="checkbox" name="isHeadquarters" /> Đây là trụ sở chính
        </label>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Đang thêm..." : "Thêm địa điểm"}
        </button>
        {message && <p className={`form-message ${status === "error" ? "error" : ""}`}>{message}</p>}
      </form>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <h2>Địa điểm đã thêm ({locations.length})</h2>
        </div>
        <div className="table-like">
          {locations.length === 0 && <p className="form-message">Bạn chưa thêm địa điểm làm việc nào.</p>}
          {locations.map((location) => (
            <div className="table-row" key={location._id}>
              <div>
                <strong>
                  {location.vietnamLocation.name}
                  {location.isHeadquarters ? " (Trụ sở chính)" : ""}
                </strong>
                <span>{location.addressDetail || "Chưa có địa chỉ chi tiết"}</span>
              </div>
              <div className="row-actions">
                <button type="button" onClick={() => handleDelete(location._id)}>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}