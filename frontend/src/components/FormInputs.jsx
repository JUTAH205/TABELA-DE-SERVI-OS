import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";

// Uppercase input - converts all text to uppercase
export const UpperInput = forwardRef(({ onChange, ...props }, ref) => {
  const handleChange = (e) => {
    e.target.value = e.target.value.toUpperCase();
    if (onChange) onChange(e);
  };
  return <Input ref={ref} onChange={handleChange} {...props} style={{ textTransform: "uppercase", ...props.style }} />;
});
UpperInput.displayName = "UpperInput";

// Date input DD/MM - auto-inserts "/" after 2 digits
export const DateInput = forwardRef(({ value, onChange, ...props }, ref) => {
  const handleChange = (e) => {
    let val = e.target.value.replace(/[^0-9/]/g, "");
    // Remove all slashes to work with raw digits
    const digits = val.replace(/\//g, "");
    if (digits.length >= 2) {
      val = digits.slice(0, 2) + "/" + digits.slice(2, 4);
    } else {
      val = digits;
    }
    if (val.length > 5) val = val.slice(0, 5);
    e.target.value = val;
    if (onChange) onChange(e);
  };
  return <Input ref={ref} value={value} onChange={handleChange} placeholder="DD/MM" maxLength={5} {...props} />;
});
DateInput.displayName = "DateInput";

// Time input HH:MM - auto-inserts ":" after 2 digits
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
