import { Users, Target, FileText, CheckCircle, Edit3, BookOpen, HelpCircle } from "lucide-react";

const AIAgents = () => {
    const agents = [
    {
        icon: Target,
        title: "Curriculum Agent",
        description: "Creates the course structure and organizes content into logical modules.",
        role: "Structure Expert"
    },
    {
        icon: FileText,
        title: "Content Agent",
        description: "Organizes and summarizes content, extracting key concepts and takeaways.",
        role: "Content Specialist"
    },
    {
        icon: CheckCircle,
        title: "Quiz Agent",
        description: "Generates assessments and quizzes to reinforce learning and test understanding.",
        role: "Assessment Creator"
    },
    {
        icon: Edit3,
        title: "Assignment Agent",
        description: "Creates practical exercises and hands-on tasks to apply learned concepts.",
        role: "Practice Designer"
    },
    {
        icon: BookOpen,
        title: "Resource Agent",
        description: "Recommends additional learning materials and supplementary resources.",
        role: "Resource Curator"
    },
    {
        icon: HelpCircle,
        title: "AI Tutor Agent",
        description: "Provides personalized guidance and answers questions with course-aware explanations.",
        role: "Learning Companion"
    }
    ];

    return (
        <section id="ai-agents" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-full text-yellow-400 text-sm font-medium mb-4">
                <Users className="mr-2" size={16} />
                AI Team
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Powered by Specialized AI Agents
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
                Behind every generated course is a team of AI agents working together to create the perfect learning experience.
            </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent, index) => (
                <div
                key={index}
                className="bg-gray-900/50 border border-yellow-800/30 rounded-2xl p-8 hover:border-yellow-600 transition-colors group cursor-pointer"
                >
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-2xl flex items-center justify-center mb-6">
                    <agent.icon className="text-black text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{agent.title}</h3>
                <p className="text-gray-400 mb-4">{agent.description}</p>
                <div className="text-sm text-yellow-400 font-medium">
                    {agent.role}
                </div>
                </div>
            ))}
            </div>

            <div className="mt-12 text-center">
            <p className="text-lg text-gray-400">
                Together, they transform raw video content into a complete learning environment.
            </p>
            </div>
        </div>
        </section>
    );
};

export default AIAgents;