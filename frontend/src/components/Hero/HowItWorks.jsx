import { Zap, PlayCircle, Brain, BookOpen, BarChart2 } from "lucide-react";

const steps = [
  {
    icon: <PlayCircle className="text-black" size={22} />,
    title: "Paste a YouTube Link",
    description:
      "Add any educational video or playlist. Our system will analyze and prepare your content.",
  },
  {
    icon: <Brain className="text-black" size={22} />,
    title: "AI Creates the Course",
    description:
      "Our AI agents analyze the content, identify key concepts, and generate a structured curriculum.",
  },
  {
    icon: <BookOpen className="text-black" size={22} />,
    title: "Learn Interactively",
    description:
      "Study through organized modules, summaries, quizzes, assignments, and AI-powered guidance.",
  },
  {
    icon: <BarChart2 className="text-black" size={22} />,
    title: "Track Your Progress",
    description:
      "Move through lessons step-by-step and build a deeper understanding of the subject.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-full text-yellow-400 text-sm font-medium mb-4">
            <Zap className="mr-2" size={16} />
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            How It Works
          </h2>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full" />

          <div className="md:hidden absolute left-4 top-0 w-1 h-full bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full" />

          <div className="space-y-10 md:space-y-12">
            {steps.map((step, index) => {
              const isLeft = index % 2 !== 0; // odd steps go left on desktop

              return (
                <div key={index} className="relative flex items-center">
                  {/* ── MOBILE layout (flex-row, line on far left) ── */}
                  <div className="flex md:hidden items-start w-full pl-14">
                    {/* Dot */}
                    <div className="absolute left-0 z-10 w-9 h-9 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-black font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>

                    {/* Card */}
                    <div className="bg-gray-900/50 border border-yellow-800/30 rounded-2xl p-5 w-full">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-11 h-11 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center shrink-0">
                          {step.icon}
                        </div>
                        <h3 className="text-base font-bold text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-sm">{step.description}</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center justify-between w-full">
                    <div className="w-5/12">
                      {isLeft && (
                        <div className="bg-gray-900/50 border border-yellow-800/30 rounded-2xl p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
                              {step.icon}
                            </div>
                            <h3 className="text-lg font-bold text-white">
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-gray-400">{step.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="z-10 w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-black font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>

                    <div className="w-5/12">
                      {!isLeft && (
                        <div className="bg-gray-900/50 border border-yellow-800/30 rounded-2xl p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
                              {step.icon}
                            </div>
                            <h3 className="text-lg font-bold text-white">
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-gray-400">{step.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;