import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      document.body.dataset.modalScrollY = String(scrollY);

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const shouldCompensate = scrollbarWidth > 0 && window.matchMedia('(pointer: fine)').matches;
      if (shouldCompensate) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const saved = document.body.dataset.modalScrollY;

      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      if (saved) {
        const y = Number.parseInt(saved, 10);
        if (Number.isFinite(y)) window.scrollTo(0, y);
      }
      delete document.body.dataset.modalScrollY;
    }

    return () => {
      const saved = document.body.dataset.modalScrollY;

      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      if (saved) {
        const y = Number.parseInt(saved, 10);
        if (Number.isFinite(y)) window.scrollTo(0, y);
      }
      delete document.body.dataset.modalScrollY;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[70dvh] sm:max-h-[80vh] pointer-events-auto relative z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 p-4 overscroll-contain">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0 flex gap-3 rounded-b-xl">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
