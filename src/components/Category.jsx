
const API_BASE_URL = "http://localhost:8080"

const Category = ({ categories, selectedCategorie, onCategorieChange }) => {
  return (
    <section aria-labelledby="category-heading">
      <h2 id="category-heading" className="text-xl font-bold text-gray-900 mb-4">
        Catégories
      </h2>

      <ul className="flex gap-3 flex-wrap" role="list">
        {categories.map((cat) => {
          const isSelected = selectedCategorie === cat.id
          return (
            <li key={cat.id} className="shrink-0">
              <button
                onClick={() => onCategorieChange(cat.id)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50'
                }`}
              >
                {/* Image */}
                <div className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 transition-transform duration-150 ${isSelected ? 'scale-110' : ''}`}>
                  <img
                    src={`${API_BASE_URL}${cat.imgUrl}`}
                    alt={cat.nom}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.classList.add('bg-blue-50', 'flex', 'items-center', 'justify-center')
                    }}
                  />
                </div>

                {/* Label */}
                <span className={`text-xs font-medium text-center line-clamp-1 max-w-[72px] transition-colors ${
                  isSelected ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {cat.nom}
                </span>

                {/* Active dot */}
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 -mt-1" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default Category