import { Schema, model, models, type HydratedDocument, type Model } from 'mongoose';

// Strongly typed Event document interface
export interface IEvent {
  title: string;
  slug: string; // auto-generated from title, unique
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // normalized ISO date (YYYY-MM-DD)
  time: string; // normalized 24h time (HH:mm)
  mode: 'online' | 'offline' | 'hybrid' | (string & {});
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helpers kept local to avoid external deps
const toSlug = (raw: string): string =>
  raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const normalizeDateToISO = (input: string): string => {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date format');
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const normalizeTimeToHHmm = (input: string): string => {
  const m = input.trim().match(/^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM|am|pm)?$/);
  if (!m) throw new Error('Invalid time format');
  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && hour < 12) hour += 12;
  if (ap === 'AM' && hour === 12) hour = 0;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) throw new Error('Invalid time range');
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hour)}:${pad(minute)}`;
};

const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    // slug is unique and generated; not marked required to allow pre-save generation before validation
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: unknown) => Array.isArray(arr) && arr.length > 0 && arr.every((s) => typeof s === 'string' && s.trim().length > 0),
        message: 'Agenda must be a non-empty array of non-empty strings',
      },
      set: (arr: string[]) => arr.map((s) => s.trim()),
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: unknown) => Array.isArray(arr) && arr.length > 0 && arr.every((s) => typeof s === 'string' && s.trim().length > 0),
        message: 'Tags must be a non-empty array of non-empty strings',
      },
      set: (arr: string[]) => arr.map((s) => s.trim().toLowerCase()),
    },
  },
  { timestamps: true, strict: true }
);

// Ensure unique slug index at DB level
EventSchema.index({ slug: 1 }, { unique: true });

// Pre-save: slug generation, date/time normalization, and non-empty validation
EventSchema.pre('save', function (this: HydratedDocument<IEvent>, next) {
  try {
    // Validate and normalize required string fields
    const requiredStrings: Array<keyof IEvent> = [
      'title',
      'description',
      'overview',
      'image',
      'venue',
      'location',
      'mode',
      'audience',
      'organizer',
    ];

    for (const k of requiredStrings) {
      const v = this[k];
      if (!nonEmpty(v)) return next(new Error(`${String(k)} is required and must be non-empty`));
      // Trim normalized values back to doc
      // @ts-expect-error - indexed assignment on typed doc
      this[k] = (v as string).trim();
    }

    // Normalize date and time
    if (nonEmpty(this.date)) this.date = normalizeDateToISO(this.date);
    if (nonEmpty(this.time)) this.time = normalizeTimeToHHmm(this.time);

    // Generate slug only when title changed or slug is empty
    if (this.isModified('title') || !nonEmpty(this.slug)) {
      this.slug = toSlug(this.title);
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Event: Model<IEvent> = (models.Event as Model<IEvent> | undefined) ?? model<IEvent>('Event', EventSchema);
