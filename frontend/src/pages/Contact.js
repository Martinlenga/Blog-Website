const Contact = () => {
  return (
    <div className="container contact-page">
      <h1 className="page-title">Get in Touch</h1>
      <p className="page-subtitle">
        Whether it’s feedback, collaboration, or a simple hello — we’d love to hear from you.
      </p>

      <div className="contact-box">
        <div className="contact-info">
          <p><strong>Email:</strong> hello@yourblog.com</p>
          <p><strong>Twitter:</strong> @yourhandle</p>
          <p><strong>Instagram:</strong> @yourhandle</p>
        </div>

        <form className="contact-form">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <textarea placeholder="Your Message" rows="5"></textarea>
          <button className="btn">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
