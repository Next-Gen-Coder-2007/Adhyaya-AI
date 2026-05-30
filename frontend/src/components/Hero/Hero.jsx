import { Zap } from "lucide-react";
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 215, 0, 0.5) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 215, 0, 0.5) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-full text-yellow-400 text-sm font-medium mb-6">
                <Zap className="mr-2 text-yellow-400" size={16} />
                Transform Your Learning
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Transform YouTube Videos Into
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                {' AI-Powered Courses'}
                </span>
            </h1>
            <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
                Adhyaya AI converts educational YouTube videos and playlists into structured courses 
                with notes, quizzes, assignments, and a personalized AI tutor.
            </p>
            <p className="mt-4 text-lg text-gray-500 font-medium">
                Learn faster. Learn smarter. Learn with guidance.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black rounded-xl font-semibold text-lg shadow-lg cursor-pointer inline-block text-center">
                Get Started Free
                </Link>
                <button onClick={() => { const el = document.getElementById('ai-agents'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="w-full sm:w-auto px-8 py-4 border-2 border-yellow-600 text-yellow-400 rounded-xl font-semibold text-lg hover:bg-yellow-900/20 transition-colors cursor-pointer">
                Explore Features
                </button>
            </div>
        </div>
    </section>
  )
}

export default Hero