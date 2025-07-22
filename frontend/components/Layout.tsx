
import React, { useState, createContext, useContext, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import { useData } from '../context/DataContext';

const navigationItems = [
  { title: "Dashboard", href: "/dashboard", icon: "layout-dashboard", color: "text-orange-600" },
  { title: "Cardápio Online", href: "/cardapio", icon: "pie-chart", color: "text-red-600" },
  { title: "Pedidos", href: "/pedidos", icon: "shopping-bag", color: "text-blue-600" },
  { title: "Cozinha", href: "/cozinha", icon: "chef-hat", color: "text-green-600" },
  { title: "Mesas", href: "/mesas", icon: "users", color: "text-purple-600" },
  { title: "Financeiro", href: "/financeiro", icon: "line-chart", color: "text-emerald-600" },
  { title: "Relatórios", href: "/relatorios", icon: "file-text", color: "text-cyan-600" },
  { title: "Clientes", href: "/clientes", icon: "contact", color: "text-indigo-600" },
  { title: "Gerenciar Cardápio", href: "/gestao", icon: "book-open", color: "text-teal-600" },
  { title: "Configurações", href: "/settings", icon: "settings", color: "text-gray-600" }
];

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </SidebarContext.Provider>
    );
};

const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

const Sidebar: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isOpen } = useSidebar();
    return (
        <aside className={`fixed lg:relative lg:translate-x-0 z-50 w-72 h-full bg-white/80 backdrop-blur-xl border-r border-orange-100 transition-transform duration-300 ease-in-out print-hide ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">{children}</div>
        </aside>
    );
};

const SidebarHeader: React.FC<{ children: ReactNode }> = ({ children }) => <header className="border-b border-orange-100 p-6">{children}</header>;
const SidebarContent: React.FC<{ children: ReactNode }> = ({ children }) => <main className="flex-1 overflow-y-auto p-4 hide-scrollbar">{children}</main>;
const SidebarFooter: React.FC<{ children: ReactNode }> = ({ children }) => <footer className="border-t border-orange-100 p-6">{children}</footer>;

const SidebarTrigger: React.FC = () => {
    const { setIsOpen } = useSidebar();
    return (
        <button onClick={() => setIsOpen(o => !o)} className="lg:hidden p-2 rounded-xl hover:bg-orange-100 transition-colors duration-200">
            <Icon name="menu" className="w-6 h-6 text-gray-800" />
        </button>
    );
};

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isOpen, setIsOpen } = useSidebar();
  const location = useLocation();
  const { pizzeriaInfo } = useData();

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 pizza-gradient rounded-2xl flex items-center justify-center pizza-shadow">
              <Icon name="pie-chart" className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Japede</h2>
              <p className="text-sm text-orange-600 font-medium">Gestão Completa</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.title}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 text-red-700 shadow-lg'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <Icon name={item.icon} className={`w-5 h-5 ${isActive ? item.color : 'text-gray-600'} transition-colors`} />
                  <span className="font-semibold text-sm text-gray-800">{item.title}</span>
                  {isActive && (
                    <div className="absolute right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-4">
            {pizzeriaInfo.logoUrl ? (
                <img src={pizzeriaInfo.logoUrl} alt="Logo da Pizzaria" className="w-10 h-10 rounded-xl object-cover bg-white"/>
            ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{pizzeriaInfo.nome.charAt(0).toUpperCase()}</span>
                </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{pizzeriaInfo.nome}</p>
              <p className="text-xs text-gray-500">Sistema Ativo</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/30 z-40 lg:hidden" />}

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-orange-100 px-6 py-3 flex items-center justify-between lg:hidden print-hide">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <Icon name="pie-chart" className="w-6 h-6 text-red-600" />
            <h1 className="text-lg font-bold text-gray-900">Japede</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

const PageLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <SidebarProvider>
            <Layout>{children}</Layout>
        </SidebarProvider>
    );
};

export default PageLayout;