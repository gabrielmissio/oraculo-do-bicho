import { z } from 'zod';

const text = (max) => z.string().min(1).max(max).trim();

export const InterpretarSchema = z.object({
  input: text(500),
  modalidade: z
    .enum(['auto', 'sonho', 'numero', 'placa', 'cor', 'data', 'generalizado'])
    .optional(),
});

export const SonhoSchema = z.object({
  sonho: text(500),
  detalhes: z.string().max(1000).trim().optional(),
});

export const PalpiteSchema = z.object({
  contexto: z.string().max(500).trim().optional(),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data must be in YYYY-MM-DD format')
    .optional(),
});

export const NumerologiaSchema = z.object({
  numeros: z.array(z.number()).max(50).optional(),
  nome: z.string().max(200).trim().optional(),
});
