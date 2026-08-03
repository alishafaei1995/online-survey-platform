import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { setLanguage } from '../../i18n';
import LogoPlaceholder from '../common/LogoPlaceholder';

export default function AppShell() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleLanguage() {
    setLanguage(i18n.language === 'fa' ? 'en' : 'fa');
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleNavClick() {
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900" onClick={handleNavClick}>
            <LogoPlaceholder className="h-8 w-8" />
            <span className="hidden sm:inline">{t('common.appName')}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
              {t('nav.surveys')}
            </Link>
            {user?.role === 'admin' && (
              <Link to="/users" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
                {t('nav.users')}
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/system-info" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
                {t('nav.systemInfo')}
              </Link>
            )}
            <Link to="/participants" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
              {t('nav.participants')}
            </Link>
            <Link to="/account/password" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
              {t('nav.account')}
            </Link>
            <Link to="/surveys/new" className="btn-primary ms-1">
              {t('nav.newSurvey')}
            </Link>
            <span className="w-px h-5 bg-slate-200 mx-2" />
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition text-xs font-medium"
            >
              {i18n.language === 'fa' ? 'EN' : 'فا'}
            </button>
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
              >
                {t('common.logout')}
              </button>
            )}
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 text-xs font-medium"
            >
              {i18n.language === 'fa' ? 'EN' : 'فا'}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="menu"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100"
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-slate-200/80 px-4 py-3 flex flex-col gap-1 text-sm bg-white">
            <Link to="/" onClick={handleNavClick} className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
              {t('nav.surveys')}
            </Link>
            {user?.role === 'admin' && (
              <Link to="/users" onClick={handleNavClick} className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
                {t('nav.users')}
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/system-info" onClick={handleNavClick} className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
                {t('nav.systemInfo')}
              </Link>
            )}
            <Link to="/participants" onClick={handleNavClick} className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
              {t('nav.participants')}
            </Link>
            <Link to="/account/password" onClick={handleNavClick} className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
              {t('nav.account')}
            </Link>
            <Link to="/surveys/new" onClick={handleNavClick} className="btn-primary justify-center mt-1">
              {t('nav.newSurvey')}
            </Link>
            {user && (
              <button
                type="button"
                onClick={() => {
                  handleNavClick();
                  handleLogout();
                }}
                className="px-3 py-2 rounded-lg text-start text-slate-500 hover:bg-red-50 hover:text-red-600 mt-1"
              >
                {t('common.logout')}
              </button>
            )}
          </nav>
        )}
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
