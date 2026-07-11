import dotenv from "dotenv";
import { connectDatabase } from "../config/database";
import User from "../models/user.model";

dotenv.config();

async function run() {
  await connectDatabase();

  const emailsToVerify = ["userknh518@gmail.com", "company-demo@devjobs.vn"];

  for (const email of emailsToVerify) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      console.log(`Successfully verified email for user: ${email}`);
    } else {
      console.log(`User not found: ${email}`);
    }
  }

  process.exit(0);
}

run().catch((err) => {
  console.error("Error running verification script:", err);
  process.exit(1);
});
