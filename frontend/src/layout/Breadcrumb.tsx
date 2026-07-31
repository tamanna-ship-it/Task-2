import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 py-2.5 px-4 md:px-6 md:py-3 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
      <Link to="/" className="hover:text-indigo-600 flex items-center gap-1 flex-shrink-0">
        <Home className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Home</span>
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <React.Fragment key={name}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            {isLast ? (
              <span className="font-semibold text-slate-800 capitalize">{name}</span>
            ) : (
              <Link to={routeTo} className="hover:text-indigo-600 capitalize">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
