import { Truck, CreditCard, ShieldCheck, PackageCheck } from 'lucide-react';

const FEATURES = [
  { Icon: Truck,         label: 'Amazon Fulfilled',       desc: 'Fast, tracked delivery by Amazon' },
  { Icon: CreditCard,    label: 'Secure Amazon Checkout', desc: 'Pay safely on Amazon' },
  { Icon: ShieldCheck,   label: 'Brand Promise',          desc: 'Certified priority items' },
  { Icon: PackageCheck,  label: 'Quality Unit',           desc: '8-stage strength testing' },
] as const;

/** Static trust strip — why shoppers should buy from Priority Bags. */
export const WhyShopWithUs = () => (
  <section
    className="py-7 md:py-9 bg-[#F9F9F9] border-t border-gray-100 font-outfit"
    aria-label="Why shop with us"
  >
    <div className="max-w-[1720px] mx-auto px-5 md:px-8">
      <div className="flex flex-col items-center mb-5 md:mb-7">
        <p className="text-[14px] md:text-[15px] font-semibold text-[#14052b] uppercase tracking-[0.2em] font-outfit">
          Why Shop With Us
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 md:gap-x-12">
        {FEATURES.map((f) => (
          <div key={f.label} className="flex flex-col items-center text-center gap-2 md:gap-2.5">
            <div className="w-11 h-11 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 text-[#26B3FF]">
              <f.Icon size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-[13px] md:text-[14px] font-semibold uppercase tracking-[0.12em] font-outfit">
              {f.label}
            </h3>
            <p className="text-[12px] md:text-[13px] font-medium text-gray-400 leading-snug font-outfit">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
