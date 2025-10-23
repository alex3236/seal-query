import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type InputOTPProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  length: number;
  separator?: string;
  separatorPositions?: number[]; // positions after which to insert separator (1-based)
  charPattern?: RegExp; // per-character validator
  placeholderChar?: string;
  value?: string; // controlled raw (no separators)
  onValueChange?: (raw: string) => void;
  name?: string; // hidden input name for forms
};

/**
 * InputOTP
 *
 * This variant uses the input itself to both accept and render the typed text,
 * and places a lighter "mask" element underneath. As the user types, the input's
 * characters visually cover the mask, producing a progressive-format-hint effect.
 *
 * Advantages:
 * - Input is fully responsible for text rendering, selection, IME, accessibility.
 * - The mask is only a visual hint underneath and is covered by typed characters.
 *
 * Notes / caveats:
 * - Use a monospace font for perfect character alignment across mask & input.
 * - Be careful with IME/composition; we avoid interfering during composition.
 */
const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>((props, ref) => {
  const {
    length,
    separator = "-",
    separatorPositions = [],
    charPattern = /^\d$/,
    placeholderChar = "X",
    value: controlledValue,
    onValueChange,
    name,
    className = "",
    inputMode = "text",
    autoComplete = "false",
    ...rest
  } = props;

  // normalize separator positions
  const seps = Array.from(
    new Set(separatorPositions.filter((p) => p > 0 && p < length))
  ).sort((a, b) => a - b);

  const escapeRegExp = (s: string) =>
    s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sepRegex = new RegExp(escapeRegExp(separator), "g");

  const [internalRaw, setInternalRaw] = useState("");
  const composingRef = useRef(false);

  const raw = controlledValue !== undefined ? controlledValue : internalRaw;

  // convert raw (no separators) -> formatted (with separators)
  const formatRaw = (rawVal: string) => {
    rawVal = rawVal.toUpperCase();
    let out = "";
    let idx = 0;
    for (let i = 0; i < rawVal.length; i++) {
      out += rawVal[i];
      idx++;
      if (seps.includes(idx) && idx < rawVal.length) {
        out += separator;
      }
    }
    return out;
  };

  // mask example: "XXXX-XXXX-XXXX"
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

  // helper to strip separators and filter by charPattern
  const stripAndFilter = (s: string) => {
    const withoutSeps = s.replace(sepRegex, "");
    const chars = Array.from(withoutSeps).filter((ch) =>
      charPattern.test(ch)
    );
    return chars.slice(0, length).join("");
  };

  // refs & caret handling
  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const pendingRawCaret = useRef<number | null>(null);

  // map raw index -> formatted index (for caret)
  const formattedIndexFromRawIndex = (rawIndex: number) => {
    let formattedIndex = rawIndex;
    for (const p of seps) {
      if (rawIndex > p) formattedIndex += separator.length;
    }
    return formattedIndex;
  };

  // count valid raw characters before formatted index
  const rawCountBeforeIndex = (formattedStr: string, idx: number) => {
    const sub = formattedStr.slice(0, idx);
    const without = sub.replace(sepRegex, "");
    return Array.from(without).filter((ch) => charPattern.test(ch)).length;
  };

  // keep caret after updates
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    if (pendingRawCaret.current == null) return;
    const rawCaret = pendingRawCaret.current;
    pendingRawCaret.current = null;
    const pos = Math.min(
      formatRaw(raw).length,
      Math.max(0, formattedIndexFromRawIndex(rawCaret))
    );
    try {
      el.setSelectionRange(pos, pos);
    } catch {
      // ignore
    }
  }, [raw]);

  // handle change on visible input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // if composing (IME), don't process yet
    if (composingRef.current) return;

    const formattedValue = e.target.value;
    const sel = e.target.selectionStart ?? formattedValue.length;

    // create new raw by stripping & filtering
    const newRaw = stripAndFilter(formattedValue);

    // compute raw caret position
    let rawBefore = rawCountBeforeIndex(formattedValue, sel);
    if (rawBefore > newRaw.length) rawBefore = newRaw.length;

    if (controlledValue === undefined) {
      setInternalRaw(newRaw);
    }
    onValueChange?.(newRaw);

    pendingRawCaret.current = rawBefore;
  };

  // handle keydown for nicer backspace/delete across separators
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = inputRef.current;
    if (!el) return;
    const selStart = el.selectionStart ?? 0;
    const selEnd = el.selectionEnd ?? 0;

    // Backspace: if cursor just after a separator, move left to delete previous char
    if (e.key === "Backspace" && selStart === selEnd && selStart > 0) {
      // if the char just before caret is part of separator (matches first/last char of separator)
      const beforeChar = formatRaw(raw)[selStart - 1];
      if (beforeChar !== undefined && beforeChar === separator[separator.length - 1]) {
        e.preventDefault();
        // move caret left by 1 (over the separator), then trigger a synthetic key event
        const newPos = selStart - 1;
        setTimeout(() => {
          try {
            el.setSelectionRange(newPos, newPos);
          } catch {}
        }, 0);
      }
    }

    // Delete: if cursor just before a separator, move right over separator
    if (e.key === "Delete" && selStart === selEnd) {
      const nextChar = formatRaw(raw)[selStart];
      if (nextChar !== undefined && nextChar === separator[0]) {
        e.preventDefault();
        const newPos = selStart + 1;
        setTimeout(() => {
          try {
            el.setSelectionRange(newPos, newPos);
          } catch {}
        }, 0);
      }
    }

    if (typeof props.onKeyDown === "function") props.onKeyDown(e);
  };

  // composition (IME) handlers
  const handleCompositionStart = () => {
    composingRef.current = true;
  };
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    // after composition ends, process the current value
    const target = e.target as HTMLInputElement;
    // reuse change logic on composition end
    const formattedValue = target.value;
    const sel = target.selectionStart ?? formattedValue.length;
    const newRaw = stripAndFilter(formattedValue);
    let rawBefore = rawCountBeforeIndex(formattedValue, sel);
    if (rawBefore > newRaw.length) rawBefore = newRaw.length;
    if (controlledValue === undefined) setInternalRaw(newRaw);
    onValueChange?.(newRaw);
    pendingRawCaret.current = rawBefore;
  };

  // handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const filtered = stripAndFilter(text);
    const merged = (raw + filtered).slice(0, length);
    if (controlledValue === undefined) setInternalRaw(merged);
    onValueChange?.(merged);
    // place caret at end of inserted content
    pendingRawCaret.current = merged.length;
    // ensure input value updates
    setTimeout(() => {
      try {
        inputRef.current?.focus();
      } catch {}
    }, 0);
  };

  // when controlled value is too long, trim and notify
  useEffect(() => {
    if (controlledValue !== undefined && controlledValue.length > length) {
      const trimmed = controlledValue.slice(0, length);
      onValueChange?.(trimmed);
    }
  }, [controlledValue, length, onValueChange]);

  const formatted = formatRaw(raw);

  return (
    <div className={`relative inline-block w-full font-mono ${className}`}>
      {/* The mask sits underneath; input sits above and has transparent background so typed characters cover the mask. */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center px-3 py-2 pointer-events-none select-none whitespace-pre"
      >
        <div className="w-full text-gray-300 dark:text-gray-500 text-left">
          {" ".repeat(formatted.length)}
          {mask.substring(formatted.length)}
        </div>
      </div>

      <input
        {...rest}
        ref={inputRef}
        value={formatted}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onPaste={handlePaste}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="w-full border border-gray-300 dark:border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring rounded-xl"
      />

      {/* hidden raw input for form submission */}
      {name ? <input type="hidden" name={name} value={raw} readOnly /> : null}
    </div>
  );
});

InputOTP.displayName = "InputOTP";
export default InputOTP;