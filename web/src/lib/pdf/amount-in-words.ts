// Spells out a decimal money string (e.g. "3000.00") as English words for the
// PDF's "Total (in words)" line, e.g. "Three Thousand US Dollars Only".
// Dependency-free — no npm package pulled in for a single string conversion
// (CLAUDE.md rule 15).

const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];
const SCALES = ["", "Thousand", "Million", "Billion", "Trillion"];

const CURRENCY_NAMES: Record<string, { major: string; minor: string }> = {
  USD: { major: "US Dollars", minor: "Cents" },
  INR: { major: "Rupees", minor: "Paise" },
  EUR: { major: "Euros", minor: "Cents" },
  GBP: { major: "Pounds", minor: "Pence" },
};

function twoDigitsToWords(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS[tens] : `${TENS[tens]} ${ONES[ones]}`;
}

function threeDigitsToWords(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds === 0) return twoDigitsToWords(rest);
  const hundredsPart = `${ONES[hundreds]} Hundred`;
  return rest === 0 ? hundredsPart : `${hundredsPart} ${twoDigitsToWords(rest)}`;
}

function integerToWords(value: number): string {
  if (value === 0) return "Zero";

  const groups: number[] = [];
  let remaining = value;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const groupWords = threeDigitsToWords(groups[i]);
    parts.push(SCALES[i] ? `${groupWords} ${SCALES[i]}` : groupWords);
  }
  return parts.join(" ");
}

export function amountInWords(decimalAmount: string, currency: string): string {
  const [wholePart, fractionPart = "00"] = decimalAmount.split(".");
  const whole = Math.abs(parseInt(wholePart, 10) || 0);
  const cents = Math.round(parseInt(fractionPart.padEnd(2, "0").slice(0, 2), 10) || 0);

  const names = CURRENCY_NAMES[currency] ?? { major: currency, minor: "Cents" };

  const majorWords = `${integerToWords(whole)} ${names.major}`;
  if (cents === 0) {
    return `${majorWords} Only`;
  }
  return `${majorWords} and ${integerToWords(cents)} ${names.minor} Only`;
}
