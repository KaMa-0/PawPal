import prisma from '../config/prisma';
import { RequestStatus } from '@prisma/client';

export const submitCertificationRequest = async (sitterId: number) => {
  const sitter = await prisma.petSitter.findUnique({ where: { userId: sitterId } });
  if (!sitter) throw new Error('Sitter not found');

  const existing = await prisma.certificationRequest.findFirst({
    where: { sitterId, status: 'PENDING' }
  });
  if (existing) throw new Error('Pending request already exists');

  return await prisma.certificationRequest.create({
    data: { sitterId }
  });
};

export const getPendingCertifications = async () => {
  return await prisma.certificationRequest.findMany({
    where: { status: 'PENDING' },
    include: { sitter: { include: { user: true } } },
    orderBy: { submissionDate: 'asc' }
  });
};

export const approveCertification = async (requestId: number, adminId: number) => {
  const request = await prisma.certificationRequest.findUnique({ where: { requestId } });
  if (!request) throw new Error('Request not found');
  if (request.status !== 'PENDING') throw new Error('Request is not pending');

  await prisma.certificationRequest.update({
    where: { requestId },
    data: { status: 'APPROVED', adminId }
  });

  return { success: true, message: 'Certification approved' };
};

export const rejectCertification = async (requestId: number, adminId: number) => {
  const request = await prisma.certificationRequest.findUnique({ where: { requestId } });
  if (!request) throw new Error('Request not found');
  if (request.status !== 'PENDING') throw new Error('Request is not pending');

  await prisma.certificationRequest.update({
    where: { requestId },
    data: { status: 'REJECTED', adminId }
  });

  return { success: true, message: 'Certification rejected' };
};

export const getCertificationStatus = async (sitterId: number) => {
  const request = await prisma.certificationRequest.findFirst({
    where: { sitterId, status: 'APPROVED' }
  });
  return request ? { certified: true, approvedDate: request.updatedAt } : { certified: false };
};

