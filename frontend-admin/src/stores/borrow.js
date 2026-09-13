import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { borrowRecords as initialRecords } from '@/data/mockData'

const STORAGE_KEY = 'library_borrow_records'

export const useBorrowStore = defineStore('borrow', () => {
  const loadRecords = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse stored records:', e)
      }
    }
    return [...initialRecords]
  }

  const records = ref(loadRecords())
  const loading = ref(false)

  watch(records, (newRecords) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords))
  }, { deep: true })

  const totalBorrowed = computed(() =>
    records.value.filter(r => r.status === 'borrowed').length
  )

  const totalOverdue = computed(() =>
    records.value.filter(r => r.status === 'overdue').length
  )

  const todayBorrows = computed(() => {
    const today = new Date().toISOString().split('T')[0]
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
    const today = new Date().toISOString().split('T')[0]
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

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

  function returnBook(id) {
    const index = records.value.findIndex(record => record.id === id)
    if (index !== -1) {
      records.value[index].returnDate = new Date().toISOString().split('T')[0]
      records.value[index].status = 'returned'
      return true
    }
    return false
  }

  function renewBook(id) {
    const index = records.value.findIndex(record => record.id === id)
    if (index !== -1 && records.value[index].renewCount < 2) {
      const newDueDate = new Date(records.value[index].dueDate)
      newDueDate.setDate(newDueDate.getDate() + 15)
      records.value[index].dueDate = newDueDate.toISOString().split('T')[0]
      records.value[index].renewCount += 1
      return true
    }
    return false
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
    totalBorrowed,
    totalOverdue,
    todayBorrows,
    getRecordById,
    getRecordsByReader,
    addRecord,
    returnBook,
    renewBook,
    searchRecords
  }
})
