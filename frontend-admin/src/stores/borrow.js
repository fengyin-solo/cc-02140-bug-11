import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { borrowRecords as initialRecords } from '@/data/mockData'
import { useBookStore } from '@/stores/book'
import { useReaderStore } from '@/stores/reader'

const STORAGE_KEY = 'library_borrow_records'

// 借阅规则：默认借期 30 天；每次续借延长 15 天，最多续借 2 次
const BORROW_DAYS = 30
const RENEW_DAYS = 15
const MAX_RENEW_COUNT = 2

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr, days) {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

// 归一化存储状态：存储层只保留 borrowed/returned 两种终态，
// 逾期是时间相关的派生状态，统一由 dueDate 计算，避免刷新后状态回退
function normalizeRecord(record) {
  if (record.status === 'overdue') {
    return { ...record, status: 'borrowed' }
  }
  return { ...record }
}

// 派生最终状态：已归还以 returnDate/status 为准；未归还且超过应还日期为逾期
function getEffectiveStatus(record) {
  if (record.status === 'returned' || record.returnDate) return 'returned'
  if (record.dueDate < todayStr()) return 'overdue'
  return 'borrowed'
}

export const useBorrowStore = defineStore('borrow', () => {
  const loadRecords = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeRecord)
        }
      } catch (e) {
        console.error('Failed to parse stored records:', e)
      }
    }
    return initialRecords.map(normalizeRecord)
  }

  const records = ref(loadRecords())
  const loading = ref(false)

  // 同步落盘：每次变更立即持久化，重复提交、部分失败或离开页面后都不丢已处理记录
  watch(records, (newRecords) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords))
  }, { deep: true, flush: 'sync' })

  // 操作锁：同一记录的归还/续借、同一提交周期的借阅必须串行，避免并发产生重复结果
  const pendingRecordOps = new Set()
  let borrowSubmitting = false

  // 列表与统计的统一数据源：status 为派生后的最终状态
  const recordsWithStatus = computed(() =>
    records.value.map(record => ({ ...record, status: getEffectiveStatus(record) }))
  )

  const totalBorrowed = computed(() =>
    records.value.filter(r => getEffectiveStatus(r) === 'borrowed').length
  )

  const totalOverdue = computed(() =>
    records.value.filter(r => getEffectiveStatus(r) === 'overdue').length
  )

  const todayBorrows = computed(() => {
    const today = todayStr()
    return records.value.filter(r => r.borrowDate === today).length
  })

  function getRecordById(id) {
    return records.value.find(record => record.id === id)
  }

  function getRecordsByReader(readerId) {
    return records.value.filter(record => record.readerId === readerId)
  }

  function addRecord(record) {
    const newId = records.value.length > 0
      ? Math.max(...records.value.map(r => r.id)) + 1
      : 1
    const today = todayStr()

    records.value.push({
      ...record,
      id: newId,
      borrowDate: today,
      dueDate: addDays(today, BORROW_DAYS),
      returnDate: null,
      status: 'borrowed',
      renewCount: 0
    })
    return newId
  }

  // 借阅：记录、馆藏可借数量、读者已借数作为一个原子操作提交，任一步失败整体回滚
  function borrowBook({ readerId, bookId }) {
    if (borrowSubmitting) {
      return { success: false, reason: 'pending' }
    }
    const bookStore = useBookStore()
    const readerStore = useReaderStore()
    const reader = readerStore.getReaderById(readerId)
    const book = bookStore.getBookById(bookId)

    if (!reader || !book) {
      return { success: false, reason: 'not-found' }
    }
    if (book.available <= 0) {
      return { success: false, reason: 'unavailable' }
    }

    borrowSubmitting = true
    try {
      const recordId = addRecord({
        readerId: reader.id,
        readerName: reader.name,
        cardNo: reader.cardNo,
        bookId: book.id,
        bookTitle: book.title,
        isbn: book.isbn
      })
      try {
        bookStore.updateBook(book.id, { available: book.available - 1 })
        readerStore.updateReader(reader.id, { borrowCount: reader.borrowCount + 1 })
      } catch (e) {
        // 部分失败：回滚已写入的借阅记录，保证不产生对不上的状态
        const index = records.value.findIndex(r => r.id === recordId)
        if (index !== -1) records.value.splice(index, 1)
        throw e
      }
      return { success: true, recordId }
    } finally {
      borrowSubmitting = false
    }
  }

  // 归还：幂等 + 原子。已归还的记录直接返回，不重复回写可借数量
  function returnBook(id) {
    const opKey = `return-${id}`
    if (pendingRecordOps.has(opKey)) {
      return { success: false, reason: 'pending' }
    }
    const record = records.value.find(r => r.id === id)
    if (!record) {
      return { success: false, reason: 'not-found' }
    }
    if (record.status === 'returned' || record.returnDate) {
      return { success: false, reason: 'already-returned' }
    }

    pendingRecordOps.add(opKey)
    try {
      const bookStore = useBookStore()
      const readerStore = useReaderStore()
      const book = bookStore.getBookById(record.bookId)
      const reader = readerStore.getReaderById(record.readerId)

      const snapshot = {
        record: { ...record },
        available: book ? book.available : null,
        borrowCount: reader ? reader.borrowCount : null
      }

      try {
        record.returnDate = todayStr()
        record.status = 'returned'
        if (book) {
          bookStore.updateBook(book.id, { available: Math.min(book.total, book.available + 1) })
        }
        if (reader) {
          readerStore.updateReader(reader.id, { borrowCount: Math.max(0, reader.borrowCount - 1) })
        }
      } catch (e) {
        // 部分失败：整体回滚到操作前状态，记录、可借数量、读者已借数保持一致
        Object.assign(record, snapshot.record)
        if (book && snapshot.available !== null) {
          bookStore.updateBook(book.id, { available: snapshot.available })
        }
        if (reader && snapshot.borrowCount !== null) {
          readerStore.updateReader(reader.id, { borrowCount: snapshot.borrowCount })
        }
        throw e
      }
      return { success: true }
    } finally {
      pendingRecordOps.delete(opKey)
    }
  }

  // 续借：幂等 + 串行。已归还或达到续借上限时拒绝，规则不变（延长 15 天，最多 2 次）
  function renewBook(id) {
    const opKey = `renew-${id}`
    if (pendingRecordOps.has(opKey)) {
      return { success: false, reason: 'pending' }
    }
    const record = records.value.find(r => r.id === id)
    if (!record) {
      return { success: false, reason: 'not-found' }
    }
    if (record.status === 'returned' || record.returnDate) {
      return { success: false, reason: 'already-returned' }
    }
    if (record.renewCount >= MAX_RENEW_COUNT) {
      return { success: false, reason: 'max-renewed' }
    }

    pendingRecordOps.add(opKey)
    try {
      record.dueDate = addDays(record.dueDate, RENEW_DAYS)
      record.renewCount += 1
      return { success: true }
    } finally {
      pendingRecordOps.delete(opKey)
    }
  }

  function searchRecords(keyword) {
    if (!keyword) return recordsWithStatus.value
    const lowerKeyword = keyword.toLowerCase()
    return recordsWithStatus.value.filter(record =>
      record.readerName.toLowerCase().includes(lowerKeyword) ||
      record.bookTitle.toLowerCase().includes(lowerKeyword) ||
      record.cardNo.toLowerCase().includes(lowerKeyword)
    )
  }

  return {
    records,
    recordsWithStatus,
    loading,
    totalBorrowed,
    totalOverdue,
    todayBorrows,
    getEffectiveStatus,
    getRecordById,
    getRecordsByReader,
    addRecord,
    borrowBook,
    returnBook,
    renewBook,
    searchRecords
  }
})
