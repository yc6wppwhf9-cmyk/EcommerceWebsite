import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

const EFFECTIVE_DATE = '24 July 2026';
const COMPANY_NAME = 'High Spirit Commercial Ventures Pvt. Ltd.';
const COMPANY_ADDRESS = '1009–1010, Universal Majestic Building, Ghatkopar–Mankhurd Link Road, Chembur West, Mumbai, Maharashtra 400043';
const SUPPORT_EMAIL = 'info@prioritybags.in';
const SUPPORT_PHONE = '+91 74004 59254';
const GRIEVANCE_OFFICER = import.meta.env.VITE_GRIEVANCE_OFFICER_NAME || 'Grievance Officer — Customer Support & Compliance';

const PolicyLayout = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <main className="container mx-auto px-4 py-20">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-outfit font-black uppercase tracking-tight mb-4 text-priority-dark border-b-4 border-priority-blue pb-4 inline-block">{title}</h1>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-10">Effective {EFFECTIVE_DATE}</p>
      <div className="prose prose-sm prose-slate max-w-none text-gray-600 leading-relaxed space-y-6">
        {children}
      </div>
    </div>
  </main>
);

const GrievanceDetails = () => (
  <section className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-5 not-prose">
    <h2 className="text-lg font-bold text-priority-dark">Grievance redressal</h2>
    <p className="text-sm text-gray-600"><strong>{GRIEVANCE_OFFICER}</strong></p>
    <p className="text-sm text-gray-600">Email: <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
    <p className="text-sm text-gray-600">Phone: <a className="underline" href="tel:+917400459254">{SUPPORT_PHONE}</a>, Mon–Sat, 10:00 AM–6:30 PM IST</p>
    <p className="text-sm text-gray-600">Address: {COMPANY_ADDRESS}</p>
    <p className="text-sm text-gray-600">Online complaints receive a reference number immediately. We aim to acknowledge complaints within 48 hours and resolve them within one month.</p>
    <Link to="/contact" className="inline-block text-sm font-bold text-priority-blue underline">Register a complaint</Link>
    <span className="mx-2 text-gray-300">•</span>
    <Link to="/support-status" className="inline-block text-sm font-bold text-priority-blue underline">Track a request</Link>
  </section>
);

export const ShippingPolicy = () => (
  <PolicyLayout title="Shipping Policy">
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Charges and service area</h2>
      <p>We ship to serviceable PIN codes within India. Standard shipping is free when the merchandise subtotal is ₹1,499 or more. A ₹99 shipping fee applies below that threshold. The complete payable amount, including shipping and discounts, is shown before payment.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Dispatch and delivery estimates</h2>
      <p>Orders are normally dispatched within 24–48 hours, Monday to Saturday, excluding public holidays.</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Metro cities:</strong> approximately 2–4 business days after dispatch.</li>
        <li><strong>Other serviceable locations:</strong> approximately 5–8 business days.</li>
        <li><strong>Remote locations:</strong> up to 12 business days.</li>
      </ul>
      <p>These are estimates, not guaranteed delivery dates. Weather, public restrictions, courier disruption or an incorrect address can cause delays. We will share tracking information when the courier makes it available.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Address changes and failed delivery</h2>
      <p>Contact us immediately if the shipping address is wrong. We cannot guarantee changes after dispatch. Additional delivery charges caused by an incorrect or incomplete address may be communicated before a second dispatch.</p>
    </section>
    <GrievanceDetails />
  </PolicyLayout>
);

