import React from 'react';

export const AboutUs = () => {
  return (
    <main className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-outfit font-black uppercase tracking-tighter mb-8 bg-gradient-to-r from-priority-blue to-priority-dark bg-clip-text text-transparent">
          Legacy of Priority
        </h1>
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Founded in 1999, Priority has been at the forefront of the Indian travel and lifestyle industry for over two decades. What started as a vision to provide durable and stylish luggage has transformed into a leading brand known for craftsmanship, innovation, and trust.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We specialize in creating premium backpacks, luggage, and accessories that cater to the evolving needs of the modern traveler, student, and professional. Every Priority product is a testament to our commitment to quality.
            </p>
          </div>
          <div className="bg-gray-100 rounded-2xl aspect-square flex items-center justify-center p-12">
            <img src="/Priority Logo-02.png" alt="Priority Logo" className="w-full h-auto opacity-20 grayscale" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 border border-gray-100 rounded-2xl hover:shadow-xl transition-shadow">
            <h3 className="text-3xl font-black mb-2 text-priority-blue">24+</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Years of Trust</p>
          </div>
          <div className="p-8 border border-gray-100 rounded-2xl hover:shadow-xl transition-shadow">
            <h3 className="text-3xl font-black mb-2 text-priority-blue">50M+</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Happy Travelers</p>
          </div>
          <div className="p-8 border border-gray-100 rounded-2xl hover:shadow-xl transition-shadow">
            <h3 className="text-3xl font-black mb-2 text-priority-blue">5000+</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Retail Outlets</p>
          </div>
        </div>
      </div>
    </main>
  );
};
