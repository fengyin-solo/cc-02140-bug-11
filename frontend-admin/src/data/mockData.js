// ========================================
// 图书封面 - 使用真实书籍图片
// ========================================

// 用户头像 SVG 生成器
function generateAvatar(initial, bgColor = '#1890ff') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <rect width="40" height="40" fill="${bgColor}" rx="20"/>
    <text x="20" y="26" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">${initial}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// ========================================
// 图书分类数据
// ========================================
export const categories = [
  { id: 1, name: '文学小说', code: 'WX', description: '包含中外文学作品、小说等', bookCount: 156 },
  { id: 2, name: '科技工程', code: 'KJ', description: '计算机、工程技术类书籍', bookCount: 89 },
  { id: 3, name: '历史传记', code: 'LS', description: '历史、人物传记类书籍', bookCount: 67 },
  { id: 4, name: '经济管理', code: 'JG', description: '经济学、管理学相关书籍', bookCount: 45 },
  { id: 5, name: '艺术设计', code: 'YS', description: '美术、音乐、设计类书籍', bookCount: 38 },
  { id: 6, name: '教育考试', code: 'JY', description: '教材、考试辅导类书籍', bookCount: 112 },
  { id: 7, name: '生活百科', code: 'SH', description: '生活、健康、旅游类书籍', bookCount: 54 },
  { id: 8, name: '儿童读物', code: 'ET', description: '儿童绘本、故事书等', bookCount: 78 }
]

// ========================================
// 图书数据 - 使用本地书籍封面图片
// ========================================
import hlmCover from '@/views/img/hlm.webp'
import jsCover from '@/views/img/js.webp'
import sgyyCover from '@/views/img/sgyy.webp'
import vueCover from '@/views/img/vue.jpeg'
import sjCover from '@/views/img/sj.webp'
import jjxCover from '@/views/img/jjx.webp'
import xlxCover from '@/views/img/xlx.webp'
import sxCover from '@/views/img/sx.webp'

export const books = [
  {
    id: 1,
    isbn: '978-7-02-008179-4',
    title: '红楼梦',
    author: '曹雪芹',
    publisher: '人民文学出版社',
    publishDate: '2018-06-01',
    categoryId: 1,
    categoryName: '文学小说',
    price: 59.70,
    total: 10,
    available: 7,
    location: 'A区-01-03',
    cover: hlmCover,
    description: '中国古典四大名著之一，清代作家曹雪芹创作的章回体长篇小说。'
  },
  {
    id: 2,
    isbn: '978-7-111-40701-0',
    title: 'JavaScript高级程序设计',
    author: 'Nicholas C. Zakas',
    publisher: '机械工业出版社',
    publishDate: '2020-09-01',
    categoryId: 2,
    categoryName: '科技工程',
    price: 129.00,
    total: 8,
    available: 3,
    location: 'B区-02-15',
    cover: jsCover,
    description: '前端开发经典著作，全面深入地介绍JavaScript语言。'
  },
  {
    id: 3,
    isbn: '978-7-02-010875-0',
    title: '三国演义',
    author: '罗贯中',
    publisher: '人民文学出版社',
    publishDate: '2019-03-01',
    categoryId: 1,
    categoryName: '文学小说',
    price: 47.20,
    total: 12,
    available: 9,
    location: 'A区-01-05',
    cover: sgyyCover,
    description: '中国古典四大名著之一，描写东汉末年到西晋初年的历史故事。'
  },
  {
    id: 4,
    isbn: '978-7-115-52808-3',
    title: 'Vue.js设计与实现',
    author: '霍春阳',
    publisher: '人民邮电出版社',
    publishDate: '2022-01-01',
    categoryId: 2,
    categoryName: '科技工程',
    price: 89.00,
    total: 6,
    available: 2,
    location: 'B区-02-18',
    cover: vueCover,
    description: '深入解析Vue.js框架设计原理与实现细节。'
  },
  {
    id: 5,
    isbn: '978-7-101-14699-8',
    title: '史记',
    author: '司马迁',
    publisher: '中华书局',
    publishDate: '2020-08-01',
    categoryId: 3,
    categoryName: '历史传记',
    price: 198.00,
    total: 5,
    available: 4,
    location: 'C区-03-02',
    cover: sjCover,
    description: '中国历史上第一部纪传体通史，被列为"二十四史"之首。'
  },
  {
    id: 6,
    isbn: '978-7-111-57748-4',
    title: '经济学原理',
    author: '曼昆',
    publisher: '机械工业出版社',
    publishDate: '2021-05-01',
    categoryId: 4,
    categoryName: '经济管理',
    price: 88.00,
    total: 7,
    available: 5,
    location: 'D区-04-08',
    cover: jjxCover,
    description: '世界上最流行的经济学入门教材之一。'
  },
  {
    id: 7,
    isbn: '978-7-5086-5423-8',
    title: '设计心理学',
    author: '唐纳德·诺曼',
    publisher: '中信出版社',
    publishDate: '2019-11-01',
    categoryId: 5,
    categoryName: '艺术设计',
    price: 52.00,
    total: 4,
    available: 3,
    location: 'E区-05-12',
    cover: xlxCover,
    description: '设计领域经典著作，探讨人与物品之间的互动关系。'
  },
  {
    id: 8,
    isbn: '978-7-04-054321-6',
    title: '高等数学',
    author: '同济大学数学系',
    publisher: '高等教育出版社',
    publishDate: '2022-07-01',
    categoryId: 6,
    categoryName: '教育考试',
    price: 45.80,
    total: 20,
    available: 12,
    location: 'F区-06-01',
    cover: sxCover,
    description: '高等院校理工科专业通用教材。'
  }
]

