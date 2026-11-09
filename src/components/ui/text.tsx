import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

// Type scale from .ai-data/branding/branding.md: Lora for display and headings,
// Plus Jakarta Sans for interface text.
const variants = {
  display: 'font-serif text-[32px] leading-[40px] font-bold',
  headline: 'font-serif text-2xl leading-[30px] font-semibold',
  title: 'font-sans text-base leading-6 font-medium',
  body: 'font-sans text-base leading-6',
  bodySmall: 'font-sans text-xs leading-4',
  label: 'font-sans text-[11px] leading-4 font-medium',
} as const;

export type TextVariant = keyof typeof variants;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
};

export function Text({ variant = 'body', className, ...props }: TextProps) {
  return (
    <RNText className={`text-on-surface ${variants[variant]} ${className ?? ''}`} {...props} />
  );
}
