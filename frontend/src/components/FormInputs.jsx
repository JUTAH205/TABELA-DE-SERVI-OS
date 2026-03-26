import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";

// Uppercase input
export const UpperInput = forwardRef(({ onChange, ...props }, ref) => {
  const handleChange = (e) => {
    e.target.value = e.target.value.toUpperCase();
    if (onChange) onChange(e);
  };
  return <Input ref={ref} onChange={handleChange} {...props} style={{ textTransform: "uppercase", ...props.style }} />;
});
UpperInput.displayName = "UpperInput";

// Date input DD/MM/AAAA - auto-inserts "/" after day and month
export const DateInput = forwardRef(({ value, onChange, ...props }, ref) => {
  const handleChange = (e) => {
    let val = e.target.value.replace(/[^0-9/]/g, "");
    const digits = val.replace(/\//g, "");
    if (digits.length >= 4) {
      val = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4, 8);
    } else if (digits.length >= 2) {
      val = digits.slice(0, 2) + "/" + digits.slice(2, 4);
    } else {
      val = digits;
    }
    if (val.length > 10) val = val.slice(0, 10);
    e.target.value = val;
    if (onChange) onChange(e);
  };
  return <Input ref={ref} value={value} onChange={handleChange} placeholder="DD/MM/AAAA" maxLength={10} {...props} />;
});
DateInput.displayName = "DateInput";

// Time input HH:MM
export const TimeInput = forwardRef(({ value, onChange, ...props }, ref) => {
  const handleChange = (e) => {
    let val = e.target.value.replace(/[^0-9:]/g, "");
    const digits = val.replace(/:/g, "");
    if (digits.length >= 2) {
      val = digits.slice(0, 2) + ":" + digits.slice(2, 4);
    } else {
      val = digits;
    }
    if (val.length > 5) val = val.slice(0, 5);
    e.target.value = val;
    if (onChange) onChange(e);
  };
  return <Input ref={ref} value={value} onChange={handleChange} placeholder="HH:MM" maxLength={5} {...props} />;
});
TimeInput.displayName = "TimeInput";

// GPS input - auto-formats to 38º31.561'N inline
export const GPSInput = forwardRef(({ value, onChange, hemisferio = "N", ...props }, ref) => {
  // Store raw digits internally, display formatted
  const rawFromFormatted = (str) => {
    if (!str) return "";
    return String(str).replace(/[^0-9.]/g, "");
  };

  const formatGPS = (raw) => {
    if (!raw || raw.length === 0) return "";
    const clean = String(raw).replace(/[^0-9.]/g, "");
    if (clean.includes(".")) {
      const parts = clean.split(".");
      const intPart = parts[0];
      const decPart = parts[1] || "";
      if (intPart.length >= 3) {
        const graus = intPart.slice(0, intPart.length - 2);
        const min = intPart.slice(-2);
        return `${graus}º${min}.${decPart.slice(0, 3)}\'${hemisferio}`;
      }
      return clean;
    }
    if (clean.length >= 5) {
      const graus = clean.length >= 6 ? clean.slice(0, 3) : clean.slice(0, 2);
      const rest = clean.slice(graus.length);
      const min = rest.slice(0, 2);
      const dec = rest.slice(2, 5);
      return `${graus}º${min}.${dec}\'${hemisferio}`;
    }
    return clean;
  };

  const handleChange = (e) => {
    const raw = rawFromFormatted(e.target.value);
    e.target.value = raw;
    if (onChange) onChange(e);
  };

  return (
    <Input
      ref={ref}
      value={formatGPS(value)}
      onChange={handleChange}
      placeholder={`Ex: 38º31.561\'${hemisferio}`}
      {...props}
    />
  );
});
GPSInput.displayName = "GPSInput";

// NIF input - exactly 9 digits
export const NIFInput = forwardRef(({ value, onChange, ...props }, ref) => {
  const handleChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 9) val = val.slice(0, 9);
    e.target.value = val;
    if (onChange) onChange(e);
  };
  const isValid = value && value.length === 9;
  const isPartial = value && value.length > 0 && value.length < 9;
  return (
    <div className="relative">
      <Input
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder="9 digitos"
        maxLength={9}
        className={`${isPartial ? "border-amber-400" : ""} ${props.className || ""}`}
        {...props}
      />
      {isPartial && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-amber-500">{value.length}/9</span>
      )}
    </div>
  );
});
NIFInput.displayName = "NIFInput";
