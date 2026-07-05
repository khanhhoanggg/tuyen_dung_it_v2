import dotenv from "dotenv";
import { connectDatabase } from "../config/database";
import VietnamLocation from "../models/vietnamLocation.model";

dotenv.config();

const LOCATIONS = [
  { name: "Hà Nội", region: "Bac" as const },
  { name: "Hải Phòng", region: "Bac" as const },
  { name: "Bắc Ninh", region: "Bac" as const },
  { name: "Đà Nẵng", region: "Trung" as const },
  { name: "Huế", region: "Trung" as const },
  { name: "Nghệ An", region: "Trung" as const },
  { name: "Hồ Chí Minh", region: "Nam" as const },
  { name: "Cần Thơ", region: "Nam" as const },
  { name: "Bình Dương", region: "Nam" as const },
  { name: "Remote", region: "Nam" as const },
];

async function seedLocations() {
  await connectDatabase();

  for (const loc of LOCATIONS) {
    await VietnamLocation.findOneAndUpdate(
      { name: loc.name },
      loc,
      { upsert: true }
    );
  }

  console.log(`Da seed ${LOCATIONS.length} dia danh.`);
  process.exit(0);
}

seedLocations().catch((err) => {
  console.error("Seed locations error:", err);
  process.exit(1);
});