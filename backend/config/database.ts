import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    const mongoURI = process.env.DATABASE_URL;
    if (!mongoURI) {
      console.error("Chua cau hinh DATABASE_URL trong file .env");
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log("Ket noi database thanh cong.");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
