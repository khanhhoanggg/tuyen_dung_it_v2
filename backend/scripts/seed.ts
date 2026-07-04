import dotenv from "dotenv";
import { connectDatabase } from "../config/database";
import User from "../models/user.model";
import Job from "../models/job.model";
import { hashPassword } from "../services/auth.service";

dotenv.config();

const DEMO_COMPANY = {
  fullName: "Demo Company Admin",
  email: "company-demo@devjobs.vn",
  password: "Demo123!@#",
  role: "company" as const,
};

const DEMO_JOBS = [
  {
    title: "Frontend Engineer React",
    company: "NovaTech Labs",
    location: "Hồ Chí Minh",
    salary: "30-45 triệu",
    level: "Middle" as const,
    type: "Hybrid" as const,
    summary:
      "Xây dựng dashboard SaaS cho khách hàng doanh nghiệp, tập trung vào hiệu năng và trải nghiệm người dùng.",
    skills: ["React", "TypeScript", "Next.js"],
    responsibilities: [
      "Phát triển component UI có khả năng tái sử dụng cao",
      "Tối ưu Core Web Vitals và chất lượng giao diện trên mobile",
    ],
    requirements: [
      "Từ 2 năm kinh nghiệm với React hoặc Next.js",
      "Hiểu về state management, API integration và accessibility",
    ],
  },
  {
    title: "Backend Node.js Engineer",
    company: "FinCore Studio",
    location: "Hà Nội",
    salary: "35-55 triệu",
    level: "Senior" as const,
    type: "Onsite" as const,
    summary:
      "Thiết kế API thanh toán nội bộ, xử lý dữ liệu giao dịch và tích hợp hệ thống đối tác.",
    skills: ["Node.js", "MongoDB", "AWS"],
    responsibilities: [
      "Thiết kế REST API và luồng xử lý bất đồng bộ",
      "Đảm bảo logging, monitoring và bảo mật dịch vụ",
    ],
    requirements: [
      "Từ 4 năm kinh nghiệm backend Node.js",
      "Thành thạo MongoDB hoặc PostgreSQL",
    ],
  },
  {
    title: "DevOps Platform Engineer",
    company: "CloudBridge",
    location: "Remote",
    salary: "45-70 triệu",
    level: "Senior" as const,
    type: "Remote" as const,
    summary:
      "Quản lý hạ tầng Kubernetes, CI/CD và observability cho nhiều sản phẩm cloud-native.",
    skills: ["Kubernetes", "Terraform", "CI/CD"],
    responsibilities: [
      "Tự động hóa provisioning hạ tầng bằng Terraform",
      "Cải tiến pipeline build, test và deploy",
    ],
    requirements: [
      "Kinh nghiệm vận hành Kubernetes trên production",
      "Nắm vững Docker, Linux và network cơ bản",
    ],
  },
  {
    title: "Data Engineer",
    company: "InsightWorks",
    location: "Đà Nẵng",
    salary: "32-50 triệu",
    level: "Middle" as const,
    type: "Hybrid" as const,
    summary:
      "Xây dựng pipeline dữ liệu cho sản phẩm phân tích hành vi người dùng trong lĩnh vực e-commerce.",
    skills: ["Python", "Spark", "SQL"],
    responsibilities: [
      "Xây dựng ETL job ổn định và dễ theo dõi",
      "Tối ưu truy vấn cho dashboard phân tích",
    ],
    requirements: [
      "Kinh nghiệm với SQL, Python và data warehouse",
      "Đã từng xử lý batch hoặc streaming pipeline",
    ],
  },
];

async function seed() {
  await connectDatabase();

  let company = await User.findOne({ email: DEMO_COMPANY.email });

  if (!company) {
    const hashedPassword = await hashPassword(DEMO_COMPANY.password);
    company = await User.create({
      fullName: DEMO_COMPANY.fullName,
      email: DEMO_COMPANY.email,
      password: hashedPassword,
      role: DEMO_COMPANY.role,
    });
    console.log("Da tao tai khoan company demo:");
  } else {
    console.log("Tai khoan company demo da ton tai:");
  }

  console.log(`  Email: ${DEMO_COMPANY.email}`);
  console.log(`  Mat khau: ${DEMO_COMPANY.password}`);

  await Job.deleteMany({ postedBy: company._id });

  const createdJobs = await Job.insertMany(
    DEMO_JOBS.map((job) => ({ ...job, postedBy: company!._id }))
  );

  console.log(`Da tao ${createdJobs.length} job mau.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});