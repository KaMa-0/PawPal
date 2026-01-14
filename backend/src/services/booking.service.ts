import prisma from '../config/prisma';
import { UserType, BookingStatus } from '@prisma/client';

export const createBooking = async (
  ownerId: number,
  sitterId: number,
  details?: string
) => {
  return prisma.booking.create({
    data: {
      ownerId,
      sitterId,
      status: BookingStatus.PENDING,
      details,
    },
  });
};

export const respondToBooking = async (
  bookingId: number,
  accept: boolean
) => {
  return prisma.booking.update({
    where: { bookingId },
    data: { status: accept ? BookingStatus.ACCEPTED : BookingStatus.DECLINED },
  });
};

export const completeBooking = async (bookingId: number) => {
  return prisma.booking.update({
    where: { bookingId },
    data: { status: BookingStatus.COMPLETED },
  });
};

export const getBookingsForUser = async (userId: number, role: string) => {
  const where =
      role === UserType.OWNER
          ? { ownerId: userId }
          : role === UserType.SITTER
              ? { sitterId: userId }
              : {};

  return prisma.booking.findMany({
    where,
    include: {
      owner: {
        select: {
          user: {
            select: {
              userId: true,
              username: true,
            },
          },
        },
      },
      sitter: {
        select: {
          user: {
            select: {
              userId: true,
              username: true,
            },
          },
        },
      },
      review: true,
    },
    orderBy: { requestDate: "desc" },
  });
};

// Create Review
export const createReview = async (bookingId: number, rating: number, text: string) => {
  // Create the review
  const review = await prisma.review.create({
    data: {
      bookingId,
      rating,
      text,
    },
  });

  // Get the sitter ID from the booking
  const booking = await prisma.booking.findUnique({
    where: { bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Calculate the average rating for the sitter using aggregate
  const ratingData = await prisma.review.aggregate({
    where: {
      booking: {
        sitterId: booking.sitterId,
      },
    },
    _avg: {
      rating: true,
    },
    _count: true,
  });

  const averageRating = ratingData._avg.rating || 0;

  // Update the sitter's average rating
  await prisma.petSitter.update({
    where: { userId: booking.sitterId },
    data: { averageRating },
  });

  return review;
};