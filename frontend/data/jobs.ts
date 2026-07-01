export const stats = [
  { value: "1,240+", label: "viec lam IT" },
  { value: "380+", label: "cong ty cong nghe" },
  { value: "72h", label: "phan hoi trung binh" },
  { value: "92%", label: "tin co muc luong" },
];

export const jobs = [
  {
    id: "frontend-engineer-react",
    title: "Frontend Engineer React",
    company: "NovaTech Labs",
    location: "Ho Chi Minh",
    salary: "30-45 trieu",
    level: "Middle",
    type: "Hybrid",
    summary: "Xay dung dashboard SaaS cho khach hang doanh nghiep, tap trung vao hieu nang va trai nghiem nguoi dung.",
    skills: ["React", "TypeScript", "Next.js"],
    responsibilities: [
      "Phat trien component UI co kha nang tai su dung cao",
      "Toi uu Core Web Vitals va chat luong giao dien tren mobile",
      "Lam viec cung product designer va backend engineer theo sprint",
    ],
    requirements: [
      "Tu 2 nam kinh nghiem voi React hoac Next.js",
      "Hieu ve state management, API integration va accessibility",
      "Co thoi quen viet code ro rang, de review",
    ],
  },
  {
    id: "backend-nodejs-engineer",
    title: "Backend Node.js Engineer",
    company: "FinCore Studio",
    location: "Ha Noi",
    salary: "35-55 trieu",
    level: "Senior",
    type: "Onsite",
    summary: "Thiet ke API thanh toan noi bo, xu ly du lieu giao dich va tich hop he thong doi tac.",
    skills: ["Node.js", "MongoDB", "AWS"],
    responsibilities: [
      "Thiet ke REST API va luong xu ly bat dong bo",
      "Dam bao logging, monitoring va bao mat dich vu",
      "Huong dan code review cho cac thanh vien junior",
    ],
    requirements: [
      "Tu 4 nam kinh nghiem backend Node.js",
      "Thanh thao MongoDB hoac PostgreSQL",
      "Da tung lam viec voi he thong co yeu cau bao mat cao",
    ],
  },
  {
    id: "devops-platform-engineer",
    title: "DevOps Platform Engineer",
    company: "CloudBridge",
    location: "Remote",
    salary: "45-70 trieu",
    level: "Senior",
    type: "Remote",
    summary: "Quan ly ha tang Kubernetes, CI/CD va observability cho nhieu san pham cloud-native.",
    skills: ["Kubernetes", "Terraform", "CI/CD"],
    responsibilities: [
      "Tu dong hoa provisioning ha tang bang Terraform",
      "Cai tien pipeline build, test va deploy",
      "Xay dung dashboard quan sat log, metric va alert",
    ],
    requirements: [
      "Kinh nghiem van hanh Kubernetes tren production",
      "Nam vung Docker, Linux va network co ban",
      "Co tu duy incident response va documentation tot",
    ],
  },
  {
    id: "data-engineer",
    title: "Data Engineer",
    company: "InsightWorks",
    location: "Da Nang",
    salary: "32-50 trieu",
    level: "Middle",
    type: "Hybrid",
    summary: "Xay dung pipeline du lieu cho san pham phan tich hanh vi nguoi dung trong linh vuc e-commerce.",
    skills: ["Python", "Spark", "SQL"],
    responsibilities: [
      "Xay dung ETL job on dinh va de theo doi",
      "Toi uu truy van cho dashboard phan tich",
      "Lam viec voi team product de chuan hoa metric",
    ],
    requirements: [
      "Kinh nghiem voi SQL, Python va data warehouse",
      "Da tung xu ly batch hoac streaming pipeline",
      "Can than voi chat luong du lieu va schema change",
    ],
  },
];

export const featuredCompanies = [
  {
    name: "NovaTech Labs",
    initials: "NL",
    openings: 8,
    description: "SaaS B2B, san pham dashboard van hanh cho thi truong Dong Nam A.",
  },
  {
    name: "FinCore Studio",
    initials: "FC",
    openings: 5,
    description: "Fintech dang mo rong nen tang thanh toan va risk engine noi bo.",
  },
  {
    name: "CloudBridge",
    initials: "CB",
    openings: 6,
    description: "Cong ty cloud-native phat trien ha tang cho startup tang truong nhanh.",
  },
];
