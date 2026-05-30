import { Brain, PlayCircle, FileText, CheckCircle } from "lucide-react";

const LearnBeyondWatching = () => {
  const solution_features = [
    "Structured learning paths",
    "Automated notes and summaries",
    "Interactive quizzes and assessments",
    "Personalized AI tutoring"
  ];

  return (
    <section className="py-20 bg-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900/50 border border-yellow-800/20 rounded-3xl p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-full text-yellow-400 text-sm font-medium mb-4">
                <Brain className="mr-2 text-yellow-400" size={16} />
                The Learning Revolution
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Beyond Passive Watching: <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Active Learning</span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-900/20 border border-yellow-800 rounded-xl flex items-center justify-center">
                    <PlayCircle className="text-yellow-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">The Traditional Approach</h3>
                    <p className="text-gray-400">
                      Most educational videos provide valuable knowledge, but the learning experience is often passive. 
                      Viewers watch, maybe take notes, but there's no structure, no reinforcement, and no way to measure understanding.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-900/20 border border-yellow-800 rounded-xl flex items-center justify-center">
                    <FileText className="text-yellow-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Lost in the Sea of Content</h3>
                    <p className="text-gray-400">
                      Without organization, learners struggle to connect concepts, track progress, or revisit key information. 
                      The result? Inefficient learning and wasted time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 border border-yellow-800/20 rounded-2xl p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
                    <Brain className="text-black" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">The Adhyaya AI Solution</h3>
                    <p className="text-gray-300">
                      We transform passive video consumption into an <strong className="text-yellow-400">active learning experience</strong>. 
                      Our AI creates structured courses with everything learners need in one place.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {solution_features.map(feature => (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500/20 border border-yellow-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="text-yellow-400" size={16} />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-yellow-900/10 border border-yellow-800/20 rounded-xl">
                  <p className="text-yellow-400 text-center font-medium">
                    No more jumping between videos, notes, and external resources. 
                    <strong>Everything is organized into a single, cohesive learning experience.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LearnBeyondWatching