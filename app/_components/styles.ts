// Shared Tailwind class strings for auth UI primitives.
// Values mirror the Figma design tokens (card: #E6E6E6 border / 20px radius,
// inputs & secondary buttons: 48px height / 10px radius / #C8C8C8 border).

export const CARD_CLASS =
  "w-full max-w-[540px] rounded-[20px] border border-[#E6E6E6] bg-white pt-12 pb-6 px-[72px]";

export const LABEL_CLASS = "mb-2 block text-sm font-medium text-gray-700";

export const INPUT_CLASS =
  "h-12 w-full rounded-[10px] border border-[#C8C8C8] bg-white px-4 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none";

// Primary CTA: Montserrat SemiBold 16/140%/2% per Figma.
export const BTN_PRIMARY_CLASS =
  "flex h-12 w-full items-center justify-center rounded-[10px] bg-neutral-900 px-4 text-base font-semibold leading-[1.4] tracking-[0.02em] text-[#FCFCFD] transition hover:bg-neutral-800 disabled:opacity-60";

// Secondary (Google etc.): same dimensions, white bg, #C8C8C8 border.
export const BTN_SECONDARY_CLASS =
  "flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-[#C8C8C8] bg-white px-4 text-base font-semibold leading-[1.4] tracking-[0.02em] text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60";
