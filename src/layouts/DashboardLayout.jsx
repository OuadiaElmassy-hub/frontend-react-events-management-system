import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import {
  FaCalendarAlt, FaUser, FaBell, FaSignOutAlt,
  FaBars, FaTimes, FaPlus, FaChartBar
} from 'react-icons/fa'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifCount] = useState(3)

  const menuItems = [
    { title: 'Événements', path: '/dashboard/events', icon: <FaCalendarAlt /> },
    { title: 'Statistiques', path: '/dashboard/stats', icon: <FaChartBar /> },
    { title: 'Notifications', path: '/dashboard/notifications', icon: <FaBell />, badge: notifCount },
    { title: 'Profil', path: '/dashboard/profile', icon: <FaUser /> },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-gray-900 text-white flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="text-2xl font-bold">EventHub</Link>
          <p className="text-sm text-gray-400 mt-1">Espace Organisateur</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive? 'bg-blue-600' : 'hover:bg-gray-800'
                }`
              }
            >
              {item.icon}
              <span>{item.title}</span>
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-gray-800 text-red-400">
            <FaSignOutAlt />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-gray-900 text-white flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <Link to="/" className="text-2xl font-bold">EventHub</Link>
                <p className="text-sm text-gray-400 mt-1">Espace Organisateur</p>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <FaTimes size={24} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item, i) => (
                <NavLink
                  key={i}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive? 'bg-blue-600' : 'hover:bg-gray-800'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.title}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <FaBars size={24} />
          </button>

          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

          <div className="flex items-center gap-4">
            <Link to="/dashboard/notifications" className="relative">
              <FaBell className="text-gray-600 text-xl" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {notifCount}
                </span>
              )}
            </Link>
            <Link to="/dashboard/profile">
              <img
                src="https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff"
                alt="Profile"
                className="w-9 h-9 rounded-full"
              />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout