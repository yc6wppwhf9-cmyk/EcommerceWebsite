import React, { useState } from 'react';

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

export const ClaimWarranty = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', orderId: '', product: '', issue: '', purchased: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PolicyLayout title="Claim Your Warranty">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Our Warranty Promise</h2>
        <p>Priority Bags stand behind the quality of every product we make. All Priority bags and luggage come with a <strong>1-year manufacturer's warranty</strong> covering defects in materials and workmanship under normal use.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Zipper failures and stitching defects</li>
          <li>Hardware malfunctions (buckles, clasps, wheels)</li>
          <li>Structural frame or body defects</li>
          <li>Lining tears not caused by misuse</li>
        </ul>
        <p className="text-sm text-gray-500 italic">Note: Warranty does not cover damage from misuse, accidents, airline handling, or normal wear and tear.</p>
      </section>

      <section className="space-y-6 mt-8">
        <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Submit a Warranty Claim</h2>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-2">
            <p className="text-green-700 font-bold text-lg">Claim Submitted!</p>
            <p className="text-green-600 text-sm">Thank you, <strong>{form.name}</strong>. Our team will review your claim and contact you at <strong>{form.email}</strong> within 2–3 business days.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 not-prose">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-priority-dark uppercase tracking-wide mb-1">Full Name *</label>
                <input required name="name" value={form.name} onChange={handleChange} placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-priority-blue" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-priority-dark uppercase tracking-wide mb-1">Email Address *</label>
                <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-priority-blue" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-priority-dark uppercase tracking-wide mb-1">Phone Number *</label>
                <input required type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-priority-blue" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-priority-dark uppercase tracking-wide mb-1">Order ID *</label>
                <input required name="orderId" value={form.orderId} onChange={handleChange} placeholder="e.g. ORD-123456"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-priority-blue" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-priority-dark uppercase tracking-wide mb-1">Product Name *</label>
                <input required name="product" value={form.product} onChange={handleChange} placeholder="e.g. Priority Explorer 45L"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-priority-blue" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-priority-dark uppercase tracking-wide mb-1">Date of Purchase *</label>
                <input required type="date" name="purchased" value={form.purchased} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-priority-blue" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-priority-dark uppercase tracking-wide mb-1">Describe the Issue *</label>
              <textarea required name="issue" value={form.issue} onChange={handleChange} rows={4}
                placeholder="Please describe the defect or issue in detail..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-priority-blue resize-none" />
            </div>
            <button type="submit"
              className="bg-priority-blue text-white font-bold uppercase tracking-widest text-xs px-8 py-3 rounded-md hover:opacity-90 transition-opacity">
              Submit Claim
            </button>
            <p className="text-xs text-gray-400">Our support team will reach out within 2–3 business days. For urgent queries, email us at <a href="mailto:info@prioritybags.in" className="underline">info@prioritybags.in</a>.</p>
          </form>
        )}
      </section>
    </PolicyLayout>
  );
};
