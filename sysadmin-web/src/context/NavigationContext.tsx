import React, { createContext, useContext, useState } from 'react';

interface NavigationContextType {
  isMobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
  openMobile: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);
  const openMobile = () => setIsMobileOpen(true);

  return (
    <NavigationContext.Provider value={{ isMobileOpen, toggleMobile, closeMobile, openMobile }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useMobileNav = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      isMobileOpen: false,
      toggleMobile: () => {},
      closeMobile: () => {},
      openMobile: () => {},
    };
  }
  return context;
};
