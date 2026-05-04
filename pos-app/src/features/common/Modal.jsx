import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Center wrapper - don't capture clicks */}
      <div className="relative flex items-center justify-center min-h-screen p-4 pointer-events-none">
        
        {/* Modal box - re-enable pointer events */}
        <div 
          className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto pointer-events-auto"
        >
          {children}
        </div>

      </div>
    </div>
  );
}