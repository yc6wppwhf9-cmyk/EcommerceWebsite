import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => (
  <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ${className}`}>
    {items.map((item, index) => {
      const isLast = index === items.length - 1;
      return (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={10} className="shrink-0" />}
          {item.href && !isLast ? (
            <Link to={item.href} className="hover:text-gray-700 transition-colors">{item.label}</Link>
          ) : (
            <span className={isLast ? 'text-gray-900' : ''}>{item.label}</span>
          )}
        </React.Fragment>
      );
    })}
  </nav>
);
