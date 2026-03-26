"use client";

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  decimalPlaces?: number;
}

export function NumberInput({
  value,
  onChange,
  onBlur,
  disabled,
  decimalPlaces = 2,
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let pattern;
    if (decimalPlaces > 0) {
      pattern = `^[0-9]*\\.?[0-9]{0,${decimalPlaces}}$`;
    } else {
      pattern = "^[0-9]*$";
    }
    const regex = new RegExp(pattern);
    if (regex.test(value)) {
      onChange(value);
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      disabled={disabled}
      className="w-full p-2 border rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
    />
  );
}
