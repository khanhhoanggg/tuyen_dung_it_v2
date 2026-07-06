"use client";

import { useState } from "react";
import { signOffer, declineOffer, type Offer } from "@/lib/api";

type OfferDetailModalProps = {
  offer: Offer;
  onClose: () => void;
  onActionSuccess: () => void;
};

export function OfferDetailModal({ offer, onClose, onActionSuccess }: OfferDetailModalProps) {
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);

  const statusLabels: Record<Offer["status"], string> = {
    draft: "Bản nháp",
    sent: "Đã nhận",
    accepted: "Đã đồng ý & ký nhận",
    declined: "Đã từ chối",
    withdrawn: "Đã rút lại",
  };

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!signature.trim()) return;
    if (!window.confirm("Bạn có chắc muốn ký nhận và đồng ý thư mời làm việc này?")) return;

    setLoading(true);
    try {
      await signOffer(offer._id, signature.trim());
      window.alert("Ký nhận offer thành công!");
      onActionSuccess();
      onClose();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Ký nhận thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecline() {
    if (!window.confirm("Bạn có chắc muốn từ chối thư mời làm việc này?")) return;

    setLoading(true);
    try {
      await declineOffer(offer._id);
      window.alert("Đã phản hồi từ chối offer.");
      onActionSuccess();
      onClose();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  }

  const jobTitle = typeof offer.job === "string" ? "Công việc" : offer.job.title;
  const companyName = typeof offer.job === "string" ? "" : offer.job.company;

  return (
    <div className="modal-backdrop">
      <div className="modal-content offer-modal">
        <div className="modal-header">
          <h3>Chi tiết Thư mời làm việc (Offer)</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="offer-body">
          <div className="info-section">
            <p><strong>Vị trí:</strong> {offer.position || jobTitle}</p>
            <p><strong>Công ty:</strong> {companyName}</p>
            <p><strong>Mức lương:</strong> <span className="salary-highlight">{offer.salary}</span></p>
            <p><strong>Ngày bắt đầu:</strong> {new Date(offer.startDate).toLocaleDateString("vi-VN")}</p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <span className={`status-badge status-${offer.status}`}>{statusLabels[offer.status]}</span>
            </p>
          </div>

          <div className="offer-letter-content">
            <h4>Nội dung chi tiết thư mời:</h4>
            <div className="letter-text">{offer.content || "Không có nội dung bổ sung."}</div>
          </div>

          {offer.status === "accepted" && (
            <div className="signature-box">
              <p><strong>Chữ ký ứng viên:</strong> <span className="sig-handwritten">{offer.candidateSignature}</span></p>
              <p><strong>Ngày ký:</strong> {offer.signedAt ? new Date(offer.signedAt).toLocaleString("vi-VN") : ""}</p>
            </div>
          )}

          {offer.status === "sent" && (
            <div className="sign-action-area">
              <hr />
              <form onSubmit={handleSign} className="sign-form">
                <label>
                  Ký nhận bằng cách nhập Họ và Tên của bạn:
                  <input
                    type="text"
                    placeholder="Nhập họ và tên..."
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    required
                    disabled={loading}
                  />
                </label>
                <div className="button-group">
                  <button type="submit" className="primary-button" disabled={loading}>
                    Đồng ý nhận việc (Ký nhận)
                  </button>
                  <button type="button" className="danger-button" onClick={handleDecline} disabled={loading}>
                    Từ chối
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
