import { ItemStatus, LoanStatus, RequestStatus } from '@prisma/client';
import { prisma } from '../prisma.js';

const conflict = () => ({
  status: 409,
  code: 'CONCURRENT_CHECKOUT_CONFLICT',
  message: 'Checkout failed: the request is not pending or item is not reserved.',
});

export class CustodianService {
  static async getDeskData() {
    const [requests, activeLoans] = await Promise.all([
      prisma.borrowRequest.findMany({
        where: { status: RequestStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        include: {
          borrower: { select: { id: true, fullName: true, studentOrStaffId: true, email: true } },
          item: { select: { id: true, assetTag: true, name: true, category: true, status: true } },
        },
      }),
      prisma.loan.findMany({
        where: { status: LoanStatus.ACTIVE },
        orderBy: { checkedOutAt: 'asc' },
        include: {
          borrower: { select: { id: true, fullName: true, studentOrStaffId: true } },
          custodian: { select: { id: true, fullName: true, studentOrStaffId: true } },
          item: { select: { id: true, assetTag: true, name: true } },
        },
      }),
    ]);

    return { requests, activeLoans };
  }

  static async checkout(requestId: unknown, custodianId: string, checkoutNotes?: unknown) {
    if (typeof requestId !== 'string' || !requestId.trim()) {
      throw { status: 400, code: 'INVALID_REQUEST_ID', message: 'A valid requestId is required.' };
    }
    if (checkoutNotes !== undefined && checkoutNotes !== null && typeof checkoutNotes !== 'string') {
      throw { status: 400, code: 'INVALID_CHECKOUT_NOTES', message: 'checkoutNotes must be a string.' };
    }

    try {
      return await prisma.$transaction(async (tx) => {
        const pendingRequest = await tx.borrowRequest.findUnique({
          where: { id: requestId.trim() },
          include: { item: true },
        });
        if (!pendingRequest) {
          throw { status: 404, code: 'REQUEST_NOT_FOUND', message: `Borrow request ${requestId} was not found.` };
        }
        if (pendingRequest.status !== RequestStatus.PENDING || pendingRequest.item.status !== ItemStatus.RESERVED) {
          throw conflict();
        }

        // Conditional updates ensure only one transaction can claim the reserved item/request.
        const itemUpdate = await tx.equipmentItem.updateMany({
          where: { id: pendingRequest.itemId, status: ItemStatus.RESERVED },
          data: { status: ItemStatus.CHECKED_OUT },
        });
        const requestUpdate = await tx.borrowRequest.updateMany({
          where: { id: pendingRequest.id, status: RequestStatus.PENDING },
          data: { status: RequestStatus.APPROVED },
        });
        if (itemUpdate.count !== 1 || requestUpdate.count !== 1) throw conflict();

        const checkedOutAt = new Date();
        const dueDate = new Date(checkedOutAt.getTime() + 7 * 24 * 60 * 60 * 1000);
        const notes = typeof checkoutNotes === 'string' ? checkoutNotes.trim().slice(0, 500) || null : null;
        return tx.loan.create({
          data: {
            requestId: pendingRequest.id,
            itemId: pendingRequest.itemId,
            borrowerId: pendingRequest.borrowerId,
            custodianId,
            status: LoanStatus.ACTIVE,
            checkedOutAt,
            dueDate,
            checkoutNotes: notes,
          },
          include: {
            item: { select: { assetTag: true, name: true, status: true } },
          },
        });
      }, { maxWait: 5000, timeout: 10000 });
    } catch (error: any) {
      if (error?.code === 'P2002' || error?.code === 'P2034' || error?.code === 'P1008' || error?.code === 'SQLITE_BUSY') {
        throw conflict();
      }
      throw error;
    }
  }
}
