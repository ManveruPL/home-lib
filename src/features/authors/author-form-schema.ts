import { z } from 'zod';

// Year (YYYY) or ISO date (YYYY-MM-DD); Open Library dates are free text, so anything is accepted
// when it comes from a lookup, but the form asks for this format.
const lifeDate = z
  .string()
  .trim()
  .regex(/^(\d{1,4}(-\d{2}(-\d{2})?)?)?$/, 'validation.dateFormat');

export const authorFormSchema = z.object({
  name: z.string().trim().min(1, 'validation.required'),
  biography: z.string(),
  birthDate: lifeDate,
  deathDate: lifeDate,
});

export type AuthorFormValues = z.infer<typeof authorFormSchema>;

export const authorFormDefaults: AuthorFormValues = {
  name: '',
  biography: '',
  birthDate: '',
  deathDate: '',
};
