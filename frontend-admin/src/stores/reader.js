import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { readers as initialReaders } from '@/data/mockData'

const STORAGE_KEY = 'library_readers'

export const useReaderStore = defineStore('reader', () => {
  const loadReaders = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse stored readers:', e)
      }
    }
    return [...initialReaders]
  }

  const readers = ref(loadReaders())
  const loading = ref(false)

  watch(readers, (newReaders) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReaders))
  }, { deep: true })

  const totalReaders = computed(() => readers.value.length)
  const activeReaders = computed(() =>
    readers.value.filter(r => r.status === 'active').length
  )

  function getReaderById(id) {
    return readers.value.find(reader => reader.id === id)
  }

  function getReaderByCardNo(cardNo) {
    return readers.value.find(reader => reader.cardNo === cardNo)
  }

  function addReader(reader) {
    const newId = readers.value.length > 0
      ? Math.max(...readers.value.map(r => r.id)) + 1
      : 1
    const cardNo = `R${new Date().getFullYear()}${String(newId).padStart(5, '0')}`
    readers.value.push({ ...reader, id: newId, cardNo })
    return { id: newId, cardNo }
  }

  function updateReader(id, data) {
    const index = readers.value.findIndex(reader => reader.id === id)
    if (index !== -1) {
      readers.value[index] = { ...readers.value[index], ...data }
      return true
    }
    return false
  }

  function deleteReader(id) {
    const index = readers.value.findIndex(reader => reader.id === id)
    if (index !== -1) {
      readers.value.splice(index, 1)
      return true
    }
    return false
  }

  function searchReaders(keyword) {
    if (!keyword) return readers.value
    const lowerKeyword = keyword.toLowerCase()
    return readers.value.filter(reader =>
      reader.name.toLowerCase().includes(lowerKeyword) ||
      reader.cardNo.toLowerCase().includes(lowerKeyword) ||
      reader.phone.includes(keyword)
    )
  }

  return {
    readers,
    loading,
    totalReaders,
    activeReaders,
    getReaderById,
    getReaderByCardNo,
    addReader,
    updateReader,
    deleteReader,
    searchReaders
  }
})
