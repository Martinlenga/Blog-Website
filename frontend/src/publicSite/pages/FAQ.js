import { useState } from "react";

const FAQ = () => {
  const faqs = [
    { q: "How can I unlock premium articles?", a: "You can unlock articles by following the payment process on the post detail page." },
    { q: "Can I submit my own story?", a: "Currently, submissions are closed. Check back soon for contributor opportunities." },
    { q: "Do I need an account to read?", a: "No, free articles are accessible without an account. Premium content requires unlocking." },
    { q: "How often is new content published?", a: "We publish new articles weekly to keep our content fresh and engaging." },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="container mx-auto px-4 md:px-8 space-y-10">
      <h5 className="text-4xl md:text-5xl font-extrabold text-indigo-600 text-center">
        Frequently Asked Questions
      </h5>

      <div className="space-y-4 max-w-4xl mx-auto">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-2xl p-5 cursor-pointer bg-white shadow-md hover:shadow-xl transition-all duration-300"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            <h3 className="font-semibold text-gray-800 text-lg md:text-xl flex justify-between items-center">
              {faq.q}
              <span
                className={`transform transition-transform duration-300 ${
                  openIndex === idx ? "rotate-45" : "rotate-0"
                } text-indigo-600 font-bold text-2xl`}
              >
                +
              </span>
            </h3>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                openIndex === idx ? "max-h-40 mt-3" : "max-h-0"
              }`}
            >
              <p className="text-gray-600">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
