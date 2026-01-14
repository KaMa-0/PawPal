import { Request, Response } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.middleware';
import {
  submitCertificationRequest,
  getPendingCertifications,
  approveCertification,
  rejectCertification,
  getCertificationStatus
} from '../services/certification.service';

export const submitCertification = async (req: Request, res: Response) => {
  try {
    const sitterId = (req as any).user.userId;
    const result = await submitCertificationRequest(sitterId);
    res.status(201).json({ message: 'Certification request submitted', requestId: result.requestId });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getPending = async (req: Request, res: Response) => {
  try {
    const requests = await getPendingCertifications();
    res.status(200).json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approve = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.body;
    const adminId = (req as any).user.userId;
    const result = await approveCertification(requestId, adminId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const reject = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.body;
    const adminId = (req as any).user.userId;
    const result = await rejectCertification(requestId, adminId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const { sitterId } = req.params;
    const status = await getCertificationStatus(parseInt(sitterId));
    res.status(200).json(status);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

