import logo from '../../assets/logo.png'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const handleExploreClick = () => {
    const el = document.getElementById('ai-agents')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" />
            </div>
            <span className="text-xl font-bold text-gold-400">Adhyaya AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleExploreClick} className="px-4 py-2 text-gold-400 border border-gold-600 rounded-lg hover:bg-gold-900/20 transition-colors cursor-pointer">
              Explore Features
            </button>
            <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black rounded-lg hover:opacity-90 transition-opacity font-semibold cursor-pointer">
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar