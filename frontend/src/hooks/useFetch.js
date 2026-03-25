import { useState, useEffect, useCallback, useRef } from 'react'

export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fnRef = useRef(fetchFn)
  fnRef.current = fetchFn

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fnRef.current()
      setData(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Failed to fetch')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}
