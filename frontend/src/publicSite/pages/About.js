const About = () => {
  return (
    <div className="pt-20 container mx-auto px-4 md:px-8 py-16 space-y-12">
      <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-600 text-center mb-6">
        About Us
      </h1>

      <div className="space-y-12 max-w-5xl mx-auto">
        <section className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
          <h2 className="text-3xl font-bold text-indigo-600 mb-3">Our Story</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            YourBlog started as a passion project for storytellers and creative minds. We believe that
            thoughtful writing has the power to spark ideas, inspire change, and connect people across the world.
          </p>
        </section>

        <section className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
          <h2 className="text-3xl font-bold text-indigo-600 mb-3">Our Mission</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            To curate high-quality articles that engage, educate, and entertain our readers.
            We prioritize meaningful content over quantity, ensuring each story adds value.
          </p>
        </section>

        <section className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
          <h2 className="text-3xl font-bold text-indigo-600 mb-3">Our Community</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            We celebrate our readers and contributors alike. Everyone is welcome to explore,
            comment, and share stories that resonate. Our community thrives on authenticity, creativity,
            and respect.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
