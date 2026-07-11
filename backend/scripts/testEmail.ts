import dotenv from "dotenv";
import { sendVerificationEmail } from "../services/email.service";

dotenv.config();

async function run() {
  console.log("Testing email sending with configuration:");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
  
  try {
    const testEmail = process.env.SMTP_USER || "userknh518@gmail.com";
    console.log(`Attempting to send verification email to: ${testEmail}...`);
    await sendVerificationEmail(testEmail, "test-token-12345");
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending test email:", error);
  }
  process.exit(0);
}

run();