// ========================================
// 读者数据
// ========================================
export const readers = [
  {
    id: 1,
    cardNo: 'R202301001',
    name: '张三',
    gender: '男',
    phone: '138****1234',
    email: 'zhangsan@example.com',
    type: '学生',
    department: '计算机学院',
    registerDate: '2023-01-15',
    expireDate: '2025-01-15',
    status: 'active',
    borrowCount: 3,
    maxBorrow: 5
  },
  {
    id: 2,
    cardNo: 'R202301002',
    name: '李四',
    gender: '女',
    phone: '139****5678',
    email: 'lisi@example.com',
    type: '教师',
    department: '文学院',
    registerDate: '2023-02-20',
    expireDate: '2026-02-20',
    status: 'active',
    borrowCount: 5,
    maxBorrow: 10
  },
  {
    id: 3,
    cardNo: 'R202301003',
    name: '王五',
    gender: '男',
    phone: '137****9012',
    email: 'wangwu@example.com',
    type: '学生',
    department: '经济学院',
    registerDate: '2023-03-10',
    expireDate: '2025-03-10',
    status: 'active',
    borrowCount: 2,
    maxBorrow: 5
  },
  {
    id: 4,
    cardNo: 'R202301004',
    name: '赵六',
    gender: '女',
    phone: '136****3456',
    email: 'zhaoliu@example.com',
    type: '学生',
    department: '艺术学院',
    registerDate: '2023-04-05',
    expireDate: '2025-04-05',
    status: 'expired',
    borrowCount: 0,
    maxBorrow: 5
  },
  {
    id: 5,
    cardNo: 'R202301005',
    name: '钱七',
    gender: '男',
    phone: '135****7890',
    email: 'qianqi@example.com',
    type: '教师',
    department: '历史学院',
    registerDate: '2023-05-18',
    expireDate: '2026-05-18',
    status: 'active',
    borrowCount: 8,
    maxBorrow: 10
  }
]

// ========================================
// 借阅记录数据
// ========================================
export const borrowRecords = [
  {
    id: 1,
    readerId: 1,
    readerName: '张三',
    cardNo: 'R202301001',
    bookId: 2,
    bookTitle: 'JavaScript高级程序设计',
    isbn: '978-7-111-40701-0',
    borrowDate: '2024-01-10',
    dueDate: '2024-02-10',
    returnDate: null,
    status: 'borrowed',
    renewCount: 0
  },
  {
    id: 2,
    readerId: 1,
    readerName: '张三',
    cardNo: 'R202301001',
    bookId: 4,
    bookTitle: 'Vue.js设计与实现',
    isbn: '978-7-115-52808-3',
    borrowDate: '2024-01-15',
    dueDate: '2024-02-15',
    returnDate: null,
    status: 'borrowed',
    renewCount: 1
  },
  {
    id: 3,
    readerId: 2,
    readerName: '李四',
    cardNo: 'R202301002',
    bookId: 1,
    bookTitle: '红楼梦',
    isbn: '978-7-02-008179-4',
    borrowDate: '2024-01-05',
    dueDate: '2024-02-05',
    returnDate: '2024-01-28',
    status: 'returned',
    renewCount: 0
  },
  {
    id: 4,
    readerId: 2,
    readerName: '李四',
    cardNo: 'R202301002',
    bookId: 3,
    bookTitle: '三国演义',
    isbn: '978-7-02-010875-0',
    borrowDate: '2024-01-20',
    dueDate: '2024-02-20',
    returnDate: null,
    status: 'borrowed',
    renewCount: 0
  },
  {
    id: 5,
    readerId: 3,
    readerName: '王五',
    cardNo: 'R202301003',
    bookId: 6,
    bookTitle: '经济学原理',
    isbn: '978-7-111-57748-4',
    borrowDate: '2023-12-20',
    dueDate: '2024-01-20',
    returnDate: null,
    status: 'overdue',
    renewCount: 0
  },
  {
    id: 6,
    readerId: 5,
    readerName: '钱七',
    cardNo: 'R202301005',
    bookId: 5,
    bookTitle: '史记',
    isbn: '978-7-101-14699-8',
    borrowDate: '2024-01-08',
    dueDate: '2024-03-08',
    returnDate: null,
    status: 'borrowed',
    renewCount: 0
  }
]

// ========================================
// 测试用户账号
// ========================================
export const users = [
  {
    username: 'admin',
    password: 'admin123',
    name: '管理员',
    role: 'admin',
    avatar: generateAvatar('管', '#1890ff')
  },
  {
    username: 'librarian',
    password: 'lib123',
    name: '图书管理员',
    role: 'librarian',
    avatar: generateAvatar('图', '#52c41a')
  }
]
