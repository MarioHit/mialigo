"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error(
      "useConfirm doit être utilisé dans un ConfirmDialogProvider",
    );
  }
  return context;
}

export default function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );

  const confirm = useCallback<ConfirmFn>((opts) => {
    const normalized = typeof opts === "string" ? { message: opts } : opts;
    return new Promise((resolve) => {
      setOptions(normalized);
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = (result: boolean) => {
    resolver?.(result);
    setOptions(null);
    setResolver(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            {options.title && (
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {options.title}
              </h3>
            )}
            <p className="mb-6 text-sm text-gray-700 dark:text-gray-300">
              {options.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                {options.cancelLabel || "Annuler"}
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
              >
                {options.confirmLabel || "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
