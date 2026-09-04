import { useEffect } from 'react';
import { Instagram } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/priority.bags?igsh=OXJ6d3I5MXM0djU3';
const EMBED_SCRIPT = 'https://www.instagram.com/embed.js';

/**
 * "#ExplorePriorityBags" — showcases real Priority Bags reels using Instagram's
 * official embed. Each reel renders in a `blockquote.instagram-media` that
 * Instagram's embed.js upgrades into a live post card. Until the script runs
 * (or if it's blocked), the blockquote degrades to a plain "View on Instagram"
 * link, so the section is never broken.
 *
 * Canonical reel permalinks (embed.js is picky about the profile-prefixed form,
 * so we use the /reel/<code>/ shape).
 */
const REELS = [
  'https://www.instagram.com/reel/DcgZ4RKs6sF/',
  'https://www.instagram.com/reel/DcOa_A0Mq0_/',
  'https://www.instagram.com/reel/Dbs3pehsDVz/',
  'https://www.instagram.com/reel/DbbJMcSsArC/',
];

// Tell Instagram's embed script to (re)scan the DOM and hydrate the blockquotes.
function processEmbeds() {
  (window as unknown as { instgrm?: { Embeds: { process: () => void } } }).instgrm?.Embeds?.process();
}

export const InstagramShowcase = () => {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SCRIPT}"]`);
    if (existing) {
      // Script already on the page — just ask it to hydrate our blockquotes.
      processEmbeds();
      return;
    }
    const script = document.createElement('script');
    script.src = EMBED_SCRIPT;
    script.async = true;
    script.onload = processEmbeds;
    document.body.appendChild(script);
    // Leave the script in place; other mounts reuse it via the branch above.
  }, []);

  return (
    <section className="bg-white border-t border-gray-100 font-outfit py-14 md:py-20" aria-label="Explore Priority Bags on Instagram">
      <div className="max-w-[1720px] mx-auto px-4 md:px-10">
        {/* Heading */}
        <div className="flex flex-col items-center text-center gap-2 mb-8 md:mb-10">
          <div className="flex items-center gap-2.5">
            <Instagram size={22} className="text-[#0F1417]" strokeWidth={2} />
            <h2 className="font-outfit font-bold text-[18px] md:text-[24px] tracking-[0.06em] text-[#0F1417]">
              EXPLORE <span className="text-[#26B3FF]">#PriorityBags</span>
            </h2>
          </div>
          <p className="text-[12px] md:text-[13px] font-medium text-gray-500 max-w-md">
            Tag <span className="font-semibold text-[#0F1417]">@priority.bags</span> for a chance to be featured. Here's how our travellers carry it.
          </p>
        </div>

        {/* Embedded reels — 1 col on mobile, 2 on tablet, 4 on wide desktop.
            Each Instagram blockquote needs ~326px min width, so we only go to
            4-up at 2xl where the columns stay comfortably above that. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 md:gap-5 justify-items-center">
          {REELS.map((url) => (
            <blockquote
              key={url}
              className="instagram-media w-full"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{
                background: '#FFF',
                border: 0,
                borderRadius: 3,
                boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
                margin: 0,
                maxWidth: 540,
                minWidth: 300,
                width: '100%',
              }}
            >
              <a href={url} target="_blank" rel="noopener noreferrer" className="block p-6 text-center text-sm font-medium text-[#26B3FF]">
                View this reel on Instagram
              </a>
            </blockquote>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-8 md:mt-10">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#0F1417] text-white px-7 py-3.5 rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#26B3FF] transition-colors duration-300"
          >
            <Instagram size={16} strokeWidth={2.2} />
            Follow @priority.bags
          </a>
        </div>
      </div>
    </section>
  );
};
