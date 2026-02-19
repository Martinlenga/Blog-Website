import { Link } from "react-router-dom";
import { Helmet } from "react-helmet"; // Import Helmet
import AboutImage from "../../assets/hero2.jpg";
import { FiTarget, FiFeather, FiUsers, FiLock } from "react-icons/fi";

const About = () => {
  return (
    <main className="bg-white min-h-screen pt-28 pb-10">
      
      {/* ADDED HELMET HERE */}
      <Helmet>
        <title>About Us | JK Ithaguru</title>
        <meta name="description" content="We create thoughtful, cinematic writing designed for readers who value depth." />
      </Helmet>

      {/* ================= 1. CINEMATIC HERO ================= */}
      <header className="relative container mx-auto px-6 md:px-12 mb-20 md:mb-32 text-center max-w-4xl mx-auto">
        <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-6">
          Our Philosophy
        </span>
        
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-8">
          Stories that <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">stay with you.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light">
          We create thoughtful, cinematic writing designed for readers
          who value depth, clarity, and unforgettable perspectives.
        </p>
      </header>

      {/* ================= 2. THE STORY (Split Layout) ================= */}
      <section className="container mx-auto px-6 md:px-12 mb-24 md:mb-32">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          
          {/* Image Side (Left) */}
          <div className="w-full md:w-1/2 relative">
            <div className="absolute top-10 left-10 w-full h-full bg-indigo-50 rounded-[2.5rem] -z-10"></div>
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-700">
              <img
                src={AboutImage}
                alt="Our Story"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>

          {/* Text Side (Right) */}
          <div className="w-full md:w-1/2">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              It started with a simple idea.
            </h2>

            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                <strong className="text-indigo-600">JK Ithaguru</strong> began as a bold experiment — 
                the belief that powerful writing should feel cinematic, memorable, and 
                valuable enough to invest in.
              </p>
              <p>
                In an age of clickbait and infinite scrolling, we wanted to build a sanctuary. 
                A place where you don't just "consume content," but actually <strong>read</strong>.
              </p>
              <p>
                We focus on depth, originality, and emotional connection. Every article 
                on this platform is crafted to linger in your mind long after you've put your phone down.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. CORE VALUES (Grid) ================= */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why We Exist
            </h2>
            <p className="text-gray-500 text-lg">
              Built for readers who value signal over noise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Card 1: Mission */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                <FiTarget size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                To create meaningful, high-quality stories people gladly invest in, 
                while empowering writers to produce their absolute best work without compromise.
              </p>
            </div>

            {/* Card 2: Vision */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                <FiFeather size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                To become the leading premium storytelling platform where readers 
                come to discover unforgettable perspectives and cinematic narratives.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 4. THE NUMBERS (Clean Strip) ================= */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x-0 md:divide-x divide-gray-100">
            
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-serif font-bold text-gray-900">100+</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Premium Articles</p>
            </div>

            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-serif font-bold text-gray-900 flex justify-center items-center gap-2">
                 <FiUsers className="text-3xl text-indigo-200" />
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Growing Community</p>
            </div>

            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-serif font-bold text-gray-900">100%</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Curated Quality</p>
            </div>

            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-serif font-bold text-gray-900 flex justify-center items-center gap-2">
                <FiLock className="text-3xl text-indigo-200" />
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Secure Access</p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 5. THE MANIFESTO (Centered Quote) ================= */}
      <section className="py-24 px-6 md:px-12 text-center bg-gray-900 text-white rounded-[3rem] mx-4 md:mx-8 my-12 relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-8 leading-tight">
            "We are not chasing clicks. We build experiences."
          </h2>

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-12 max-w-2xl mx-auto">
            When you unlock a JK Ithaguru article, you aren't just reading a webpage.
            You are gaining permanent access to something crafted with intention, care, and soul.
          </p>

          <Link
            to="/blog"
            className="inline-block bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-500 hover:text-white transition-all transform hover:scale-105 shadow-xl"
          >
            Start Reading
          </Link>
        </div>
      </section>

    </main>
  );
};

export default About;