export const ReturnsRefunds = () => (
  <PolicyLayout title="Returns & Refunds">
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">7-day return window</h2>
      <p>Request a return within seven calendar days after delivery. Products must be unused, unwashed and returned with their original tags, accessories and packaging. We may decline a discretionary return that is used, altered, incomplete or damaged after delivery.</p>
      <p>Defective, damaged, counterfeit, incorrectly supplied or materially misdescribed products remain eligible for the remedies available under applicable consumer law.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Return process and shipping cost</h2>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Contact us with your order number, reason and clear photographs where damage or a defect is reported.</li>
        <li>We will issue a support reference and confirm pickup or return instructions.</li>
        <li>Priority Bags pays return shipping for an incorrect, damaged or defective item. For other approved returns, any reverse-logistics charge will be disclosed before you confirm the return and will not be deducted without notice.</li>
      </ol>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Refunds and exchanges</h2>
      <p>After the returned item is received and inspected, we will approve or explain any rejection. Approved prepaid-order refunds are initiated to the original payment method, normally within 5–7 business days. Banks and payment providers may take additional time to post the credit.</p>
      <p>Approved cash-on-delivery refunds are sent to verified bank or UPI details supplied by the purchaser. Exchanges are subject to stock and may be handled as a return followed by a replacement order.</p>
    </section>
    <GrievanceDetails />
  </PolicyLayout>
);

export const PrivacyPolicy = () => (
  <PolicyLayout title="Privacy Notice">
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Who controls your data</h2>
      <p>{COMPANY_NAME}, at {COMPANY_ADDRESS}, operates prioritybags.in and is responsible for personal data processed through this store.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Data we collect and why</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Account data such as name, email, phone number and password hash to create and secure your account.</li>
        <li>Order, address, payment-reference and transaction data to accept payment, deliver products, prevent fraud and provide invoices and support. We do not store complete card or UPI credentials.</li>
        <li>Messages, warranty claims, reviews, job applications and support records to respond to your request and maintain an audit trail.</li>
        <li>Essential device, session and product-view information to keep the site secure, remember cart preferences and improve the store.</li>
        <li>Chat messages when you choose to use the automated assistant. Do not enter card numbers, passwords or other unnecessary sensitive information in chat.</li>
      </ul>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Service providers and disclosure</h2>
      <p>We disclose only the data reasonably required to infrastructure, database, payment, cloud-media, email, analytics, customer-support and delivery providers that help operate the store. Payment processing is handled by Razorpay. We may also disclose information when required by law, to prevent fraud or to protect legal rights.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Retention, security and your choices</h2>
      <p>We retain information only for the purpose for which it was collected and for applicable tax, accounting, fraud-prevention and legal periods. We use access controls, encryption in transit, password hashing and restricted server credentials, but no internet service can guarantee absolute security.</p>
      <p>You may ask to access, correct or erase eligible personal data, withdraw optional consent, or raise a grievance by emailing {SUPPORT_EMAIL}. We may retain records where continued storage is required by law or necessary for unresolved transactions or claims.</p>
      <p>The store is intended for purchases by adults. Products for children are marketed to parents and guardians; we do not knowingly ask children to create accounts or make payments.</p>
    </section>
    <GrievanceDetails />
  </PolicyLayout>
);

export const TermsOfService = () => (
  <PolicyLayout title="Terms of Service">
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Seller and agreement</h2>
      <p>The seller and website operator is {COMPANY_NAME}. By placing an order, you offer to buy the selected goods at the total shown at checkout, subject to availability, payment confirmation and these terms.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Product information, pricing and orders</h2>
      <p>We aim to keep descriptions, images, availability and prices accurate. Colour may vary slightly by display. If a material pricing or catalogue error is discovered before dispatch, we will contact you and provide a correction, cancellation or refund option as applicable.</p>
      <p>An automated acknowledgement does not by itself guarantee acceptance. We may cancel an order for stock, payment, fraud-screening, delivery or obvious pricing errors and will initiate any amount due back to the original payment method.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Payments and promotions</h2>
      <p>Available payment methods are displayed at checkout and may include cards, UPI, net banking and cash on delivery where supported. Online payments are processed by Razorpay. Coupon eligibility and the final discount are verified by our server when the order is created; coupons have no cash value and may be limited by dates, minimum value or usage.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Intellectual property and acceptable use</h2>
      <p>Site content, trade marks, photographs, graphics and copy belong to {COMPANY_NAME} or its licensors. You may use the site only for lawful personal shopping and may not interfere with security, scrape the service at scale, impersonate another person or submit malicious content.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Consumer rights and governing law</h2>
      <p>Nothing in these terms limits non-waivable rights available under Indian consumer law. These terms are governed by the laws of India. Subject to mandatory consumer-forum rights, courts in Mumbai, Maharashtra have jurisdiction.</p>
    </section>
    <GrievanceDetails />
  </PolicyLayout>
);

