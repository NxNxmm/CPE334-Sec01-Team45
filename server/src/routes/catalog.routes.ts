import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { prisma } from '../prisma.js';

export const catalogRouter = Router();
const catalogRoles = [Role.BORROWER, Role.CUSTODIAN];

catalogRouter.get('/', requireAuth, requireRole(catalogRoles), async (_req, res) => {
  try {
    const items = await prisma.equipmentItem.findMany({
      orderBy: [{ category: 'asc' }, { assetTag: 'asc' }],
      select: {
        id: true,
        assetTag: true,
        name: true,
        category: true,
        modelNumber: true,
        condition: true,
        status: true,
      },
    });

    res.status(200).json({
      success: true,
      data: items,
      meta: { total: items.length, timestamp: new Date().toISOString() },
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Unable to load the equipment catalog.', details: null },
      meta: { timestamp: new Date().toISOString() },
    });
  }
});

catalogRouter.get('/:id', requireAuth, requireRole(catalogRoles), async (req, res) => {
  const itemId = String(req.params.id);
  try {
    const item = await prisma.equipmentItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        assetTag: true,
        name: true,
        category: true,
        modelNumber: true,
        serialNumber: true,
        description: true,
        condition: true,
        status: true,
        createdAt: true,
      },
    });

    if (!item) {
      res.status(404).json({
        success: false,
        error: { code: 'ITEM_NOT_FOUND', message: `Equipment asset with ID ${itemId} was not found.`, details: null },
        meta: { timestamp: new Date().toISOString() },
      });
      return;
    }

    res.status(200).json({ success: true, data: item, meta: { timestamp: new Date().toISOString() } });
  } catch (_error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Unable to load equipment details.', details: null },
      meta: { timestamp: new Date().toISOString() },
    });
  }
});
