import { Zap } from "lucide-react";
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 215, 0, 0.6) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 215, 0, 0.6) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-900/10 to-transparent pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className={`inline-flex items-center px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-full text-yellow-400 text-sm font-medium mb-6 transition-all duration-500 ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Zap className="mr-2 text-yellow-400" size={16} />
          Transform Your Learning
        </div>

        <h1
          className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight transition-all duration-700 ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Transform YouTube Videos Into
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse-glow"
            style={{
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              animation: 'pulse-glow 2s ease-in-out infinite alternate',
            }}
          >
            {' AI-Powered Courses'}
          </span>
        </h1>

        <p
          className={`mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto transition-all duration-700 delay-100 ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Adhyaya AI converts educational YouTube videos and playlists into structured courses
          with notes, quizzes, assignments, and a personalized AI tutor.
        </p>
        <p
          className={`mt-4 text-base sm:text-lg text-gray-500 font-medium transition-all duration-700 delay-200 ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Learn faster. Learn smarter. Learn with guidance.
        </p>

        <div
          className={`mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 transition-all duration-700 delay-300 ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black rounded-xl font-semibold text-base sm:text-lg shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-yellow-500/30"
          >
            Get Started Free
          </Link>
          <button
            onClick={() => {
              const el = document.getElementById('ai-agents');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="w-full sm:w-auto px-6 py-3 border-2 border-yellow-600 text-yellow-400 rounded-xl font-semibold text-base sm:text-lg hover:bg-yellow-900/20 transition-all hover:scale-105 hover:border-yellow-500"
          >
            Explore Features
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0% {
            text-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
          }
          100% {
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  );
};

export default Hero;
