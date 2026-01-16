const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>YourBlog</h3>
          <p>Thoughtful writing for modern living.</p>
        </div>

        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/blog">Blog</a>
          <a href="/reviews">Reviews</a>
          <a href="/contact">Contact</a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        </div>
      </div>

      <p className="footer-bottom">
        © {new Date().getFullYear()} YourBlog. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
