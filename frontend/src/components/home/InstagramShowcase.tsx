import React, { useState, useRef, useEffect } from 'react';
import { Instagram, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INSTAGRAM_URL = 'https://www.instagram.com/priority.bags?igsh=OXJ6d3I5MXM0djU3';

interface InstagramCardData {
  handle: string;
  avatar: string;
  avatarFallback: string;
  posts: string;
  followers: string;
  following: string;
  img: string;
  fallback: string;
  video?: string;
  href: string;
  caption: string;
}

const INSTA_CARDS: InstagramCardData[] = [
  {
    handle: 'priority.bags',
    avatar: '/priority-icon.png',
    avatarFallback: '/Priority Logo-02.png',
    posts: '366',
    followers: '13.1K',
    following: '4',
    img: '/instagram/post_1.webp',
    fallback: '/Category/Backpack.jpg',
    href: 'https://www.instagram.com/p/Dc2xRsrjKxT/',
    caption: 'Your backpack has a personality. Meet the DREAMER Series.',
  },
  {
    handle: 'priority.bags',
    avatar: '/priority-icon.png',
    avatarFallback: '/Priority Logo-02.png',
    posts: '366',
    followers: '13.1K',
    following: '4',
    img: '/instagram/post_2.jpg',
    fallback: '/junior/Drift Sky Blue_ Hero 1.png',
    href: 'https://www.instagram.com/p/DbLf5MnDKPL/',
    caption: 'Meet the Drift Series combo! The ultimate school day survival kit.',
  },
  {
    handle: 'priority.bags',
    avatar: '/priority-icon.png',
    avatarFallback: '/Priority Logo-02.png',
    posts: '366',
    followers: '13.1K',
    following: '4',
    img: '/instagram/post_3.jpg',
    video: '/instagram/post_3.mp4',
    fallback: '/Category/Travelling Bag.jpg',
    href: 'https://www.instagram.com/p/DcgZ4RKs6sF/',
    caption: 'Discover the "Snappy" backpack in every color. Fast, fresh & ready.',
  },
  {
    handle: 'priority.bags',
    avatar: '/priority-icon.png',
    avatarFallback: '/Priority Logo-02.png',
    posts: '366',
    followers: '13.1K',
    following: '4',
    img: '/instagram/post_4.jpg',
    video: '/instagram/post_4.mp4',
    fallback: '/Category/ref.png',
    href: 'https://www.instagram.com/p/DbbJMcSsArC/',
    caption: 'Infused thermal lining & 1-swipe clean pockets. Upgrade your school game!',
  },
  {
    handle: 'priority.bags',
    avatar: '/priority-icon.png',
    avatarFallback: '/Priority Logo-02.png',
    posts: '366',
    followers: '13.1K',
    following: '4',
    img: '/instagram/post_5.webp',
    fallback: '/Category/Artboard 1 1.png',
    href: 'https://www.instagram.com/p/DcvzxuRM0vG/',
    caption: 'INCOMING! The ultimate semester essential straight to your feed. #Century',
  },
];

export const InstagramShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [cards] = useState<InstagramCardData[]>(INSTA_CARDS);
  const touchStartX = useRef<number | null>(null);

  const total = cards.length;
  const current = cards[currentIndex];
  const nextCard = cards[(currentIndex + 1) % total];
  const nextNextCard = cards[(currentIndex + 2) % total];

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) handleNext();
    else if (diff < -40) handlePrev();
    touchStartX.current = null;
  };

  return (
    <section
      className="bg-[#FAFAFA] border-t border-gray-100 font-outfit py-12 md:py-20 relative overflow-hidden"
      aria-label="Explore Priority Bags on Instagram"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center gap-1.5 mb-8 md:mb-12">
          <div className="flex items-center gap-2">
            <Instagram size={20} className="text-[#0F1417]" strokeWidth={2.2} />
            <h2 className="font-outfit font-bold text-[17px] sm:text-[20px] md:text-[24px] tracking-[0.06em] text-[#0F1417]">
              EXPLORE <span className="text-[#26B3FF]">#PriorityBags</span>
            </h2>
          </div>
          <p className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-gray-500 max-w-md">
            Tag <span className="font-semibold text-[#0F1417]">@priority.bags</span> for a chance to be featured.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP VIEW (md and up): 3 Posts Side-by-Side with Proper Spacing */}
        {/* ========================================================================= */}
        <div className="hidden md:block relative max-w-5xl lg:max-w-6xl mx-auto px-8 lg:px-12">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            aria-label="Previous Instagram Posts"
            className="absolute -left-1 lg:-left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-gray-200/80 flex items-center justify-center text-gray-800 hover:bg-[#0F1417] hover:text-white hover:border-[#0F1417] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft size={20} className="lg:w-6 lg:h-6" strokeWidth={2.2} />
          </button>

          {/* 3 Cards Grid */}
          <div className="grid grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {[0, 1, 2].map((offset) => {
              const card = cards[(currentIndex + offset) % total];
              return (
                <div
                  key={`${card.href}-${offset}`}
                  className="w-full bg-white rounded-2xl lg:rounded-3xl border border-gray-100/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <InstagramCardContent card={card} />
                </div>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            aria-label="Next Instagram Posts"
            className="absolute -right-1 lg:-right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-gray-200/80 flex items-center justify-center text-gray-800 hover:bg-[#0F1417] hover:text-white hover:border-[#0F1417] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight size={20} className="lg:w-6 lg:h-6" strokeWidth={2.2} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE VIEW (< md): Stacked Deck Carousel */}
        {/* ========================================================================= */}
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="block md:hidden relative max-w-[340px] sm:max-w-[380px] mx-auto flex items-center justify-center pl-1 pr-6 sm:pr-8"
        >
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            aria-label="Previous Instagram Post"
            className="absolute -left-3 sm:-left-6 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-gray-200/80 flex items-center justify-center text-gray-800 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" strokeWidth={2.2} />
          </button>

          {/* Stacked Container */}
          <div className="relative w-full">
            {/* Background Stacked Card Layer 3 (Farthest Back) */}
            <div
              onClick={handleNext}
              className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-white border border-gray-200/50 shadow-[0_4px_16px_rgba(0,0,0,0.04)] cursor-pointer transition-all duration-300 translate-x-5 sm:translate-x-7 scale-[0.90] origin-left z-[1] overflow-hidden opacity-60"
            >
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <img
                  src={nextNextCard?.img || nextNextCard?.fallback}
                  alt=""
                  className="w-full h-full object-cover opacity-30 blur-[1px]"
                />
              </div>
            </div>

            {/* Background Stacked Card Layer 2 (Middle Behind) */}
            <div
              onClick={handleNext}
              className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-white border border-gray-200/70 shadow-[0_6px_20px_rgba(0,0,0,0.06)] cursor-pointer transition-all duration-300 translate-x-2.5 sm:translate-x-3.5 scale-[0.95] origin-left z-[2] overflow-hidden opacity-80"
            >
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <img
                  src={nextCard?.img || nextCard?.fallback}
                  alt=""
                  className="w-full h-full object-cover opacity-50 blur-[0.5px]"
                />
              </div>
            </div>

            {/* Main Active Front Card */}
            <div className="relative z-10 w-full bg-white rounded-2xl sm:rounded-3xl border border-gray-100/90 shadow-[0_10px_35px_rgba(0,0,0,0.08)] overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current.href + current.img}
                  custom={direction}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragEnd={(_e, info) => {
                    const threshold = 40;
                    if (info.offset.x < -threshold || info.velocity.x < -300) {
                      handleNext();
                    } else if (info.offset.x > threshold || info.velocity.x > 300) {
                      handlePrev();
                    }
                  }}
                  initial={{ opacity: 0, x: direction * 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 50 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col cursor-grab active:cursor-grabbing touch-pan-y select-none"
                >
                  <InstagramCardContent card={current} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            aria-label="Next Instagram Post"
            className="absolute -right-3 sm:-right-6 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-gray-200/80 flex items-center justify-center text-gray-800 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight size={18} className="sm:w-5 sm:h-5" strokeWidth={2.2} />
          </button>
        </div>

        {/* Dots Pagination Indicator */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 md:mt-10">
          {cards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 sm:w-8 bg-[#0F1417]'
                  : 'w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Section Bottom CTA */}
        <div className="flex justify-center mt-6 md:mt-10">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0F1417] text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] shadow-md hover:bg-[#26B3FF] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <Instagram size={15} strokeWidth={2.2} />
            Follow @priority.bags
          </a>
        </div>
      </div>
    </section>
  );
};

const InstagramCardContent: React.FC<{ card: InstagramCardData }> = ({ card }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (card.video && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (card.video && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col h-full group"
    >
      {/* Card Header: Profile Info & Stats */}
      <div className="p-3 sm:p-3.5 pb-2 sm:pb-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Avatar */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 p-0.5 flex-shrink-0 overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={card.avatar}
              alt={card.handle}
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = card.avatarFallback;
              }}
            />
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-3 text-center gap-0.5">
            <div className="flex flex-col">
              <span className="font-bold text-[11px] sm:text-[12px] text-gray-900 leading-tight">
                {card.posts}
              </span>
              <span className="text-[8px] sm:text-[9px] text-gray-400 font-normal leading-none mt-0.5">
                posts
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[11px] sm:text-[12px] text-gray-900 leading-tight">
                {card.followers}
              </span>
              <span className="text-[8px] sm:text-[9px] text-gray-400 font-normal leading-none mt-0.5">
                followers
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[11px] sm:text-[12px] text-gray-900 leading-tight">
                {card.following}
              </span>
              <span className="text-[8px] sm:text-[9px] text-gray-400 font-normal leading-none mt-0.5">
                following
              </span>
            </div>
          </div>

          {/* 3 dots menu */}
          <div className="text-gray-400 pl-0.5">
            <MoreVertical size={14} />
          </div>
        </div>

        {/* Username handle */}
        <div className="mt-1.5">
          <span className="font-bold text-[11px] sm:text-[12px] text-gray-900 tracking-tight">
            {card.handle}
          </span>
        </div>
      </div>

      {/* Main Media Container */}
      <a
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden block"
      >
        <img
          src={card.img}
          alt={card.caption}
          loading="lazy"
          className={`w-full h-full object-cover object-center transition-all duration-500 pointer-events-none group-hover:scale-[1.02] ${
            card.video && isHovered ? 'opacity-0' : 'opacity-100'
          }`}
          onError={(e) => {
            if (card.fallback) {
              (e.target as HTMLImageElement).src = card.fallback;
            }
          }}
        />

        {/* Video stream */}
        {card.video && (
          <>
            <video
              ref={videoRef}
              src={card.video}
              muted
              loop
              playsInline
              preload="none"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              className={`absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white pointer-events-none transition-opacity duration-300 ${
                isHovered ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </>
        )}

        {!card.video && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none">
            <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm">
              <Instagram size={17} />
            </div>
          </div>
        )}
      </a>

      {/* Card Footer */}
      <div className="p-3 sm:p-3.5 pt-2 sm:pt-2.5 flex flex-col gap-1.5 flex-1 justify-between">
        {/* Icons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Red Heart */}
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-[#ED4956] text-[#ED4956]" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>

            {/* Comment Bubble */}
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-gray-800 -scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.818-.817c.07-.464.204-1.02.39-1.637A8.13 8.13 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>

            {/* Send Airplane */}
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-gray-800 -rotate-12 transform" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>

          {/* Bookmark */}
          <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </div>

        {/* Caption */}
        <p className="text-[11px] sm:text-[12px] text-gray-800 font-medium leading-snug line-clamp-2">
          {card.caption}
        </p>
      </div>
    </div>
  );
};
