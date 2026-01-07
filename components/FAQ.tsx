
import React from 'react';

const FAQ: React.FC = () => {
  const faqs = [
    {
      q: "How do I resize an image online?",
      a: "Simply drag and drop your image into the upload box above, choose your desired width and height or percentage, and click 'Resize & Download'. The process is instant."
    },
    {
      q: "Is it safe to resize photos here?",
      a: "Absolutely. QuickImageResizer uses client-side JavaScript to process your images. This means your photos stay on your device and are never uploaded to our servers, ensuring 100% privacy."
    },
    {
      q: "Does resizing reduce image quality?",
      a: "Resizing naturally changes pixel count. However, our tool uses high-quality canvas scaling to ensure your resized image remains as crisp as possible."
    },
    {
      q: "What formats can I resize?",
      a: "Our online tool supports JPG, JPEG, PNG, and WebP formats, which are the most common standards for web and social media."
    }
  ];

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-200 mt-20">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Frequently Asked Questions</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <div key={index} className="space-y-2">
            <h3 className="text-lg font-bold text-indigo-700">{faq.q}</h3>
            <p className="text-gray-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
