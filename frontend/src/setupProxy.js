module.exports = function (app) {
  app.use((req, res, next) => {
    // 🔹 THE FIX: Tell the browser it's okay to interact with the Google popup
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });
};