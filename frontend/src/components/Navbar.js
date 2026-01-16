import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">YourBlog</div>

        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/blog" className={({ isActive }) => isActive ? "active" : ""}>Blog</NavLink>
          <NavLink to="/reviews" className={({ isActive }) => isActive ? "active" : ""}>Reviews</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""}>Contact</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
