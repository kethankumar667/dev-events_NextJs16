import { Schema, model, models, type HydratedDocument, type Model, Types } from 'mongoose';
import { Event } from './event.model';

// Strongly typed Booking document interface
export interface IBooking {
  eventId: Types.ObjectId; // reference to Event
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => emailRegex.test(v),
        message: 'Invalid email format',
      },
    },
  },
  { timestamps: true, strict: true }
);

// Index for faster lookups by event
BookingSchema.index({ eventId: 1 });

// Pre-save: ensure referenced Event exists and email is valid (redundant check for safety)
BookingSchema.pre('save', async function (this: HydratedDocument<IBooking>, next) {
  try {
    if (!this.eventId) return next(new Error('eventId is required'));

    // Validate email again defensively
    if (!this.email || !emailRegex.test(this.email)) return next(new Error('Invalid email format'));

    // Verify referenced event exists
    const exists = await Event.exists({ _id: this.eventId });
    if (!exists) return next(new Error('Referenced event does not exist'));

    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Booking: Model<IBooking> = (models.Booking as Model<IBooking> | undefined) ?? model<IBooking>('Booking', BookingSchema);