export const ClaimWarranty = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', orderId: '', product: '', issue: '', purchased: '' });
  const [ticketNumber, setTicketNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await api.submitWarrantyClaim({
        name: form.name,
        email: form.email,
        phone: form.phone,
        order_id: form.orderId,
        product_name: form.product,
        purchase_date: form.purchased,
        issue: form.issue,
      });
      setTicketNumber(result.ticket_number);
    } catch (err: any) {
      setError(err.message || 'Unable to submit your warranty claim.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-priority-blue';

  return (
    <PolicyLayout title="Claim Your Warranty">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">12-month manufacturing warranty</h2>
        <p>Priority bags and luggage include a 12-month warranty from the purchase date for manufacturing defects under normal intended use. Coverage includes qualifying zipper, stitching, hardware, wheel, handle, frame and lining defects.</p>
        <p>The warranty does not cover misuse, accidental cuts or impacts, unauthorised alterations, airline or third-party handling damage, cosmetic wear, normal deterioration or damage caused by ignoring care instructions. Your statutory consumer rights are not reduced by this warranty.</p>
      </section>

      <section className="space-y-6 mt-8">
        <h2 className="text-xl font-bold text-priority-dark uppercase tracking-wide">Submit a warranty claim</h2>

        {ticketNumber ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3 not-prose">
            <p className="text-green-700 font-bold text-lg">Claim received</p>
            <p className="font-mono font-bold text-green-800">{ticketNumber}</p>
            <p className="text-green-700 text-sm">Keep this reference. Our team will respond within 2–3 business days.</p>
            <Link to={`/support-status?ticket=${encodeURIComponent(ticketNumber)}&email=${encodeURIComponent(form.email)}`} className="inline-block text-priority-blue font-bold text-sm underline">Track this claim</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 not-prose">
            {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label htmlFor="warranty-name" className="block text-xs font-semibold uppercase tracking-wide mb-1">Full name *</label><input id="warranty-name" required name="name" value={form.name} onChange={handleChange} className={inputClass} /></div>
              <div><label htmlFor="warranty-email" className="block text-xs font-semibold uppercase tracking-wide mb-1">Email *</label><input id="warranty-email" required type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} /></div>
              <div><label htmlFor="warranty-phone" className="block text-xs font-semibold uppercase tracking-wide mb-1">Phone *</label><input id="warranty-phone" required type="tel" name="phone" value={form.phone} onChange={handleChange} className={inputClass} /></div>
              <div><label htmlFor="warranty-order" className="block text-xs font-semibold uppercase tracking-wide mb-1">Order ID *</label><input id="warranty-order" required name="orderId" value={form.orderId} onChange={handleChange} className={inputClass} /></div>
              <div><label htmlFor="warranty-product" className="block text-xs font-semibold uppercase tracking-wide mb-1">Product *</label><input id="warranty-product" required name="product" value={form.product} onChange={handleChange} className={inputClass} /></div>
              <div><label htmlFor="warranty-date" className="block text-xs font-semibold uppercase tracking-wide mb-1">Purchase date *</label><input id="warranty-date" required type="date" max={new Date().toISOString().slice(0, 10)} name="purchased" value={form.purchased} onChange={handleChange} className={inputClass} /></div>
            </div>
            <div><label htmlFor="warranty-issue" className="block text-xs font-semibold uppercase tracking-wide mb-1">Describe the issue *</label><textarea id="warranty-issue" required minLength={10} maxLength={4000} name="issue" value={form.issue} onChange={handleChange} rows={5} className={`${inputClass} resize-none`} /></div>
            <button type="submit" disabled={submitting} className="bg-priority-blue text-white font-bold uppercase tracking-widest text-xs px-8 py-3 rounded-md disabled:opacity-60 inline-flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}{submitting ? 'Submitting' : 'Submit claim'}
            </button>
          </form>
        )}
      </section>
      <GrievanceDetails />
    </PolicyLayout>
  );
};
