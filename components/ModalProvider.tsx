import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ModalType = 'alert' | 'confirm';

interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ModalContextType {
  showAlert: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);

  const showAlert = (title: string, message: string) => {
    setOptions({ title, message, type: 'alert' });
    setIsOpen(true);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setOptions({ title, message, type: 'confirm', onConfirm });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (options?.onCancel) options.onCancel();
    setTimeout(() => setOptions(null), 300);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (options?.onConfirm) options.onConfirm();
    setTimeout(() => setOptions(null), 300);
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {options.type === 'confirm' ? (
                      <AlertCircle className="w-6 h-6 text-amber-500" />
                    ) : (
                      <Info className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{options.title}</h3>
                    <p className="text-gray-300 text-sm">{options.message}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 px-6 py-4 flex justify-end gap-3">
                {options.type === 'confirm' && (
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    options.type === 'confirm'
                      ? 'bg-amber-500 text-black hover:bg-amber-400'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  {options.type === 'confirm' ? 'Confirm' : 'OK'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
