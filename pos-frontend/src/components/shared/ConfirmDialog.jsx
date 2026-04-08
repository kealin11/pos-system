import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Deletion',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  busy = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!busy ? onCancel : undefined}
      />

      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-[#3a3a3a] bg-[#171717] p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-950 text-red-300">
            <FiAlertTriangle size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#b8b8b8]">{message}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#303030] bg-[#111111] px-4 py-3 text-sm text-[#8f8f8f]">
          This action cannot be undone.
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-2xl border border-[#3a3a3a] px-4 py-3 text-sm font-semibold text-[#d0d0d0] transition-colors hover:border-[#565656] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-2xl bg-red-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
