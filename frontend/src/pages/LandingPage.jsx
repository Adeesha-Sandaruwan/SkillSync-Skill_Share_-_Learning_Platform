import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import RippleGrid from '../components/RippleGrid';
import { motion } from 'framer-motion';
import {
    BookOpen, Users, Award, ChevronRight, Github, Linkedin,
    Mail, Phone, Globe
} from 'lucide-react';
import api from '../services/api';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 120, plans: 45, posts: 850 });

    useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/feed');
            }
        }
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
        <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">

            {/* --- HEADER --- */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                            <span className="font-black text-2xl">S</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900">SkillSync</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
                        <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
                        <a href="#plans" className="hover:text-indigo-600 transition-colors">Learning Plans</a>
                        <a href="#about" className="hover:text-indigo-600 transition-colors">About Us</a>
                        <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Log In</Link>
                        <Link to="/register" className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-indigo-600 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-slate-900/20 hover:shadow-indigo-500/30">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative h-[850px] flex items-center justify-center pt-20 overflow-hidden bg-slate-50/50">

                {/* RIPPLE GRID (UPDATED: Bigger squares, thicker lines, slow speed) */}
                <div className="absolute inset-0 z-0">
                    <RippleGrid
                        gridColor="#4f46e5"     // Visible Indigo
                        gridSize={6}            // Low number = BIG squares
                        gridThickness={2}       // Thicker lines
                        rippleIntensity={0.8}
                        mouseInteractionRadius={2.0}
                        opacity={0.6}           // High visibility
                        speed={0.2}             // Slow speed
                    />
                </div>

                {/* Content (Original Size) */}
                <div className="relative z-20 text-center max-w-5xl px-6 mt-10 pointer-events-none">
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="pointer-events-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            The Future of Learning
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black leading-tight mb-8 text-slate-900 tracking-tight">
                            Master New Skills.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Share Your Journey.</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                            Join a community of innovators. Create structured learning roadmaps, track your progress, and showcase your achievements to the world.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 group transform hover:-translate-y-1">
                                Start Learning Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-full font-bold text-lg transition-all border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300">
                                Explore Features
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- STATS BANNER --- */}
            <div className="border-y border-slate-100 bg-white relative z-10">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        <StatItem number={stats.plans || "500+"} label="Roadmaps Created" />
                        <StatItem number={stats.posts || "2.5k+"} label="Progress Updates" />
                        <StatItem number="99%" label="Community Satisfaction" />
                    </div>
                </div>
            </div>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="py-32 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900">Everything you need to grow</h2>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">Powerful tools designed to accelerate your learning curve and keep you consistent.</p>
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-10"
                    >
                        <FeatureCard
                            icon={<BookOpen className="w-8 h-8 text-indigo-600" />}
                            title="Interactive Roadmaps"
                            desc="Create and follow step-by-step learning plans tailored to your goals. Share them with the community."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-violet-600" />}
                            title="Community Driven"
                            desc="Connect with like-minded learners. Follow experts, join discussions, and get real-time feedback."
                        />
                        <FeatureCard
                            icon={<Award className="w-8 h-8 text-fuchsia-600" />}
                            title="Showcase Portfolio"
                            desc="Your profile is your resume. Automatically generate a portfolio of your completed milestones."
                        />
                    </motion.div>
                </div>
            </section>

            {/* --- SAMPLE PLANS CAROUSEL --- */}
            <section id="plans" className="py-32 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <h2 className="text-4xl font-black mb-4 text-slate-900">Popular Learning Plans</h2>
                            <p className="text-lg text-slate-500">Start with a roadmap curated by experts.</p>
                        </div>
                        <Link to="/explore" className="text-indigo-600 font-bold hover:text-indigo-800 hidden md:flex items-center gap-1 transition-colors">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <PlanCard
                            title="Full Stack Java Developer"
                            category="Programming"
                            author="Adeesha S."
                            color="bg-orange-500"
                            desc="Master Spring Boot, React, and AWS in 3 months with real-world projects."
                        />
                        <PlanCard
                            title="UI/UX Design Mastery"
                            category="Design"
                            author="Sarah J."
                            color="bg-pink-500"
                            desc="From wireframes to high-fidelity prototypes using Figma and Adobe XD."
                        />
                        <PlanCard
                            title="Machine Learning Basics"
                            category="Data Science"
                            author="David R."
                            color="bg-sky-500"
                            desc="A comprehensive guide to Python, Pandas, and Scikit-Learn for beginners."
                        />
                    </div>
                </div>
            </section>

            {/* --- ABOUT & DEVELOPER --- */}
            <section id="about" className="py-32 bg-white relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 shadow-2xl overflow-hidden relative">
                        {/* Background Shapes */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                            <div>
                                <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
                                    Meet the Creator
                                </div>
                                <h2 className="text-4xl font-black text-white mb-6">Built for Learners,<br/>by a Learner.</h2>
                                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                    Hi, I'm <strong className="text-white">Adeesha Sandaruwan</strong>. I built SkillSync with a vision to democratize education through peer-to-peer sharing.
                                    This platform is the result of my passion for Full Stack Development and a firm belief in continuous learning.
                                </p>
                                <div className="space-y-4">
                                    <ContactRow icon={<Mail className="w-5 h-5" />} text="adeesha75600@gmail.com" href="mailto:adeesha75600@gmail.com" />
                                    <ContactRow icon={<Phone className="w-5 h-5" />} text="+94 77 167 6015" href="tel:+94771676015" />
                                    <ContactRow icon={<Linkedin className="w-5 h-5" />} text="Adeesha Sandaruwan" href="https://www.linkedin.com/in/adeesha-sandaruwan-aa903b363/" />
                                    <ContactRow icon={<Github className="w-5 h-5" />} text="Adeesha-Sandaruwan" href="https://github.com/Adeesha-Sandaruwan" />
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500 opacity-60"></div>
                                <img
                                    src="https://ui-avatars.com/api/?name=Adeesha+Sandaruwan&background=6366f1&color=fff&size=500&font-size=0.3"
                                    alt="Adeesha Sandaruwan"
                                    className="relative w-full aspect-square object-cover rounded-2xl shadow-2xl border-4 border-slate-800 transform group-hover:scale-[1.02] transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white border-t border-slate-200 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">S</div>
                            <span className="font-extrabold text-2xl text-slate-900">SkillSync</span>
                        </div>

                        <div className="flex gap-8 text-sm font-bold text-slate-500">
                            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
                            <a href="#" className="hover:text-indigo-600 transition-colors">Cookies</a>
                        </div>

                        <div className="flex gap-4">
                            <SocialIcon href="https://github.com/Adeesha-Sandaruwan"><Github className="w-5 h-5" /></SocialIcon>
                            <SocialIcon href="https://www.linkedin.com/in/adeesha-sandaruwan-aa903b363/"><Linkedin className="w-5 h-5" /></SocialIcon>
                            <SocialIcon href="#"><Globe className="w-5 h-5" /></SocialIcon>
                        </div>
                    </div>
                    <div className="mt-12 text-center text-slate-400 text-sm font-medium border-t border-slate-100 pt-8">
                        © {new Date().getFullYear()} Adeesha Sandaruwan. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

// --- SUBCOMPONENTS ---

const StatItem = ({ number, label }) => (
    <div className="py-4 md:py-0">
        <div className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">{number}</div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
);

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-indigo-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group duration-300">
        <div className="mb-6 p-4 bg-slate-50 rounded-2xl inline-block group-hover:scale-110 transition-transform group-hover:bg-white group-hover:shadow-md">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
);

const PlanCard = ({ title, category, author, color, desc }) => (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-indigo-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
        <div className={`h-3 ${color}`}></div>
        <div className="p-8">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${color}`}></span>
                {category}
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
            <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed font-medium">{desc}</p>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">By {author}</span>
                <span className="p-2 bg-slate-50 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                    <ChevronRight className="w-4 h-4" />
                </span>
            </div>
        </div>
    </div>
);

const ContactRow = ({ icon, text, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all border border-slate-700 hover:border-indigo-500 group">
        <span className="text-indigo-400 group-hover:text-white transition-colors">{icon}</span>
        <span className="font-medium truncate">{text}</span>
    </a>
);

const SocialIcon = ({ children, href }) => (
    <a href={href} target="_blank" className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-white hover:bg-indigo-600 transition-all hover:scale-110 shadow-sm">
        {children}
    </a>
);

export default LandingPage;