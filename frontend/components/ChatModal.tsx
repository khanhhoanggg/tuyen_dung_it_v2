"use client";

import { useEffect, useState, useRef } from "react";
import { getConversation, sendMessage, type Message, type User } from "@/lib/api";

type ChatModalProps = {
  applicationId: string;
  title: string;
  currentUser: User;
  onClose: () => void;
};

export function ChatModal({ applicationId, title, currentUser, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  async function loadConversation() {
    try {
      const data = await getConversation(applicationId);
      setMessages(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Không thể tải tin nhắn");
    } finally {
      setLoading(false);
    }
  }

  // Tự động tải lại tin nhắn mỗi 5 giây (polling)
  useEffect(() => {
    loadConversation();
    const interval = setInterval(loadConversation, 5000);
    return () => clearInterval(interval);
  }, [applicationId]);

  // Tự động cuộn xuống cuối khung chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      const newMsg = await sendMessage(applicationId, inputText.trim());
      setMessages((prev) => [...prev, newMsg]);
      setInputText("");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  }

  const currentUserId = currentUser.id || (currentUser as any)._id;

  return (
    <div className="modal-backdrop">
      <div className="modal-content chat-modal">
        <div className="modal-header">
          <h3>Trò chuyện với {title}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="chat-messages">
          {loading && messages.length === 0 && <p className="chat-status">Đang tải cuộc trò chuyện...</p>}
          {error && <p className="chat-status error">{error}</p>}
          {messages.length === 0 && !loading && <p className="chat-status">Bắt đầu cuộc hội thoại bằng cách gửi tin nhắn!</p>}
          
          {messages.map((msg) => {
            const isMe = typeof msg.sender === "string" 
              ? msg.sender === currentUserId 
              : ((msg.sender as any)._id === currentUserId || (msg.sender as any).id === currentUserId);
            const senderName = typeof msg.sender === "string"
              ? (isMe ? "Bạn" : "Đang tải...")
              : msg.sender.fullName;

            return (
              <div key={msg._id} className={`chat-row ${isMe ? "right" : "left"}`}>
                <div className="chat-bubble-container">
                  <span className="chat-sender-name">{senderName}</span>
                  <div className="chat-bubble">{msg.content}</div>
                  <span className="chat-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-area">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            required
          />
          <button type="submit" className="primary-button" disabled={sending}>
            {sending ? "Đang gửi" : "Gửi"}
          </button>
        </form>
      </div>
    </div>
  );
}
