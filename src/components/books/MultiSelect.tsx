'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  maxDisplayed?: number;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Auswählen...',
  label,
  icon,
  maxDisplayed = 2,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const clearAll = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length <= maxDisplayed) {
      return selected.join(', ');
    }
    return `${selected.slice(0, maxDisplayed).join(', ')} +${selected.length - maxDisplayed}`;
  };

  const renderDropdown = () => {
    if (!isOpen) return null;

    const dropdown = (
      <div
        ref={dropdownRef}
        style={{
          position: 'absolute',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 9999,
        }}
        className="mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        {options.length > 0 ? (
          options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={() => toggleOption(option)}
              />
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                {option}
              </span>
              {selected.includes(option) && (
                <Check className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              )}
            </label>
          ))
        ) : (
          <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
            Keine Optionen verfügbar
          </div>
        )}
      </div>
    );

    return createPortal(dropdown, document.body);
  };

  return (
    <div>
      {label && (
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {icon}
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
          selected.length > 0
            ? 'border-amber-500 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/20'
            : 'border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
        }`}
      >
        <span
          className={`flex-1 truncate ${
            selected.length === 0
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {getDisplayText()}
        </span>

        <div className="flex items-center gap-1">
          {selected.length > 0 && (
            <div
              role="button"
              tabIndex={0}
              onClick={clearAll}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  clearAll(e);
                }
              }}
              className="cursor-pointer rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform dark:text-gray-400 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {renderDropdown()}
    </div>
  );
}
