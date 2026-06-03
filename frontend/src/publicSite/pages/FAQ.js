import { useState } from "react";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";

const FAQ = () => {
  const faqs = [
    { 
      q: "How do I unlock premium articles?", 
      a: "It's simple. Click on any locked article, and you'll see an 'Unlock' button. You can pay securely via M-Pesa. Once confirmed, the article unlocks instantly for you to read." 
    },
    { 
      q: "Do I need an account to read?", 
      a: "For free articles, no account is needed. However, to unlock premium content and leave comments, you'll need to sign in with Google. It takes just one click." 
    },
    { 
      q: "Is the payment one-time or a subscription?", 
      a: "Currently, we operate on a 'Pay-Per-Article' model. You only pay for the specific stories you want to read. No monthly subscriptions, no hidden fees." 
    },
    { 
      q: "Can I write for JK Ithaguru?", 
      a: "We are always looking for fresh perspectives. While general submissions are currently closed, you can contact us via the Contact page if you have a compelling story pitch." 
    },
  ];

  const [openIndex, setOpenIndex] = useState(0); // Open the first one by default

  return (
    <div className="max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-10 md:mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <FiHelpCircle size={24} />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-500 text-base md:text-lg">
          Everything you need to know about the platform.
        </p>
      </div>

      {/* Accordion Items */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className={`
                border rounded-2xl transition-all duration-300 overflow-hidden
                ${isOpen 
                  ? "bg-white border-indigo-100 shadow-md ring-1 ring-indigo-50" 
                  : "bg-white border-gray-100 shadow-sm hover:border-indigo-100"
                }
              `}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset rounded-2xl"
              >
                <span className={`text-base md:text-lg font-bold font-serif transition-colors pr-4 ${isOpen ? "text-indigo-900" : "text-gray-900"}`}>
                  {faq.q}
                </span>
                <span
                  className={`
                    shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${isOpen ? "bg-indigo-600 text-white rotate-180" : "bg-gray-100 text-gray-500"}
                  `}
                >
                  <FiChevronDown size={20} />
                </span>
              </button>

              {/* 🚀 UX FIX: Grid-based animation prevents text clipping on mobile! */}
              <div
                id={`faq-answer-${idx}`}
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 md:px-6 pb-5 md:pb-6 text-gray-600 leading-relaxed text-sm md:text-base">
                    {faq.a}
                  </p>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;