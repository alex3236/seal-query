"use client";
import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";

type InputOTPSafeProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "defaultValue"
> & {
  length: number;
  separator?: string;
  separatorPositions?: number[];
  charPattern?: RegExp;
  placeholderChar?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (raw: string) => void;
  name?: string;
  uppercase?: boolean; // new: auto uppercase
};

/**
 * InputOTPSafe — secure OTP input supporting CJK
 * transparent input + visual layer, avoids composition conflicts
 */
const InputOTP = forwardRef<HTMLInputElement, InputOTPSafeProps>(
  (
    {
      length,
      separator = "-",
      separatorPositions = [],
      charPattern = /^[A-Za-z0-9]$/,
      placeholderChar = "•",
      value: controlledValue,
      defaultValue,
      onValueChange,
      name,
      className = "",
      uppercase = true, // default: auto uppercase enabled
      ...rest
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const [internalValue, setInternalValue] = useState(defaultValue || "");
    const raw = controlledValue ?? internalValue;

    // normalize separator positions
    const seps = Array.from(
      new Set(separatorPositions.filter((p) => p > 0 && p < length))
    ).sort((a, b) => a - b);

    const escapeRegExp = (s: string) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sepRegex = new RegExp(escapeRegExp(separator), "g");

    // format with separators
    const formatRaw = (r: string) => {
      let out = "";
      let idx = 0;
      for (let i = 0; i < r.length; i++) {
        out += r[i];
        idx++;
        if (seps.includes(idx) && idx < r.length) out += separator;
      }
      return out;
    };

    // strip separators + filter invalid chars
    const stripAndFilter = (s: string) =>
      Array.from(s.replace(sepRegex, ""))
        .filter((ch) => charPattern.test(ch))
        .slice(0, length)
        .join("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value;
      if (uppercase) v = v.toUpperCase();
      const filtered = stripAndFilter(v);
      if (controlledValue == null) setInternalValue(filtered);
      onValueChange?.(filtered);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      let text = e.clipboardData.getData("text");
      if (uppercase) text = text.toUpperCase();
      const filtered = stripAndFilter(text);
      const merged = filtered.slice(0, length);
      if (controlledValue == null) setInternalValue(merged);
      onValueChange?.(merged);
    };

    // auto-trim when exceeding length
    useEffect(() => {
      if (controlledValue && controlledValue.length > length) {
        const trimmed = controlledValue.slice(0, length);
        onValueChange?.(trimmed);
      }
    }, [controlledValue, length, onValueChange]);

    const formatted = formatRaw(raw);

    const mask = (() => {
      let m = "";
      let cnt = 0;
      for (let i = 0; i < length; i++) {
        m += placeholderChar;
        cnt++;
        if (seps.includes(cnt) && cnt < length) m += separator;
      }
      return m;
    })();

    return (
      <div
        className={`relative inline-block font-mono w-full cursor-text ${className}`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* visual layer */}
        <div
          className="absolute inset-0 flex items-center px-3 py-2
                     whitespace-pre select-none pointer-events-none"
        >
          <span className="text-gray-900 dark:text-gray-200">
            {formatted}
          </span>
          <span className="text-gray-300 dark:text-gray-600">
            {mask.slice(formatted.length)}
          </span>
        </div>

        {/* real input layer */}
        <input
          ref={inputRef}
          {...rest}
          value={formatted}
          onChange={handleChange}
          onPaste={handlePaste}
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          type="password"
          className="w-full bg-transparent text-transparent selection:text-transparent selection:bg-blue-500 caret-black dark:caret-white
                     border border-gray-300 dark:border-gray-500
                     rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 select-none"
        />

        {/* hidden form input */}
        {name ? <input type="hidden" name={name} value={raw} readOnly /> : null}
      </div>
    );
  }
);

InputOTP.displayName = "InputOTP";
export default InputOTP;
