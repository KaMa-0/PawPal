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
  return prisma.review.create({
    data: {
      bookingId,
      rating,
      text,
    },
  });
};