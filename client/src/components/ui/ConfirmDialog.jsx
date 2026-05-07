import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'تأكيد', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-orange-100'}`}>
          <AlertTriangle className={`w-7 h-7 ${danger ? 'text-red-600' : 'text-orange-600'}`} />
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 btn-secondary py-2.5">إلغاء</button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 font-semibold px-4 py-2.5 rounded-lg transition-all ${danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
