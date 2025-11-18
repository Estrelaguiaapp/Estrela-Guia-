import React from 'react';

export const ContactCTA: React.FC = () => {
  const handleContactClick = () => {
    const phoneNumber = '5531996005229';
    const message = encodeURIComponent('Olá! Gostaria de saber mais sobre o Estrela Guia.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading text-text-title mb-4 leading-tight">
          Dê o <span className="text-primary">próximo passo.</span>
        </h2>
        <p className="text-lg sm:text-xl text-text-subtle max-w-3xl mx-auto mb-8">
          Compartilhe alguns detalhes para iniciar uma conversa sobre a solução ideal para sua empresa.
        </p>
        <button
          onClick={handleContactClick}
          className="bg-primary text-bg-profundo font-bold text-lg px-8 py-3 rounded-md hover:bg-primary-hover transition-transform transform hover:scale-105 duration-300 shadow-lg"
        >
          Fale com a gente
        </button>
      </div>
    </section>
  );
};