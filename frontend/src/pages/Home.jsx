import Navbar from '../components/Hero/Navbar';
import Hero from '../components/Hero/Hero';
import LearnBeyondWatching from '../components/Hero/LearnBeyondWatching';
import HowItWorks from '../components/Hero/HowItWorks';
import EverythingYouNeed from '../components/Hero/EverythingYouNeed';
import AIAgents from '../components/Hero/AIAgents';
import CTA from '../components/Hero/CTA';
import Footer from '../components/Hero/Footer';

const Home = () => {
  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#f59e0b #000',
      }}
    >
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #000;
        }
        ::-webkit-scrollbar-thumb {
          background: #f59e0b;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #d97706;
        }
      `}</style>

      <Navbar />
      <Hero />
      <LearnBeyondWatching />
      <HowItWorks />
      <EverythingYouNeed />
      <AIAgents />
      <CTA />
      <Footer />
    </div>
  );
};

export default Home;