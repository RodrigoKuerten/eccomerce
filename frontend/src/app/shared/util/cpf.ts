export function formatCpf(value: string | null | undefined): string {
  const digits = (value ?? '').replace(/\D/g, '');
  if (digits.length !== 11) return digits;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function cpfDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export const CPF_INPUT_PATTERN = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})?$/;
