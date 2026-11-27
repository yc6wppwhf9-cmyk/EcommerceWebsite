import { Link } from 'react-router-dom';
import { CATEGORY_CONTENT } from '../seo/categoryContent';

// Buying guide under the products on the main category pages: helps shoppers
// choose and gives search engines real text about the category.
export const CategoryGuide = ({ slug }: { slug: string }) => {
  const c = CATEGORY_CONTENT[slug];
  if (!c) return null;
  return (
    <section aria-labelledby="category-guide" className="w-full px-4 md:px-8 pb-20">
      <div className="max-w-3xl mx-auto border-t border-line pt-12 font-outfit text-graphite">
        <h2 id="category-guide" className="text-xl md:text-2xl font-normal tracking-wide text-ink mb-4">
          {c.heading}
        </h2>
        <p className="text-[15px] leading-relaxed mb-8">{c.intro}</p>

        {c.sections.map((s) => (
          <div key={s.heading} className="mb-7">
            <h3 className="text-[15px] font-semibold text-ink mb-2">{s.heading}</h3>
            <p className="text-[15px] leading-relaxed">{s.body}</p>
          </div>
        ))}

        <h3 className="text-[15px] font-semibold text-ink mt-10 mb-3">Frequently asked questions</h3>
        <div className="divide-y divide-line border-y border-line mb-8">
          {c.faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="cursor-pointer list-none flex justify-between gap-4 text-[15px] text-ink min-h-[44px] items-center">
                {f.q}
                <span aria-hidden className="text-graphite transition-transform group-open:rotate-45 text-xl leading-none">+</span>
              </summary>
              <p className="text-[15px] leading-relaxed mt-2">{f.a}</p>
            </details>
          ))}
        </div>

        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-graphite mb-3">Also see</p>
        <div className="flex flex-wrap gap-2">
          {c.related.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center min-h-[44px] px-4 border border-line text-[13px] text-ink hover:border-ink transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
