import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true nếu dùng port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  const activeTransporter = getTransporter();

  await activeTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Xac thuc email - DevJobs Vietnam",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Xac thuc dia chi email cua ban</h2>
        <p>Cam on ban da dang ky tai khoan tren DevJobs Vietnam. Vui long bam vao nut ben duoi de xac thuc email:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
          Xac thuc email
        </a>
        <p>Hoac copy link sau vao trinh duyet:</p>
        <p>${verifyUrl}</p>
        <p>Link nay se het han sau 24 gio.</p>
      </div>
    `,
  });
};

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const activeTransporter = getTransporter();

  await activeTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Khoi phuc mat khau - DevJobs Vietnam",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Yeu cau khoi phuc mat khau</h2>
        <p>Ban nhan duoc email nay vi ban hoac ai do da yeu cau khoi phuc mat khau cho tai khoan tren DevJobs Vietnam.</p>
        <p>Vui long bam vao nut ben duoi de tien hanh khoi phuc mat khau:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
          Khoi phuc mat khau
        </a>
        <p>Hoac copy link sau vao trinh duyet:</p>
        <p>${resetUrl}</p>
        <p>Link nay se het han sau 1 gio.</p>
        <p>Neu ban khong yeu cau khoi phuc mat khau, vui long bo qua email nay.</p>
      </div>
    `,
  });
};