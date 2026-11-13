import { prisma } from '../prisma.js';

export class RequestService {
  static async submitBorrowRequest(borrowerId: string, itemId: string, requestNote?: string) {
    if (!itemId || typeof itemId !== 'string' || itemId.trim() === '') {
      throw {
        status: 400,
        code: 'INVALID_PAYLOAD',
        message: 'A valid equipment itemId is required.',
      };
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Check borrower active quota (Count(Pending Requests) + Count(Active Loans) < 3)
      const pendingCount = await tx.borrowRequest.count({
        where: { borrowerId, status: 'PENDING' },
      });
      const loanCount = await tx.loan.count({
        where: { borrowerId, status: 'ACTIVE' },
      });
      const activeQuota = pendingCount + loanCount;

      if (activeQuota >= 3) {
        throw {
          status: 400,
          code: 'EXCEEDS_ACTIVE_QUOTA',
          message: 'Cannot submit request: active loans and requests combined cannot exceed 3.',
        };
      }

      // 2. Fetch the target equipment item
      const item = await tx.equipmentItem.findUnique({
        where: { id: itemId.trim() },
      });

      if (!item) {
        throw {
          status: 404,
          code: 'ITEM_NOT_FOUND',
          message: `Equipment asset with ID ${itemId} was not found.`,
        };
      }

      // 3. Check item availability
      if (item.status !== 'AVAILABLE') {
        const existingPending = await tx.borrowRequest.findFirst({
          where: { itemId: item.id, status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
        });

        if (existingPending) {
          throw {
            status: 409,
            code: 'CONCURRENT_REQUEST_CONFLICT',
            message: `Equipment item ${item.assetTag} was just reserved by another competing request.`,
          };
        }

        throw {
          status: 400,
          code: 'ITEM_NOT_AVAILABLE',
          message: `Equipment item ${item.assetTag} is already reserved or checked out.`,
        };
      }

      // 4. Transition item to RESERVED atomically
      await tx.equipmentItem.update({
        where: { id: item.id },
        data: { status: 'RESERVED' },
      });

      // 5. Create PENDING BorrowRequest
      const sanitizedNote = requestNote && typeof requestNote === 'string'
        ? requestNote.trim().slice(0, 250)
        : null;

      const newRequest = await tx.borrowRequest.create({
        data: {
          borrowerId,
          itemId: item.id,
          status: 'PENDING',
          requestNote: sanitizedNote,
        },
        include: {
          item: {
            select: {
              id: true,
              assetTag: true,
              name: true,
              category: true,
              status: true,
            },
          },
        },
      });

      return newRequest;
    });
  }

  static async getBorrowerRequestsAndLoans(borrowerId: string) {
    const [requests, activeLoans, pendingCount, loanCount] = await Promise.all([
      prisma.borrowRequest.findMany({
        where: { borrowerId },
        orderBy: { createdAt: 'desc' },
        include: {
          item: {
            select: {
              id: true,
              assetTag: true,
              name: true,
              category: true,
              modelNumber: true,
              status: true,
            },
          },
        },
      }),
      prisma.loan.findMany({
        where: { borrowerId, status: 'ACTIVE' },
        orderBy: { checkedOutAt: 'desc' },
        include: {
          item: {
            select: {
              id: true,
              assetTag: true,
              name: true,
              category: true,
              modelNumber: true,
              status: true,
            },
          },
        },
      }),
      prisma.borrowRequest.count({
        where: { borrowerId, status: 'PENDING' },
      }),
      prisma.loan.count({
        where: { borrowerId, status: 'ACTIVE' },
      }),
    ]);

    const activeQuota = pendingCount + loanCount;

    return {
      requests,
      loans: activeLoans,
      activeLoans,
      quota: {
        activeQuota,
        maxQuota: 3,
        pendingRequestsCount: pendingCount,
        activeLoansCount: loanCount,
      },
      activeQuota: {
        current: activeQuota,
        maximum: 3,
      },
    };
  }
}

