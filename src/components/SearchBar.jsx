import { FaSearch } from 'react-icons/fa'
import { useEffect, useState } from 'react'

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 500) // Augmenté à 500ms pour laisser le temps d'écrire

    return () => clearTimeout(timer)
  }, [query]) // 💡 ON ENLÈVE onSearch DES DÉPENDANCES pour éviter les boucles infinies

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex gap-2 bg-white rounded-lg p-2 shadow-xl">
        <input
          type="text"
          placeholder="Rechercher un événement, artiste, lieu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-gray-900 outline-none rounded-md w-full px-3 sm:px-4 py-3 text-sm sm:text-base"
        />
        <div className="px-3 sm:px-4 py-3 bg-blue-600 rounded-md font-semibold flex items-center gap-2 text-white">
          <FaSearch />
        </div>
      </div>
    </div>
  )
}

export default SearchBar