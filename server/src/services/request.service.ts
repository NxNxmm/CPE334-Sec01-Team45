import { prisma } from '../prisma.js';

// ---------------------------------------------------------------------------
// Per-borrower in-process serialization queue.
//
// Guarantees that quota-changing submissions from the same borrower execute
// one at a time, preventing two concurrent requests from both reading a
// stale quota count and both passing the <= 3 check.
//
// Without this, two concurrent requests for *different* available items from
// a borrower with quota = 2 can both read quota as 2, both pass the guard,
// and both create PENDING requests — exceeding the limit.
//
// In a multi-process deployment, replace with a distributed lock or
// database-level advisory lock.
// ---------------------------------------------------------------------------
const _borrowerQueues = new Map<string, Promise<unknown>>();

function enqueueForBorrower<T>(borrowerId: string, work: () => Promise<T>): Promise<T> {
  const prior = _borrowerQueues.get(borrowerId) ?? Promise.resolve();
  const task = prior.catch(() => {}).then(work);
  _borrowerQueues.set(borrowerId, task.catch(() => {}));
  return task;
}

export class RequestService {
  static async submitBorrowRequest(borrowerId: string, itemId: string, requestNote?: string) {
    if (!itemId || typeof itemId !== 'string' || itemId.trim() === '') {
      throw {
        status: 400,
        code: 'INVALID_PAYLOAD',
        message: 'A valid equipment itemId is required.',
      };
    }

    // Serialize per-borrower to prevent quota race (BR-04 / API-01-27).
    // Cross-borrower item races are handled by the conditional UPDATE below.
    return enqueueForBorrower(borrowerId, () =>
      prisma.$transaction(async (tx) => {
        // 1. Check borrower active quota (BR-04)
        //    Count(Pending Requests) + Count(Active Loans) must be < 3.
        //    This read is safe because enqueueForBorrower serializes all
        //    quota-changing operations for this borrower.
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

        // 2. Conditionally reserve the item (BR-01 / BR-02).
        //    Uses UPDATE ... WHERE id = ? AND status = 'AVAILABLE' so the
        //    reservation succeeds only if the item is still AVAILABLE at
        //    write time. If a competing transaction already flipped the
        //    status, updateMany returns count = 0.
        const trimmedId = itemId.trim();
        const reserved = await tx.equipmentItem.updateMany({
          where: { id: trimmedId, status: 'AVAILABLE' },
          data: { status: 'RESERVED' },
        });

        if (reserved.count === 0) {
          // The item either doesn't exist or was not AVAILABLE.
          const item = await tx.equipmentItem.findUnique({
            where: { id: trimmedId },
          });

          if (!item) {
            throw {
              status: 404,
              code: 'ITEM_NOT_FOUND',
              message: `Equipment asset with ID ${itemId} was not found.`,
            };
          }

          // Distinguish between pre-existing unavailability and a race.
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

        // 3. Create PENDING BorrowRequest
        const sanitizedNote = requestNote && typeof requestNote === 'string'
          ? requestNote.trim().slice(0, 250)
          : null;

        const newRequest = await tx.borrowRequest.create({
          data: {
            borrowerId,
            itemId: trimmedId,
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
      }, { maxWait: 5000, timeout: 10000 })
    );
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
