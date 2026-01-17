import prisma from '../config/prisma';
import { UserType, BookingStatus } from '@prisma/client';

export const createBooking = async (
  ownerId: number,
  sitterId: number,
  details?: string
) => {
  // Check if there's already an active booking (PENDING or ACCEPTED) between this owner and sitter
  const existingActiveBooking = await prisma.booking.findFirst({
    where: {
      ownerId,
      sitterId,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.ACCEPTED],
      },
    },
  });

  if (existingActiveBooking) {
    if (existingActiveBooking.status === BookingStatus.PENDING) {
      throw new Error('You already have a pending booking request with this sitter.');
    } else {
      throw new Error('You already have an accepted booking with this sitter. Please wait until it is completed.');
    }
  }

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
    role === "OWNER"
      ? { ownerId: userId }
      : role === "SITTER"
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

