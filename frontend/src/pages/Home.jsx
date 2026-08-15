import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Navbar from '../components/Hero/Navbar';
import Hero from '../components/Hero/Hero';
import LearnBeyondWatching from '../components/Hero/LearnBeyondWatching';
import HowItWorks from '../components/Hero/HowItWorks';
import EverythingYouNeed from '../components/Hero/EverythingYouNeed';
import AIAgents from '../components/Hero/AIAgents';
import CTA from '../components/Hero/CTA';
import Footer from '../components/Hero/Footer';

const Home = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary,#09090b)] text-[var(--text-primary,#ffffff)] selection:bg-amber-500 selection:text-black overflow-x-hidden">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <LearnBeyondWatching />
        <HowItWorks />
        <EverythingYouNeed />
        <AIAgents />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;