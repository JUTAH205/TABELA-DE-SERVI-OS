import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function AtividadeCombobox({ value, onChange, tipo, className }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const wrapperRef = useRef(null);

  useEffect(() => {
    api.listAtividades(tipo).then(setSuggestions).catch(() => {});
  }, [tipo]);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = suggestions.filter(s =>
    s.toUpperCase().includes(inputValue.toUpperCase())
  );

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setInputValue(val);
    onChange(val);
    setOpen(true);
  };

  const handleSelect = (s) => {
    setInputValue(s);
    onChange(s);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        className={className}
        style={{ textTransform: "uppercase" }}
        placeholder="Escrever ou selecionar atividade"
        data-testid="campo-atividade"
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-sm shadow-lg max-h-40 overflow-auto">
          {filtered.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors uppercase"
              data-testid={`atividade-option-${i}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
