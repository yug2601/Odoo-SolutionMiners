import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import anime from 'animejs';
import { 
  Brain, 
  Users, 
  Trophy, 
  Zap, 
  Globe, 
  ArrowRight, 
  Sparkles,
  Code,
  Palette,
  Music,
  Camera,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import Navbar from '../components/Navbar';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Animated Background Component
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${particle.opacity})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 opacity-30"
    />
  );
}

// Floating Skill Icons Component
function FloatingSkills() {
  const skills = [
    { icon: Code, color: 'text-blue-400', delay: 0 },
    { icon: Palette, color: 'text-purple-400', delay: 0.5 },
    { icon: Music, color: 'text-green-400', delay: 1 },
    { icon: Camera, color: 'text-red-400', delay: 1.5 },
    { icon: BookOpen, color: 'text-yellow-400', delay: 2 },
    { icon: Brain, color: 'text-pink-400', delay: 2.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {skills.map((skill, index) => (
        <motion.div
          key={index}
          className={`absolute ${skill.color} text-4xl opacity-20`}
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            rotate: 0 
          }}
          animate={{
            y: [null, -100, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 8 + index * 2,
            repeat: Infinity,
            delay: skill.delay,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + (index * 15)}%`,
            top: `${30 + (index * 10)}%`
          }}
        >
          <skill.icon size={48} />
        </motion.div>
      ))}
    </div>
  );
}

// Particle System Component
function ParticleSystem() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (particlesRef.current) {
      const particles = particlesRef.current.children;
      
      anime({
        targets: particles,
        translateX: () => anime.random(-100, 100),
        translateY: () => anime.random(-100, 100),
        scale: () => anime.random(0.5, 1.5),
        opacity: [0, 1, 0],
        duration: () => anime.random(2000, 4000),
        delay: () => anime.random(0, 1000),
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutQuad'
      });
    }
  }, []);

  return (
    <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (heroRef.current) {
      const tl = gsap.timeline();
      
      tl.from(heroRef.current.querySelectorAll('.hero-text'), {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      })
      .from(heroRef.current.querySelectorAll('.hero-button'), {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)"
      }, "-=0.5");
    }

    if (featuresRef.current) {
      gsap.from(featuresRef.current.querySelectorAll('.feature-card'), {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });
    }
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description: "Intelligent skill matching using advanced AI algorithms",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Connect with learners worldwide and grow your network",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Trophy,
      title: "Earn Badges",
      description: "Get verifiable skill badges and build your reputation",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Zap,
      title: "Real-time Swaps",
      description: "Instant skill swapping with real-time notifications",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users", icon: Users },
    { number: "50K+", label: "Skills Swapped", icon: TrendingUp },
    { number: "100+", label: "Countries", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6">
        <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Animated Background */}
          <AnimatedBackground />
          <FloatingSkills />
          <ParticleSystem />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-gray-900/80" />
          
          {/* Mouse Follower */}
          <motion.div
            className="fixed w-4 h-4 bg-yellow-400 rounded-full pointer-events-none z-50 mix-blend-difference"
            animate={{
              x: mousePosition.x - 8,
              y: mousePosition.y - 8,
              scale: isHovered ? 2 : 1
            }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          />

          {/* Hero Section */}
          <motion.section 
            ref={heroRef}
            className="relative z-10 flex items-center justify-center min-h-screen px-6"
            style={{ y: y1 }}
          >
            <div className="text-center max-w-6xl mx-auto">
              {/* Main Title */}
              <motion.h1 
                className="hero-text text-6xl md:text-8xl font-extrabold mb-8"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  SkillChain
                </span>
                <motion.span
                  className="inline-block ml-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="inline text-yellow-400" size={80} />
                </motion.span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="hero-text text-xl md:text-2xl mb-12 text-gray-300 leading-relaxed"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                A revolutionary decentralized platform powered by AI where you swap skills, 
                <br className="hidden md:block" />
                grow your network, and earn verifiable badges. Join thousands of learners collaborating globally!
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="hero-button flex flex-col sm:flex-row justify-center gap-6 mb-16"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href="/">
                  <motion.button 
                    className="group relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full text-lg font-bold shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300 overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative flex items-center gap-2">
                      Enter App
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                </Link>
                
                <Link href="/leaderboard">
                  <motion.button 
                    className="px-8 py-4 border-2 border-yellow-400 text-yellow-400 rounded-full text-lg font-bold hover:bg-yellow-400 hover:text-black transition-all duration-300 backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Leaderboard
                  </motion.button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="hero-text grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9 }}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center group"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 flex items-center justify-center border border-yellow-400/30"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className="text-yellow-400" size={32} />
                    </motion.div>
                    <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-300">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section 
            ref={featuresRef}
            className="relative z-10 py-20 px-6"
            style={{ y: y2 }}
          >
            <div className="max-w-6xl mx-auto">
              <motion.h2 
                className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                Why Choose <span className="text-yellow-400">SkillChain</span>?
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="feature-card group relative p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:border-yellow-400/50 transition-all duration-300"
                    whileHover={{ 
                      y: -10,
                      scale: 1.05,
                      boxShadow: "0 20px 40px rgba(251, 191, 36, 0.3)"
                    }}
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="text-white" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Call to Action Section */}
          <motion.section 
            className="relative z-10 py-20 px-6"
            style={{ y: y3 }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-lg rounded-3xl p-12 border border-yellow-400/30"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Start Your Skill Journey?
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Join the future of skill sharing and learning. Connect, grow, and succeed together.
                </p>
                <Link href="/">
                  <motion.button 
                    className="px-10 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full text-xl font-bold shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started Now
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.section>

          {/* Footer */}
          <motion.footer 
            className="relative z-10 py-8 px-6 text-center text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p>&copy; 2024 SkillChain. Built with ❤️ for the future of learning.</p>
          </motion.footer>
        </main>
      </div>
    </div>
  );
}
