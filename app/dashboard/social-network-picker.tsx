"use client";

import { socialNetworks } from "@/lib/social-networks";
import { useState } from "react";

interface SocialNetworkPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export default function SocialNetworkPicker({
  value,
  onChange,
}: SocialNetworkPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedNetwork = socialNetworks.find((network) =>
    network.variants.some((variant) => variant.icon === value),
  );
  const selectedVariant = selectedNetwork?.variants.find(
    (variant) => variant.icon === value,
  );

  const selectIcon = (icon: string) => {
    onChange(icon);
    setIsOpen(false);
  };

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <i className={`${value} w-5 shrink-0 text-center text-lg`}></i>
        <span className="min-w-0 flex-1 truncate">
          {selectedNetwork
            ? `${selectedNetwork.name} - ${selectedVariant?.label}`
            : "Choisir un réseau ou une icône"}
        </span>
        <i className="fa-solid fa-chevron-down shrink-0 text-xs"></i>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-600 dark:bg-gray-800"
          role="listbox"
          aria-label="Réseaux sociaux et variantes"
        >
          {socialNetworks.map((network) => (
            <div key={network.id} className="mb-2 last:mb-0">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {network.name}
              </p>
              {network.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  role="option"
                  aria-selected={variant.icon === value}
                  onClick={() => selectIcon(variant.icon)}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm text-gray-800 hover:bg-indigo-50 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  <i className={`${variant.icon} w-5 text-center text-lg`}></i>
                  <span>{variant.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
