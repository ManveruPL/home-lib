import { Text } from './text';

export function FieldLabel({ children }: { children: string }) {
  return (
    <Text variant="label" className="uppercase tracking-wide text-on-surface-variant">
      {children}
    </Text>
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <Text variant="bodySmall" className="text-error">
      {children}
    </Text>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="headline" className="mt-2 text-xl text-primary">
      {children}
    </Text>
  );
}
