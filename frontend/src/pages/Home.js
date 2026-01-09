import { Link } from "react-router-dom";
import FeaturedPost from "../components/FeaturedPost";
import LatestPreview from "../components/LatestPreview";
import Reviews from "../pages/Reviews";

const Home = () => {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Stories That Make You Pause</h1>
          <p>Thoughtful writing on life, creativity, growth, and modern living. Slow down. Read deeply.</p>
          <div className="hero-actions">
            <Link to="/blog" className="btn">Read the Blog</Link>
            <Link to="/contact" className="btn btn-outline">Get in Touch</Link>
          </div>
        </div>
      </section>

      <div className="container">
        <FeaturedPost />
        <LatestPreview />
      </div>

      <Reviews />
    </>
  );
};

export default Home;
