import logo from '../../assets/logo.png'

const Footer = () => {
  return (
      <footer className="py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-lg flex items-center justify-center">
                <img src={logo} alt="Logo" />
              </div>
              <span className="text-xl font-bold text-gold-400">Adhyaya AI</span>
            </div>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Transforming educational videos into personalized learning experiences.
            </p>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Adhyaya AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
  )
}

export default Footer