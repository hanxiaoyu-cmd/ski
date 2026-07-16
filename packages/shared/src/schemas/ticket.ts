import { z } from "zod";
import { TICKET_TYPES, DAY_TYPES, CHANNELS } from "../enums";

export const ticketProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  ticketType: z.enum(TICKET_TYPES),
  dayType: z.enum(DAY_TYPES),
  channel: z.enum(CHANNELS),
  priceCents: z.number(),
  originalPriceCents: z.number().nullable(),
  validFrom: z.string().nullable(),
  validTo: z.string().nullable(),
  purchaseUrl: z.string().nullable(),
});
export type TicketProduct = z.infer<typeof ticketProductSchema>;
