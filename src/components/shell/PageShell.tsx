import React from 'react';
import AppSidebar from './AppSidebar';
import Topbar from './Topbar';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  [key: string]: any; // To forward data- attributes
}

const PageShell: React.FC<PageShellProps> = ({ children, className = '', contentClassName = '', ...rest }) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`} {...rest}>
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
      <header role="banner" className="sticky top-0 z-10">
        <Topbar />
      </header>
      <div className="flex flex-1">
        <aside role="navigation" className="w-64">
          <AppSidebar />
        </aside>
        <main id="main-content" role="main" className={`flex-1 ${contentClassName}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageShell;