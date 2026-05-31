import { Brain, PlayCircle, FileText, CheckCircle } from "lucide-react";

const LearnBeyondWatching = () => {
  const solution_features = [
    "Structured learning paths",
    "Automated notes and summaries",
    "Interactive quizzes and assessments",
    "Personalized AI tutoring"
  ];

  return (
    <section className="py-16 sm:py-20 bg-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900/50 border border-yellow-800/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-full text-yellow-400 text-sm font-medium mb-4">
                <Brain className="mr-2 text-yellow-400" size={16} />
                The Learning Revolution
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Beyond Passive Watching:{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Active Learning
                </span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-900/20 border border-yellow-800 rounded-xl flex items-center justify-center">
                    <PlayCircle className="text-yellow-400" size={20} sm:size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      The Traditional Approach
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base">
                      Most educational videos provide valuable knowledge, but the learning experience is often passive.
                      Viewers watch, maybe take notes, but there's no structure, no reinforcement, and no way to measure understanding.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-900/20 border border-yellow-800 rounded-xl flex items-center justify-center">
                    <FileText className="text-yellow-400" size={20} sm:size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      Lost in the Sea of Content
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base">
                      Without organization, learners struggle to connect concepts, track progress, or revisit key information.
                      The result? Inefficient learning and wasted time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 border border-yellow-800/20 rounded-2xl p-6 sm:p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
                    <Brain className="text-black" size={24} sm:size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      The Adhyaya AI Solution
                    </h3>
                    <p className="text-gray-300 text-sm sm:text-base">
                      We transform passive video consumption into an{" "}
                      <strong className="text-yellow-400">active learning experience</strong>.
                      Our AI creates structured courses with everything learners need in one place.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {solution_features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500/20 border border-yellow-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="text-yellow-400" size={14} sm:size={16} />
                      </div>
                      <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 sm:mt-8 p-4 bg-yellow-900/10 border border-yellow-800/20 rounded-xl">
                  <p className="text-yellow-400 text-center font-medium text-sm sm:text-base">
                    No more jumping between videos, notes, and external resources.{" "}
                    <strong>Everything is organized into a single, cohesive learning experience.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearnBeyondWatching;