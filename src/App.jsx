import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PDFPreviewModal from './components/PDFPreviewModal';
import AdminLoginModal from './components/AdminLoginModal';
import { paperService } from './services/paperService';
import { authService } from './services/authService';
import { Loader2 } from 'lucide-react';

// Lazy loading views for high performance
const StudentView = lazy(() => import('./views/StudentView'));
const AdminView = lazy(() => import('./views/AdminView'));

export default function App() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    authService.isAuthenticated()
  );
  const [isAdminViewActive, setIsAdminViewActive] = useState(
    authService.isAuthenticated()
  );

  // Modals
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [previewPaper, setPreviewPaper] = useState(null);

  // Direct Admin URL Detection (#admin, ?admin, /admin)
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (path.includes('admin') || hash.includes('admin') || search.includes('admin')) {
        if (authService.isAuthenticated()) {
          setIsAdminAuthenticated(true);
          setIsAdminViewActive(true);
        } else {
          setAdminLoginModalOpen(true);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);

    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  // Subscribe to real-time papers sync
  useEffect(() => {
    setLoading(true);
    const unsubscribe = paperService.subscribePapers((updatedPapers) => {
      setPapers(updatedPapers);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleDownload = async (paper) => {
    await paperService.downloadPaper(paper);
  };

  const handlePreview = (paper) => {
    setPreviewPaper(paper);
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminViewActive(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAdminAuthenticated(false);
    setIsAdminViewActive(false);
  };

  const handleTriggerAdminModal = () => {
    if (isAdminAuthenticated) {
      setIsAdminViewActive(true);
    } else {
      setAdminLoginModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isAdmin={isAdminAuthenticated && isAdminViewActive}
        onLogout={handleLogout}
        onSwitchView={(val) => setIsAdminViewActive(val)}
      />

      {/* Main View Router with Suspense */}
      <main className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading Z-EXAM Archive...</p>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            }
          >
            {isAdminAuthenticated && isAdminViewActive ? (
              <AdminView
                papers={papers}
                onDownload={handleDownload}
                onPreview={handlePreview}
              />
            ) : (
              <StudentView
                papers={papers}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onDownload={handleDownload}
                onPreview={handlePreview}
              />
            )}
          </Suspense>
        )}
      </main>

      {/* Footer (No Contact/Address info, with stealth admin trigger) */}
      <Footer onTriggerAdminModal={handleTriggerAdminModal} />

      {/* Modals */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <PDFPreviewModal
        paper={previewPaper}
        onClose={() => setPreviewPaper(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
