import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import RippleGrid from '../components/RippleGrid';
import { motion } from 'framer-motion';
import {
    Rocket, Users, BookOpen, ChevronRight, Globe, Github, Linkedin,
    Mail, Phone, Award, Clock, ShieldCheck
} from 'lucide-react';
import api from '../services/api';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 120, plans: 45, posts: 850 });

    useEffect(() => {
        if (user) {
            navigate('/'); // Redirect logged-in users to feed
        }
        // Fetch stats strictly for display
        api.get('/public/stats').then(res => setStats(res.data)).catch(() => {});
    }, [user, navigate]);

    // Animations
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">

            {/* --- HEADER --- */}
            <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="font-black text-2xl">S</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">SkillSync</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#plans" className="hover:text-white transition-colors">Learning Plans</a>
                        <a href="#about" className="hover:text-white transition-colors">About Us</a>
                        <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Log In</Link>
                        <Link to="/register" className="px-5 py-2.5 bg-white text-slate-900 rounded-full text-sm font-bold hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-xl shadow-white/10">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION WITH RIPPLE GRID --- */}
            <section className="relative h-[800px] flex items-center justify-center pt-20 overflow-hidden">
                {/* Background Animation */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <RippleGrid
                        gridColor="#6366f1"
                        gridSize={10}
                        gridThickness={2}
                        rippleIntensity={0.8}
                        mouseInteractionRadius={1.5}
                    />
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-slate-900/50 to-slate-900 z-10 pointer-events-none"></div>

                {/* Content */}
                <div className="relative z-20 text-center max-w-4xl px-6">
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            The Future of Learning
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                            Master New Skills.<br /> Share Your Journey.
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Join a community of innovators. Create structured learning roadmaps, track your progress, and showcase your achievements to the world.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group">
                                Start Learning Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold text-lg transition-all border border-slate-700">
                                Explore Features
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- STATS BANNER --- */}
            <div className="border-y border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <StatItem number="1,000+" label="Active Learners" />
                        <StatItem number="500+" label="Roadmaps Created" />
                        <StatItem number="2.5k+" label="Progress Updates" />
                        <StatItem number="99%" label="Community Satisfaction" />
                    </div>
                </div>
            </div>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="py-24 bg-slate-900 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow</h2>
                        <p className="text-slate-400">Powerful tools designed to accelerate your learning curve.</p>
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <FeatureCard
                            icon={<BookOpen className="w-8 h-8 text-indigo-400" />}
                            title="Interactive Roadmaps"
                            desc="Create and follow step-by-step learning plans tailored to your goals. Share them with the community."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-purple-400" />}
                            title="Community Driven"
                            desc="Connect with like-minded learners. Follow experts, join discussions, and get feedback."
                        />
                        <FeatureCard
                            icon={<Award className="w-8 h-8 text-emerald-400" />}
                            title="Showcase Portfolio"
                            desc="Your profile is your resume. Automatically generate a portfolio of your completed milestones."
                        />
                    </motion.div>
                </div>
            </section>

            {/* --- SAMPLE PLANS CAROUSEL --- */}
            <section id="plans" className="py-24 bg-slate-950 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">Popular Learning Plans</h2>
                            <p className="text-slate-400">Start with a roadmap curated by experts.</p>
                        </div>
                        <Link to="/explore" className="text-indigo-400 font-bold hover:text-indigo-300 hidden md:block">View All →</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PlanCard
                            title="Full Stack Java Developer"
                            category="Programming"
                            author="Adeesha S."
                            color="bg-orange-500"
                            desc="Master Spring Boot, React, and AWS in 3 months."
                        />
                        <PlanCard
                            title="UI/UX Design Mastery"
                            category="Design"
                            author="Sarah J."
                            color="bg-pink-500"
                            desc="From wireframes to high-fidelity prototypes using Figma."
                        />
                        <PlanCard
                            title="Machine Learning Basics"
                            category="Data Science"
                            author="David R."
                            color="bg-blue-500"
                            desc="Python, Pandas, and Scikit-Learn for beginners."
                        />
                    </div>
                </div>
            </section>

            {/* --- ABOUT & DEVELOPER --- */}
            <section id="contact" className="py-24 bg-gradient-to-br from-slate-900 to-indigo-950 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Meet the Creator</h2>
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    Hi, I'm <strong className="text-white">Adeesha Sandaruwan</strong>. I built SkillSync with a vision to democratize education through peer-to-peer sharing.
                                    This platform is the result of passion for Full Stack Development and a belief in continuous learning.
                                </p>
                                <div className="space-y-4">
                                    <ContactRow icon={<Mail />} text="adeesha75600@gmail.com" href="mailto:adeesha75600@gmail.com" />
                                    <ContactRow icon={<Phone />} text="+94 77 167 6015" href="tel:+94771676015" />
                                    <ContactRow icon={<Linkedin />} text="Adeesha Sandaruwan" href="https://www.linkedin.com/in/adeesha-sandaruwan-aa903b363/" />
                                    <ContactRow icon={<Github />} text="Adeesha-Sandaruwan" href="https://github.com/Adeesha-Sandaruwan" />
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-20 rounded-full"></div>
                                <img
                                    src="https://ui-avatars.com/api/?name=Adeesha+Sandaruwan&background=6366f1&color=fff&size=400"
                                    alt="Adeesha Sandaruwan"
                                    className="relative w-full aspect-square object-cover rounded-2xl shadow-2xl border-4 border-slate-700 rotate-3 hover:rotate-0 transition-all duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-slate-950 border-t border-slate-900 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">S</div>
                            <span className="font-bold text-lg">SkillSync</span>
                        </div>
                        <div className="text-slate-500 text-sm">
                            © {new Date().getFullYear()} Adeesha Sandaruwan. All rights reserved.
                        </div>
                        <div className="flex gap-6">
                            <SocialIcon href="https://github.com/Adeesha-Sandaruwan"><Github className="w-5 h-5" /></SocialIcon>
                            <SocialIcon href="https://www.linkedin.com/in/adeesha-sandaruwan-aa903b363/"><Linkedin className="w-5 h-5" /></SocialIcon>
                            <SocialIcon href="#"><Globe className="w-5 h-5" /></SocialIcon>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// --- SUBCOMPONENTS ---

const StatItem = ({ number, label }) => (
    <div>
        <div className="text-3xl md:text-4xl font-black text-white mb-2">{number}</div>
        <div className="text-sm font-bold text-indigo-400 uppercase tracking-wider">{label}</div>
    </div>
);

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group">
        <div className="mb-6 p-4 bg-slate-900 rounded-xl inline-block group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
);

const PlanCard = ({ title, category, author, color, desc }) => (
    <div className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all">
        <div className={`h-2 ${color}`}></div>
        <div className="p-6">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">{category}</div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">{title}</h3>
            <p className="text-slate-400 text-sm mb-6 line-clamp-2">{desc}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-500 font-medium">By {author}</span>
                <span className="p-2 bg-slate-800 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </span>
            </div>
        </div>
    </div>
);

const ContactRow = ({ icon, text, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 hover:bg-indigo-600/20 hover:text-indigo-300 transition-all border border-slate-700/50 hover:border-indigo-500/30 group">
        <span className="text-indigo-400 group-hover:text-indigo-300">{icon}</span>
        <span className="font-medium truncate">{text}</span>
    </a>
);

const SocialIcon = ({ children, href }) => (
    <a href={href} target="_blank" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white hover:bg-indigo-600 transition-all">
        {children}
    </a>
);

export default LandingPage;