import prisma from '../config/prisma';
import { BookingStatus } from '@prisma/client';

export const createReview = async (
  userId: number,
  bookingId: number,
  rating: number,
  text?: string
) => {
  // 1. Check if booking exists and belongs to the user (Owner)
  const booking = await prisma.booking.findUnique({
    where: { bookingId },
    include: { review: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.ownerId !== userId) {
    throw new Error("Not authorized to review this booking");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("Booking must be completed to leave a review");
  }

  if (booking.review) {
    throw new Error("Review already exists for this booking");
  }

  // 2. Create the review
  const review = await prisma.review.create({
    data: {
      bookingId,
      rating,
      text,
    },
  });

  // 3. Recalculate Sitter Average Rating
  await updateSitterRating(booking.sitterId);

  return review;
};

const updateSitterRating = async (sitterId: number) => {
  const reviews = await prisma.review.findMany({
    where: {
      booking: {
        sitterId: sitterId
      }
    }
  });

  if (reviews.length === 0) return;

  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const average = total / reviews.length;

  await prisma.petSitter.update({
    where: { userId: sitterId },
    data: { averageRating: average }
  });
};
