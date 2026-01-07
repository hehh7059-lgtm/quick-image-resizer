
import React from 'react';
import { Language } from '../translations';

interface FAQProps {
  language: Language;
}

const FAQ: React.FC<FAQProps> = ({ language }) => {
  const translations = {
    en: [
      { q: "How do I resize an image online?", a: "Simply drag and drop your image into the upload box above, choose your desired width and height or percentage, and click 'Resize & Download'. The process is instant." },
      { q: "Is it safe to resize photos here?", a: "Absolutely. QuickImageResizer uses client-side JavaScript to process your images. This means your photos stay on your device and are never uploaded to our servers, ensuring 100% privacy." },
      { q: "Does resizing reduce image quality?", a: "Resizing naturally changes pixel count. However, our tool uses high-quality canvas scaling to ensure your resized image remains as crisp as possible." },
      { q: "What formats can I resize?", a: "Our online tool supports JPG, JPEG, PNG, and WebP formats, which are the most common standards for web and social media." }
    ],
    es: [
      { q: "¿Cómo redimensiono una imagen?", a: "Simplemente arrastra y suelta tu imagen en la caja de arriba, elige las dimensiones y haz clic en descargar. El proceso es instantáneo." },
      { q: "¿Es seguro redimensionar fotos aquí?", a: "Totalmente. Usamos JavaScript local. Tus fotos se quedan en tu dispositivo y nunca se suben a nuestros servidores." },
      { q: "¿Baja la calidad al redimensionar?", a: "Cambiar el tamaño altera los píxeles, pero usamos algoritmos de alta calidad para mantener la nitidez." },
      { q: "¿Qué formatos son compatibles?", a: "Soportamos JPG, JPEG, PNG y WebP." }
    ],
    fr: [
      { q: "Comment redimensionner une image ?", a: "Faites simplement glisser votre image, choisissez vos dimensions et téléchargez. C'est instantané." },
      { q: "Est-ce sûr ?", a: "Absolument. Vos images sont traitées localement dans votre navigateur et ne sont jamais envoyées sur un serveur." },
      { q: "La qualité est-elle réduite ?", a: "Le redimensionnement change les pixels, mais nous utilisons un lissage de haute qualité pour préserver la netteté." },
      { q: "Quels formats sont supportés ?", a: "Nous supportons JPG, JPEG, PNG et WebP." }
    ],
    de: [
      { q: "Wie ändere ich die Bildgröße?", a: "Einfach Bild hochladen, Maße wählen und herunterladen. Es geht sofort." },
      { q: "Ist es sicher?", a: "Ja, die Bilder werden lokal verarbeitet und verlassen nie Ihr Gerät." },
      { q: "Sinkt die Bildqualität?", a: "Größenänderungen beeinflussen Pixel, aber wir nutzen hochwertige Algorithmen für beste Ergebnisse." },
      { q: "Welche Formate werden unterstützt?", a: "Wir unterstützen JPG, JPEG, PNG und WebP." }
    ],
    nl: [
      { q: "Hoe verander ik de grootte?", a: "Sleep je foto naar de box, kies de afmetingen en download direct." },
      { q: "Is het veilig?", a: "Ja, je foto's worden lokaal verwerkt en nooit naar onze servers geüpload." },
      { q: "Verliest de foto kwaliteit?", a: "Het veranderen van grootte beïnvloedt de pixels, maar we gebruiken scherpe algoritmes." },
      { q: "Welke formaten zijn ondersteund?", a: "We ondersteunen JPG, JPEG, PNG en WebP." }
    ]
  };

  const currentFaqs = translations[language] || translations.en;
  const sectionTitle = {
    en: "Frequently Asked Questions",
    es: "Preguntas Frecuentes",
    fr: "Questions Fréquemment Posées",
    de: "Häufig gestellte Fragen",
    nl: "Veelgestelde vragen"
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-200 mt-20">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">{sectionTitle[language]}</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {currentFaqs.map((faq, index) => (
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
