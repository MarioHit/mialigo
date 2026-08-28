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
  const [search, setSearch] = useState("");
  const selectedNetwork = socialNetworks.find((network) =>
    network.variants.some((variant) => variant.icon === value),
  );
  const selectedVariant = selectedNetwork?.variants.find(
    (variant) => variant.icon === value,
  );

  const selectIcon = (icon: string) => {
    onChange(icon);
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredNetworks = socialNetworks
    .map((network) => ({
      ...network,
      variants: network.variants.filter((variant) =>
        [network.name, variant.label, variant.icon].some((text) =>
          text.toLowerCase().includes(normalizedSearch),
        ),
      ),
    }))
    .filter((network) => network.variants.length > 0);

  const closePicker = () => {
    setIsOpen(false);
    setSearch("");
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
          className="absolute left-0 right-0 z-20 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-600 dark:bg-gray-800"
          role="listbox"
          aria-label="Réseaux sociaux et variantes"
        >
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Rechercher un réseau ou un logo..."
            aria-label="Rechercher un réseau ou un logo"
            autoFocus
            className="mb-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />

          {filteredNetworks.length > 0 ? (
            filteredNetworks.map((network) => (
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
                    <i
                      className={`${variant.icon} w-5 text-center text-lg`}
                    ></i>
                    <span>{variant.label}</span>
                  </button>
                ))}
              </div>
            ))
          ) : (
            <p className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400">
              Aucun logo trouvé. Utilise la saisie personnalisée ci-dessous.
            </p>
          )}

          <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-600">
            <label className="block px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Icône personnalisée
            </label>
            <input
              type="text"
              value={selectedNetwork ? "" : value}
              onChange={(event) => selectIcon(event.target.value)}
              placeholder="fa-solid fa-star"
              aria-label="Classe Font Awesome personnalisée"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <div className="mt-2 flex items-center gap-2 px-2 text-xs text-gray-500 dark:text-gray-400">
              <i className={`${value} w-5 text-center text-base`}></i>
              <span className="truncate">{value || "Aucune icône"}</span>
            </div>
            <button
              type="button"
              onClick={closePicker}
              className="mt-2 w-full rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
