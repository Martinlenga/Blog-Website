import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="navbar">
    <div className="nav-container">
      <Link to="/" className="logo">MyBlog</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
      </div>
    </div>
  </nav>
);

export default Navbar;
