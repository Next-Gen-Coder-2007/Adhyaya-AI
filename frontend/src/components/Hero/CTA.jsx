import { Zap } from "lucide-react"
import { Link } from 'react-router-dom'

const CTA = () => {
  return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-full text-yellow-400 text-sm font-medium mb-6">
              <Zap className="mr-2" size={16} />
              Ready to Transform
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
              Turn any educational YouTube video into a structured, interactive course in minutes.
            </p>
            <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black rounded-xl font-semibold text-lg shadow-lg cursor-pointer inline-block text-center">
              Generate Your First Course
            </Link>
          </div>
        </div>
      </section>
  )
}

export default CTA