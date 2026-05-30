import { Zap, PlayCircle, Brain, BookOpen, BarChart2 } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-full text-yellow-400 text-sm font-medium mb-4">
                    <Zap className="mr-2" size={16} />
                    Simple Process
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">How It Works</h2>
            </div>

            <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full"></div>
                <div className="relative mb-12 flex items-center justify-between">
                    <div className="w-5/12"></div>
                    <div className="z-10 w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">1</span>
                    </div>
                    <div className="w-5/12">
                        <div className="bg-gray-900/50 border border-yellow-800/30 rounded-2xl p-6">
                            <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
                                <PlayCircle className="text-black text-xl" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Paste a YouTube Link</h3>
                            </div>
                            <p className="text-gray-400">
                            Add any educational video or playlist. Our system will analyze and prepare your content.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative mb-12 flex items-center justify-between">
                    <div className="w-5/12">
                        <div className="bg-gray-900/50 border border-yellow-800/30 rounded-2xl p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
                                    <Brain className="text-black text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-white">AI Creates the Course</h3>
                            </div>
                            <p className="text-gray-400">
                            Our AI agents analyze the content, identify key concepts, and generate a structured curriculum.
                            </p>
                        </div>
                    </div>
                    <div className="z-10 w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">2</span>
                    </div>
                    <div className="w-5/12"></div>
                </div>

                <div className="relative mb-12 flex items-center justify-between">
                    <div className="w-5/12"></div>
                    <div className="z-10 w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">3</span>
                    </div>
                    <div className="w-5/12">
                        <div className="bg-gray-900/50 border border-yellow-800/30 rounded-2xl p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
                                    <BookOpen className="text-black text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Learn Interactively</h3>
                            </div>
                            <p className="text-gray-400">
                            Study through organized modules, summaries, quizzes, assignments, and AI-powered guidance.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative mb-12 flex items-center justify-between">
                    <div className="w-5/12">
                        <div className="bg-gray-900/50 border border-yellow-800/30 rounded-2xl p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
                                    <BarChart2 className="text-black text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Track Your Progress</h3>
                            </div>
                            <p className="text-gray-400">
                            Move through lessons step-by-step and build a deeper understanding of the subject.
                            </p>
                        </div>
                    </div>
                    <div className="z-10 w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">4</span>
                    </div>
                    <div className="w-5/12"></div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default HowItWorks