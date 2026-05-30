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
    <div className="min-h-screen bg-black text-white">
      <Navbar/>
      <Hero/>
      <LearnBeyondWatching/>
      <HowItWorks/>
      <EverythingYouNeed/>
      <AIAgents/>
      <CTA/>
      <Footer/>
    </div>
  );
};

export default Home;