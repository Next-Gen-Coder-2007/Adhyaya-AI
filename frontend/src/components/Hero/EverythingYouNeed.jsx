import { Star, Layout, FileText, CheckCircle, Edit3, HelpCircle } from "lucide-react";

const EverythingYouNeed = () => {
    const features = [
    {
        icon: Layout,
        title: "Structured Learning Paths",
        description: "Videos are organized into modules and sections, making complex topics easier to follow and understand."
    },
    {
        icon: FileText,
        title: "AI Notes & Summaries",
        description: "Get concise explanations, key takeaways, and revision-ready notes for every section."
    },
    {
        icon: CheckCircle,
        title: "Quizzes & Assessments",
        description: "Reinforce learning with automatically generated quizzes and instant feedback."
    },
    {
        icon: Edit3,
        title: "Practical Assignments",
        description: "Apply concepts through exercises and hands-on tasks designed around the course content."
    },
    {
        icon: HelpCircle,
        title: "Personalized AI Tutor",
        description: "Ask questions at any time and receive course-aware explanations tailored to what you're learning."
    }
    ];

    return (
        <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-full text-yellow-400 text-sm font-medium mb-4">
                <Star className="mr-2" size={16} />
                Complete Solution
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Everything You Need to Learn
            </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
                <div
                key={index}
                className="bg-gray-900/50 border border-yellow-800/30 rounded-2xl p-8 hover:border-yellow-600 transition-colors group cursor-pointer"
                >
                <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="text-black text-xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
                </div>
            ))}
            </div>
        </div>
        </section>
    );
};

export default EverythingYouNeed;