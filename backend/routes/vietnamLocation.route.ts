import { Router } from "express";
import { listVietnamLocations } from "../controllers/vietnamLocation.controller";

const router = Router();

// Public - khong can dang nhap, de hien thi dropdown chon dia diem
router.get("/", listVietnamLocations);

export default router;