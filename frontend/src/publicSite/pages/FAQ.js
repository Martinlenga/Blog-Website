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
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <FiHelpCircle size={24} />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-500 text-lg">
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
                  ? "bg-white border-indigo-100 shadow-lg ring-1 ring-indigo-50" 
                  : "bg-white border-gray-100 shadow-sm hover:border-indigo-100"
                }
              `}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className={`text-lg font-bold font-serif transition-colors ${isOpen ? "text-indigo-900" : "text-gray-900"}`}>
                  {faq.q}
                </span>
                <span
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${isOpen ? "bg-indigo-600 text-white rotate-180" : "bg-gray-100 text-gray-500"}
                  `}
                >
                  <FiChevronDown size={20} />
                </span>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-6 pb-6 text-gray-600 leading-relaxed text-base">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;