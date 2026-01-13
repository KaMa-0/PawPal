import { RequestStatus } from '@prisma/client';

export interface CertificationRequest {
  requestId: number;
  sitterId: number;
  adminId?: number;
  status: RequestStatus;
  submissionDate: Date;
  updatedAt: Date;
}

export interface CertificationResponse {
  requestId: number;
  sitterId: number;
  status: RequestStatus;
  submissionDate: Date;
}

export interface AdminDecisionPayload {
  requestId: number;
  decision: 'APPROVED' | 'REJECTED';
  adminId: number;
}

