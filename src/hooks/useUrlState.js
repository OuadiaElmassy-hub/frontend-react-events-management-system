import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'

export const useUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // 🔵 lecture sécurisée
  const state = useMemo(() => {
    return Object.fromEntries(searchParams)
  }, [searchParams])

  // 🔵 setter intelligent (MERGE AUTO)
  const setState = (newState, options = {}) => {
    setSearchParams(prev => {
      const current = Object.fromEntries(prev)

      const merged = {
        ...current,
        ...newState
      }

      // clean undefined / null
      Object.keys(merged).forEach(key => {
        if (
          merged[key] === undefined ||
          merged[key] === null ||
          merged[key] === ''
        ) {
          delete merged[key]
        }
      })

      return merged
    }, options)
  }

  // 🔵 helper spécial pagination
  const setPage = (page) => {
    setState({ page: String(page) })
  }

  const resetPage = () => {
    setState({ page: "0" })
  }

  return {
    state,
    setState,
    setPage,
    resetPage
  }
}