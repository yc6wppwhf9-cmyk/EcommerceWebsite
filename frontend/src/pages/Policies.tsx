import React from 'react';

const PolicyLayout = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <main className="container mx-auto px-4 py-20">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-outfit font-black uppercase tracking-tight mb-12 text-priority-dark border-b-4 border-priority-blue pb-4 inline-block">{title}</h1>
      <div className="prose prose-sm prose-slate max-w-none text-gray-600 leading-relaxed space-y-6">
        {children}
      </div>
    </div>
  </main>
);

export const ShippingPolicy = () => (
  <PolicyLayout title="Shipping Policy">
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Shipping Overview</h2>
      <p>Priority Bags offers free standard shipping on all orders above ₹1,499. For orders below this amount, a flat shipping fee of ₹99 is applicable across India.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Delivery Timelines</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Metro Cities:</strong> 2 - 4 business days.</li>
        <li><strong>Rest of India:</strong> 5 - 8 business days.</li>
        <li><strong>Remote Locations:</strong> Up to 12 business days.</li>
      </ul>
      <p>Orders are dispatched within 24-48 hours from our Mumbai warehouse (Mon-Sat, excluding public holidays).</p>
    </section>
  </PolicyLayout>
);

export const ReturnsRefunds = () => (
  <PolicyLayout title="Returns & Refunds">
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">7-Day Return Policy</h2>
      <p>We want you to be completely satisfied with your Priority purchase. If you are not, you can return your item within 7 days of delivery.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">How to Initiate a Return</h2>
      <p>1. Contact our support team via email or WhatsApp.</p>
      <p>2. Ensure the product is unused, with original tags and packaging intact.</p>
      <p>3. We will arrange a reverse pickup (where applicable) or provide instructions for shipping it back.</p>
    </section>
  </PolicyLayout>
);

export const PrivacyPolicy = () => (
  <PolicyLayout title="Privacy Policy">
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Data Protection</h2>
      <p>At Priority Bags, your privacy is our top priority. We collect only essential information required to process your orders and improve your shopping experience.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">What Information We Collect</h2>
      <p>We may collect your name, email address, phone number, and delivery address during checkout. We do not store credit/debit card details on our servers.</p>
    </section>
  </PolicyLayout>
);

export const TermsOfService = () => (
  <PolicyLayout title="Terms Of Service">
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Usage Agreement</h2>
      <p>By using prioritybags.in, you agree to comply with our terms and conditions. These terms govern your use of the website and the purchase of products.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Intellectual Property</h2>
      <p>All content on this site, including images, logos, and text, is the property of High Spirit Commercial Ventures Pvt. Ltd. and protected by copyright laws.</p>
    </section>
  </PolicyLayout>
);
