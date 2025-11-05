import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { Navigate } from '@tanstack/react-router'

import React, { useState, useEffect, useRef } from 'react';
import { Code2, Database, Hexagon, Terminal, ArrowRight, Sparkles, Circle, Zap, Trophy, Users, TrendingUp, CheckCircle, Play, Pause } from 'lucide-react';

const Home = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [codeAnimation, setCodeAnimation] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const statsRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const codeInterval = setInterval(() => {
      setCodeAnimation((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(codeInterval);
  }, []);

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(testimonialInterval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categories = [
    {
      title: 'Frontend',
      subtitle: 'React • TypeScript • UI/UX',
      icon: Code2,
      path: '/frontend',
      color: '#00ff88',
      particles: 12,
      difficulty: 'Beginner to Advanced'
    },
    {
      title: 'Data',
      subtitle: 'SQL • Pipelines • Analytics',
      icon: Database,
      path: '/sql',
      color: '#00ddaa',
      particles: 10,
      difficulty: 'Intermediate'
    },
    {
      title: 'Web3',
      subtitle: 'Solidity • Smart Contracts',
      icon: Hexagon,
      path: '/web3',
      color: '#00ccbb',
      particles: 14,
      difficulty: 'Advanced'
    },
    {
      title: 'Full Stack',
      subtitle: 'End-to-End Development',
      icon: Terminal,
      path: '/fullstack',
      color: '#00ffaa',
      particles: 11,
      difficulty: 'All Levels'
    }
  ];

  const testimonials = [
    {
      text: "CodeJudge transformed how I learn. The real-world challenges pushed me beyond tutorials.",
      author: "Sarah Chen",
      role: "Frontend Developer @ Tech Corp",
      avatar: "SC"
    },
    {
      text: "From struggling with basics to landing my dream job in 6 months. The growth is measurable.",
      author: "Marcus Rodriguez",
      role: "Full Stack Engineer @ StartupXYZ",
      avatar: "MR"
    },
    {
      text: "The instant feedback loop accelerated my learning 10x. No more waiting, just pure progress.",
      author: "Aisha Patel",
      role: "Data Engineer @ FinTech Co",
      avatar: "AP"
    }
  ];

  const codeSnippet = `function solve(challenge) {
  const solution = think()
    .code()
    .test()
    .optimize();
  
  return mastery++;
}`;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Custom Cursor Trail */}
      <div 
        className="fixed w-96 h-96 pointer-events-none z-0 transition-all duration-700 ease-out"
        style={{
          left: mousePos.x - 192,
          top: mousePos.y - 192,
          background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />

      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="fixed w-1 h-1 bg-emerald-400 rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      {/* Minimalist Header */}
      <header className="relative z-50 border-b border-emerald-500/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping absolute" />
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            </div>
            <span className="text-xl font-light tracking-wider">CODEJUDGE</span>
          </div>
          <button 
            className="text-sm tracking-wider hover:text-emerald-400 transition-colors flex items-center gap-2 group"
            onClick={() => { window.location.href = '/problems'; }}
          >
            ENTER 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section - Enhanced */}
      <main className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-12 gap-8 min-h-screen items-center py-20">
          
          {/* Left Side - Text with Animation */}
          <div className="col-span-12 lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 animate-pulse">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span className="text-xs tracking-widest text-emerald-400 uppercase">
                  50K+ Developers • 2M+ Solutions
                </span>
              </div>
              
              <h1 className="text-7xl font-light leading-none">
                Code.
                <br />
                <span className="text-emerald-400 font-normal">Practice.</span>
                <br />
                Master.
              </h1>
              
              <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                Transform from learner to builder with real challenges, instant feedback, and a community of growth-minded developers.
              </p>
            </div>

            {/* Animated Code Preview */}
            <div className="relative bg-zinc-900/50 border border-emerald-500/20 rounded-xl p-4 font-mono text-xs overflow-hidden">
              <div className="absolute top-2 left-2 flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <pre className="mt-4 text-gray-400 leading-relaxed">
                {codeSnippet.split('\n').map((line, i) => (
                  <div
                    key={i}
                    style={{
                      opacity: codeAnimation > i * 10 ? 1 : 0.3,
                      transition: 'opacity 0.3s'
                    }}
                  >
                    {line}
                  </div>
                ))}
              </pre>
              <div className="absolute bottom-2 right-2">
                <div className="flex items-center gap-1 text-emerald-400 text-[10px]">
                  <Zap className="w-3 h-3" />
                  <span>LIVE CODING</span>
                </div>
              </div>
            </div>

            {/* Stats - Enhanced */}
            <div className="flex gap-12 pt-8" ref={statsRef}>
              {[
                { num: '500+', label: 'Challenges', icon: Trophy },
                { num: '98%', label: 'Success Rate', icon: TrendingUp },
                { num: '24/7', label: 'Available', icon: Zap }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={idx} 
                    className="space-y-2 group cursor-pointer"
                    style={{
                      opacity: statsVisible ? 1 : 0,
                      transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
                      transition: `all 0.6s ${idx * 0.1}s`
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <div className="text-3xl font-light text-emerald-400">
                        {stat.num}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Interactive Cards */}
          <div className="col-span-12 lg:col-span-7">
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                const isHovered = hoveredCard === idx;
                
                return (
                  <button
                    key={idx}
                    onMouseEnter={() => setHoveredCard(idx)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => window.location.href = cat.path}
                    className="relative h-56 bg-gradient-to-br from-zinc-900 to-black border border-emerald-500/20 rounded-2xl p-6 overflow-hidden group"
                    style={{
                      transform: isHovered ? 'scale(1.03) rotate(1deg)' : 'scale(1)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {/* Particle Effect on Hover */}
                    {isHovered && [...Array(cat.particles)].map((_, i) => {
                      const angle = (i / cat.particles) * Math.PI * 2;
                      const distance = 60 + Math.random() * 40;
                      return (
                        <div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{
                            background: cat.color,
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%)`,
                            animation: `explodeParticle 0.8s ease-out forwards`,
                            animationDelay: `${i * 0.03}s`,
                            '--tx': `${Math.cos(angle) * distance}px`,
                            '--ty': `${Math.sin(angle) * distance}px`,
                          }}
                        />
                      );
                    })}

                    {/* Glow Effect */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at center, ${cat.color}20, transparent 70%)`
                      }}
                    />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-light">{cat.title}</h3>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {cat.subtitle}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-400" />
                            <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                              {cat.difficulty}
                            </span>
                          </div>
                        </div>
                        <Icon 
                          className="w-10 h-10 transition-all duration-500 opacity-40 group-hover:opacity-100"
                          style={{
                            color: isHovered ? cat.color : 'white',
                            transform: isHovered ? 'scale(1.2) rotate(10deg)' : 'scale(1)'
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-emerald-500/10">
                        <div className="text-xs text-gray-600 uppercase tracking-wider">
                          Start Learning
                        </div>
                        <ArrowRight 
                          className="w-5 h-5 transition-all duration-300"
                          style={{
                            color: cat.color,
                            opacity: isHovered ? 1 : 0.3,
                            transform: isHovered ? 'translateX(0)' : 'translateX(-5px)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Corner Accent */}
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at top right, ${cat.color}30, transparent)`
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        {/* <div className="py-20 border-y border-emerald-500/10">
          <div className="text-center space-y-12">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Trusted by developers at</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-16 flex-wrap opacity-40">
              {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix'].map((company) => (
                <div key={company} className="text-2xl font-light tracking-wider hover:text-emerald-400 transition-colors cursor-pointer">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Journey Section - Enhanced with Story */}
        <div className="py-32">
          <div className="grid grid-cols-12 gap-16 items-center">
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <h2 className="text-5xl font-light leading-tight">
                Your path to
                <br />
                <span className="text-emerald-400">mastery</span>
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Every expert was once a beginner. We've designed a proven journey that transforms passion into expertise.
              </p>
              <div className="flex items-center gap-3 pt-4">
                <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-light">Progress Tracking</div>
                  <div className="text-xs text-gray-600">See your growth in real-time</div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="space-y-4">
                {[
                  { 
                    step: '01', 
                    title: 'Choose Your Domain', 
                    desc: 'Pick the path that excites you most',
                    metric: '4 specialized tracks'
                  },
                  { 
                    step: '02', 
                    title: 'Solve Real Challenges', 
                    desc: 'Learn by building, not just watching tutorials',
                    metric: '500+ curated problems'
                  },
                  { 
                    step: '03', 
                    title: 'Track Your Growth', 
                    desc: 'Measure improvement with analytics and insights',
                    metric: 'Daily progress reports'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative flex gap-6 p-6 border border-emerald-500/10 rounded-2xl bg-gradient-to-r from-zinc-900/50 to-transparent transition-all duration-500 hover:border-emerald-500/30 cursor-pointer overflow-hidden"
                    style={{
                      opacity: activeSection === idx ? 1 : 0.5,
                      transform: activeSection === idx ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    {/* Progress Bar */}
                    <div 
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-transparent transition-all duration-3000"
                      style={{
                        width: activeSection === idx ? '100%' : '0%'
                      }}
                    />
                    
                    <div className="text-5xl font-light text-emerald-400/30 group-hover:text-emerald-400/50 transition-colors">
                      {item.step}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-light">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs text-emerald-400">{item.metric}</span>
                      </div>
                    </div>
                    <Circle 
                      className="w-6 h-6 self-center transition-all duration-300"
                      style={{
                        color: activeSection === idx ? '#00ff88' : '#333',
                        fill: activeSection === idx ? '#00ff88' : 'none',
                        transform: activeSection === idx ? 'scale(1.2)' : 'scale(1)'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-32 border-t border-emerald-500/10">
          <div className="text-center space-y-12">
            <div className="space-y-4">
              <div className="text-xs tracking-widest text-emerald-400 uppercase">
                Success Stories
              </div>
              <h2 className="text-4xl font-light">
                Developers who <span className="text-emerald-400">transformed</span>
              </h2>
            </div>

            <div className="relative max-w-3xl mx-auto">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    opacity: testimonialIndex === idx ? 1 : 0,
                    transform: testimonialIndex === idx ? 'translateY(0)' : 'translateY(20px)',
                    pointerEvents: testimonialIndex === idx ? 'auto' : 'none'
                  }}
                >
                  <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-2xl p-8 space-y-6">
                    <p className="text-xl text-gray-300 leading-relaxed italic">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-400 font-light">
                        {testimonial.avatar}
                      </div>
                      <div className="text-left">
                        <div className="font-light">{testimonial.author}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination Dots */}
              {/* <div className="flex justify-center gap-2 mt-64">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTestimonialIndex(idx)}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: testimonialIndex === idx ? '#00ff88' : '#333',
                      transform: testimonialIndex === idx ? 'scale(1.5)' : 'scale(1)'
                    }}
                  />
                ))}
              </div> */}
            </div>
          </div>
        </div>

        {/* CTA Section - Enhanced */}
        <div className="py-32 text-center">
          <div className="relative inline-block">
            {/* Animated Glow Ring */}
            <div className="absolute inset-0 animate-pulse">
              <div className="absolute inset-[-20px] rounded-full bg-emerald-400/5 blur-2xl" />
            </div>
            
            <div className="relative space-y-6">
              <div className="text-sm text-emerald-400 mb-4 tracking-widest uppercase animate-pulse">
                Ready to begin?
              </div>
              <button className="group px-12 py-5 bg-emerald-400 text-black text-lg font-medium rounded-full hover:bg-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50 relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                {/* Button Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>
              </button>
              <p className="text-sm text-gray-600">
                Join 50,000+ developers • No credit card required
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-emerald-500/10 py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">◆</span> 
              <span>CODEJUDGE 2025</span>
            </div>
            <div className="flex gap-8">
              <button className="hover:text-emerald-400 transition-colors">About</button>
              <button className="hover:text-emerald-400 transition-colors">Careers</button>
              <button className="hover:text-emerald-400 transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(80px, 80px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }

        @keyframes explodeParticle {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);
          }
        }
      `}</style>
    </div>
  );
};



export const Route = createFileRoute('/')({
  component: Home,
})