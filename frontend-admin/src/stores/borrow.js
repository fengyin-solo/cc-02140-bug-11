import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { borrowRecords as initialRecords } from '@/data/mockData'
import { useBookStore } from '@/stores/book'
import { useReaderStore } from '@/stores/reader'

const STORAGE_KEY = 'library_borrow_records'

const BORROW_DAYS = 30
const RENEW_DAYS = 15
const MAX_RENEW_COUNT = 2

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// 记录的唯一最终状态：已归还以 returnDate 为准；未归还依据到期日派生借阅中/已逾期
function resolveStatus(record, today = todayStr()) {
  if (record.returnDate) return 'returned'
  return record.dueDate && record.dueDate < today ? 'overdue' : 'borrowed'
}

// 加载时按规则归一化，保证刷新后逾期不会退回“借阅中”，且不丢失任何已处理记录
function normalize(record) {
  const status = resolveStatus(record)
  return {
    ...record,
    status,
    returnDate: status === 'returned' ? (record.returnDate || todayStr()) : null
  }
}

export const useBorrowStore = defineStore('borrow', () => {
  const loadRecords = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed.map(normalize)
        }
      } catch (e) {
        console.error('Failed to parse stored records:', e)
      }
    }
    return initialRecords.map(normalize)
  }

  const records = ref(loadRecords())
  const loading = ref(false)

  // 进行中的操作，用于防止重复提交 / 并发操作（归还与续借互斥）
  const pendingOps = ref(new Set())

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.value))
  }

  watch(records, () => {
    persist()
  }, { deep: true })

  // 统一的状态读取入口，列表、筛选、统计、概览都使用同一最终状态
  function getStatus(record) {
    return resolveStatus(record)
  }

  function getRecordById(id) {
    return records.value.find(record => record.id === id)
  }

  function getRecordsByReader(readerId) {
    return records.value.filter(record => record.readerId === readerId)
  }

  const totalBorrowed = computed(() =>
    records.value.filter(r => getStatus(r) === 'borrowed').length
  )

  const totalOverdue = computed(() =>
    records.value.filter(r => getStatus(r) === 'overdue').length
  )

  const todayBorrows = computed(() => {
    const today = todayStr()
    return records.value.filter(r => r.borrowDate === today).length
  })

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
  const isPending = key => pendingOps.value.has(key)

  // 新增借阅：校验、记录写入、可借数量回写、读者借阅数更新在同一次操作内原子提交
  async function borrowBook({ reader, book }) {
    const opKey = `borrow:${reader.id}:${book.id}`
    if (isPending(opKey)) {
      return { success: false, duplicate: true, message: '正在处理，请勿重复提交' }
    }

    pendingOps.value.add(opKey)
    try {
      await delay(500)

      // 异步等待后再次校验，避免并发/重复提交导致超借或重复记录
      const bookStore = useBookStore()
      const readerStore = useReaderStore()
      const latestBook = bookStore.getBookById(book.id)
      const latestReader = readerStore.getReaderById(reader.id)

      if (!latestBook || !latestReader) {
        return { success: false, message: '读者或图书信息不存在' }
      }
      if (latestBook.available <= 0) {
        return { success: false, message: '该图书库存不足' }
      }
      if (latestReader.status !== 'active' || latestReader.borrowCount >= latestReader.maxBorrow) {
        return { success: false, message: '读者不可借阅或已达借阅上限' }
      }

      const newId = records.value.length > 0
        ? Math.max(...records.value.map(r => r.id)) + 1
        : 1
      const borrowDate = todayStr()
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + BORROW_DAYS)

      // 同步提交：记录 + 库存 + 读者借阅数，全部成功才视为完成
      records.value.push({
        id: newId,
        readerId: latestReader.id,
        readerName: latestReader.name,
        cardNo: latestReader.cardNo,
        bookId: latestBook.id,
        bookTitle: latestBook.title,
        isbn: latestBook.isbn,
        borrowDate,
        dueDate: dueDate.toISOString().split('T')[0],
        returnDate: null,
        status: 'borrowed',
        renewCount: 0
      })
      bookStore.adjustAvailable(latestBook.id, -1)
      readerStore.adjustBorrowCount(latestReader.id, 1)

      return { success: true, id: newId, message: '借阅成功' }
    } finally {
      pendingOps.value.delete(opKey)
    }
  }

  // 归还：幂等（已归还不再处理、不重复加库存），记录与可借数量同一最终状态
  async function returnBook(id) {
    const opKey = `record:${id}`
    if (isPending(opKey)) {
      return { success: false, duplicate: true, message: '正在处理，请勿重复提交' }
    }

    const record = getRecordById(id)
    if (!record) {
      return { success: false, message: '借阅记录不存在' }
    }
    if (getStatus(record) === 'returned') {
      return { success: false, duplicate: true, message: '该记录已归还' }
    }

    pendingOps.value.add(opKey)
    try {
      await delay(300)

      const latest = getRecordById(id)
      if (!latest) {
        return { success: false, message: '借阅记录不存在' }
      }
      // 等待期间可能已被并发操作归还，再次确认避免重复处理
      if (getStatus(latest) === 'returned') {
        return { success: false, duplicate: true, message: '该记录已归还' }
      }

      const bookStore = useBookStore()
      const readerStore = useReaderStore()

      latest.returnDate = todayStr()
      latest.status = 'returned'

      // 记录已落库后回写库存与读者借阅数；数据缺失时跳过对应项，但归还记录绝不丢失
      if (bookStore.getBookById(latest.bookId)) {
        bookStore.adjustAvailable(latest.bookId, 1)
      }
      if (readerStore.getReaderById(latest.readerId)) {
        readerStore.adjustBorrowCount(latest.readerId, -1)
      }

      return { success: true, message: '归还成功' }
    } finally {
      pendingOps.value.delete(opKey)
    }
  }

  // 续借：仅借阅中且未达上限可续；与归还共用同一记录锁，互斥不重复出结果
  async function renewBook(id) {
    const opKey = `record:${id}`
    if (isPending(opKey)) {
      return { success: false, duplicate: true, message: '正在处理，请勿重复提交' }
    }

    const record = getRecordById(id)
    if (!record) {
      return { success: false, message: '借阅记录不存在' }
    }
    if (getStatus(record) !== 'borrowed') {
      return { success: false, message: '当前状态不可续借' }
    }
    if (record.renewCount >= MAX_RENEW_COUNT) {
      return { success: false, message: '续借失败，已达到最大续借次数' }
    }

    pendingOps.value.add(opKey)
    try {
      await delay(300)

      const latest = getRecordById(id)
      if (!latest) {
        return { success: false, message: '借阅记录不存在' }
      }
      if (getStatus(latest) !== 'borrowed') {
        return { success: false, message: '当前状态不可续借' }
      }
      if (latest.renewCount >= MAX_RENEW_COUNT) {
        return { success: false, message: '续借失败，已达到最大续借次数' }
      }

      // 续借 15 天的规则保持不变
      const newDueDate = new Date(latest.dueDate)
      newDueDate.setDate(newDueDate.getDate() + RENEW_DAYS)
      latest.dueDate = newDueDate.toISOString().split('T')[0]
      latest.renewCount += 1
      latest.status = resolveStatus(latest)

      return { success: true, message: '续借成功，借阅期限延长15天' }
    } finally {
      pendingOps.value.delete(opKey)
    }
  }

  function addRecord(record) {
    // 兼容旧调用：仅写入记录（库存/读者数由统一流程处理）
    const newId = records.value.length > 0
      ? Math.max(...records.value.map(r => r.id)) + 1
      : 1
    const today = todayStr()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + BORROW_DAYS)

    records.value.push({
      ...record,
      id: newId,
      borrowDate: today,
      dueDate: dueDate.toISOString().split('T')[0],
      returnDate: null,
      status: 'borrowed',
      renewCount: 0
    })
    return newId
  }

  function searchRecords(keyword) {
    if (!keyword) return records.value
    const lowerKeyword = keyword.toLowerCase()
    return records.value.filter(record =>
      record.readerName.toLowerCase().includes(lowerKeyword) ||
      record.bookTitle.toLowerCase().includes(lowerKeyword) ||
      record.cardNo.toLowerCase().includes(lowerKeyword)
    )
  }

  return {
    records,
    loading,
    pendingOps,
    totalBorrowed,
    totalOverdue,
    todayBorrows,
    getStatus,
    isPending,
    getRecordById,
    getRecordsByReader,
    addRecord,
    borrowBook,
    returnBook,
    renewBook,
    searchRecords
  }
})
