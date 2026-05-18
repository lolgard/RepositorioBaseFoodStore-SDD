import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

export default function ImageModal({ isOpen, onClose, src, alt }: ImageModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-custom-950/85 backdrop-blur-md cursor-zoom-out"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden bg-surface-custom-900 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 flex flex-col items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 border border-white/10 text-white rounded-full transition-all hover:scale-105 active:scale-95"
            >
              <X size={20} />
            </button>

            {/* Image */}
            <img
              src={src}
              alt={alt || "Vista previa ampliada"}
              className="w-full h-full object-contain max-h-[80vh] rounded-3xl"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
