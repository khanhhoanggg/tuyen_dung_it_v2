export const stats = [
  { value: "1,240+", label: "việc làm IT" },
  { value: "380+", label: "công ty công nghệ" },
  { value: "72h", label: "phản hồi trung bình" },
  { value: "92%", label: "tin có mức lương" },
];

export const jobs = [
  {
    id: "frontend-engineer-react",
    title: "Frontend Engineer React",
    company: "NovaTech Labs",
    location: "Hồ Chí Minh",
    salary: "30-45 triệu",
    level: "Middle",
    type: "Hybrid",
    summary:
      "Xây dựng dashboard SaaS cho khách hàng doanh nghiệp, tập trung vào hiệu năng và trải nghiệm người dùng.",
    skills: ["React", "TypeScript", "Next.js"],
    responsibilities: [
      "Phát triển component UI có khả năng tái sử dụng cao",
      "Tối ưu Core Web Vitals và chất lượng giao diện trên mobile",
      "Làm việc cùng product designer và backend engineer theo sprint",
    ],
    requirements: [
      "Từ 2 năm kinh nghiệm với React hoặc Next.js",
      "Hiểu về state management, API integration và accessibility",
      "Có thói quen viết code rõ ràng, dễ review",
    ],
  },
  {
    id: "backend-nodejs-engineer",
    title: "Backend Node.js Engineer",
    company: "FinCore Studio",
    location: "Hà Nội",
    salary: "35-55 triệu",
    level: "Senior",
    type: "Onsite",
    summary:
      "Thiết kế API thanh toán nội bộ, xử lý dữ liệu giao dịch và tích hợp hệ thống đối tác.",
    skills: ["Node.js", "MongoDB", "AWS"],
    responsibilities: [
      "Thiết kế REST API và luồng xử lý bất đồng bộ",
      "Đảm bảo logging, monitoring và bảo mật dịch vụ",
      "Hướng dẫn code review cho các thành viên junior",
    ],
    requirements: [
      "Từ 4 năm kinh nghiệm backend Node.js",
      "Thành thạo MongoDB hoặc PostgreSQL",
      "Đã từng làm việc với hệ thống có yêu cầu bảo mật cao",
    ],
  },
  {
    id: "devops-platform-engineer",
    title: "DevOps Platform Engineer",
    company: "CloudBridge",
    location: "Remote",
    salary: "45-70 triệu",
    level: "Senior",
    type: "Remote",
    summary:
      "Quản lý hạ tầng Kubernetes, CI/CD và observability cho nhiều sản phẩm cloud-native.",
    skills: ["Kubernetes", "Terraform", "CI/CD"],
    responsibilities: [
      "Tự động hóa provisioning hạ tầng bằng Terraform",
      "Cải tiến pipeline build, test và deploy",
      "Xây dựng dashboard quan sát log, metric và alert",
    ],
    requirements: [
      "Kinh nghiệm vận hành Kubernetes trên production",
      "Nắm vững Docker, Linux và network cơ bản",
      "Có tư duy incident response và documentation tốt",
    ],
  },
  {
    id: "data-engineer",
    title: "Data Engineer",
    company: "InsightWorks",
    location: "Đà Nẵng",
    salary: "32-50 triệu",
    level: "Middle",
    type: "Hybrid",
    summary:
      "Xây dựng pipeline dữ liệu cho sản phẩm phân tích hành vi người dùng trong lĩnh vực e-commerce.",
    skills: ["Python", "Spark", "SQL"],
    responsibilities: [
      "Xây dựng ETL job ổn định và dễ theo dõi",
      "Tối ưu truy vấn cho dashboard phân tích",
      "Làm việc với team product để chuẩn hóa metric",
    ],
    requirements: [
      "Kinh nghiệm với SQL, Python và data warehouse",
      "Đã từng xử lý batch hoặc streaming pipeline",
      "Cẩn thận với chất lượng dữ liệu và schema change",
    ],
  },
];

export const featuredCompanies = [
  {
    name: "NovaTech Labs",
    initials: "NL",
    openings: 8,
    description:
      "SaaS B2B, sản phẩm dashboard vận hành cho thị trường Đông Nam Á.",
  },
  {
    name: "FinCore Studio",
    initials: "FC",
    openings: 5,
    description:
      "Fintech đang mở rộng nền tảng thanh toán và risk engine nội bộ.",
  },
  {
    name: "CloudBridge",
    initials: "CB",
    openings: 6,
    description:
      "Công ty cloud-native phát triển hạ tầng cho startup tăng trưởng nhanh.",
  },
];