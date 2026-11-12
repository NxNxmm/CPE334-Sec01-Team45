import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient, ItemCondition, ItemStatus, LoanStatus, RequestStatus, Role } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const localPassword = 'Password123!';

async function main() {
  const passwordHash = await bcrypt.hash(localPassword, 12);

  const borrower1 = await prisma.user.upsert({
    where: { email: 'borrower@cpe.kmutt.ac.th' },
    update: { passwordHash, fullName: 'Student Borrower One', studentOrStaffId: '67070501001', role: Role.BORROWER, isActive: true },
    create: { id: 'seed_user_borrower_1', email: 'borrower@cpe.kmutt.ac.th', passwordHash, fullName: 'Student Borrower One', studentOrStaffId: '67070501001', role: Role.BORROWER },
  });
  const borrower2 = await prisma.user.upsert({
    where: { email: 'borrower2@cpe.kmutt.ac.th' },
    update: { passwordHash, fullName: 'Student Borrower Two', studentOrStaffId: '67070501002', role: Role.BORROWER, isActive: true },
    create: { id: 'seed_user_borrower_2', email: 'borrower2@cpe.kmutt.ac.th', passwordHash, fullName: 'Student Borrower Two', studentOrStaffId: '67070501002', role: Role.BORROWER },
  });
  const custodian = await prisma.user.upsert({
    where: { email: 'custodian@cpe.kmutt.ac.th' },
    update: { passwordHash, fullName: 'CPE Lab Custodian', studentOrStaffId: 'STAFF-001', role: Role.CUSTODIAN, isActive: true },
    create: { id: 'seed_user_custodian', email: 'custodian@cpe.kmutt.ac.th', passwordHash, fullName: 'CPE Lab Custodian', studentOrStaffId: 'STAFF-001', role: Role.CUSTODIAN },
  });

  const equipment = [
    { assetTag: 'CPE-OSC-001', name: 'Rigol DS1054Z Digital Oscilloscope', category: 'Measurement', modelNumber: 'DS1054Z', serialNumber: 'RIGOL-DS1054Z-001', description: 'Four-channel digital oscilloscope.', condition: ItemCondition.GOOD, status: ItemStatus.AVAILABLE },
    { assetTag: 'CPE-OSC-002', name: 'Keysight InfiniiVision DSOX1204A', category: 'Measurement', modelNumber: 'DSOX1204A', serialNumber: 'KEYSIGHT-DSOX1204A-002', description: 'Four-channel mixed signal oscilloscope.', condition: ItemCondition.GOOD, status: ItemStatus.AVAILABLE },
    { assetTag: 'CPE-RPI-001', name: 'Raspberry Pi 4 Model B 4GB', category: 'Microcontrollers', modelNumber: 'RPI4-4GB', serialNumber: 'RPI4-4GB-001', description: 'Single-board computer with 4GB RAM.', condition: ItemCondition.GOOD, status: ItemStatus.AVAILABLE },
    { assetTag: 'CPE-RPI-002', name: 'Raspberry Pi 4 Model B 8GB', category: 'Microcontrollers', modelNumber: 'RPI4-8GB', serialNumber: 'RPI4-8GB-002', description: 'Single-board computer with 8GB RAM.', condition: ItemCondition.GOOD, status: ItemStatus.CHECKED_OUT },
    { assetTag: 'CPE-FPG-001', name: 'Terasic DE10-Lite FPGA Board', category: 'FPGA', modelNumber: 'DE10-Lite', serialNumber: 'TERASIC-DE10LITE-001', description: 'MAX 10 FPGA development and education board.', condition: ItemCondition.GOOD, status: ItemStatus.AVAILABLE },
    { assetTag: 'CPE-LOG-001', name: 'Saleae Logic 8 USB Analyzer', category: 'Measurement', modelNumber: 'Logic 8', serialNumber: 'SALEAE-LOGIC8-001', description: 'Eight-channel USB logic analyzer.', condition: ItemCondition.GOOD, status: ItemStatus.MAINTENANCE },
  ] as const;

  const items = new Map<string, { id: string }>();
  for (const item of equipment) {
    const saved = await prisma.equipmentItem.upsert({
      where: { assetTag: item.assetTag },
      update: { ...item },
      create: { ...item, id: `seed_item_${item.assetTag.toLowerCase().replaceAll('-', '_')}` },
    });
    items.set(item.assetTag, saved);
  }

  const checkedOutItem = items.get('CPE-RPI-002');
  if (!checkedOutItem) throw new Error('Seed item CPE-RPI-002 was not created.');
  const request = await prisma.borrowRequest.upsert({
    where: { id: 'seed_request_checked_out' },
    update: { borrowerId: borrower2.id, itemId: checkedOutItem.id, status: RequestStatus.APPROVED, requestNote: 'Deterministic sample checkout.' },
    create: { id: 'seed_request_checked_out', borrowerId: borrower2.id, itemId: checkedOutItem.id, status: RequestStatus.APPROVED, requestNote: 'Deterministic sample checkout.' },
  });

  const checkedOutAt = new Date('2026-11-12T00:00:00.000Z');
  await prisma.loan.upsert({
    where: { requestId: request.id },
    update: { itemId: checkedOutItem.id, borrowerId: borrower2.id, custodianId: custodian.id, status: LoanStatus.ACTIVE, checkedOutAt, dueDate: new Date('2026-11-19T00:00:00.000Z') },
    create: { id: 'seed_loan_checked_out', requestId: request.id, itemId: checkedOutItem.id, borrowerId: borrower2.id, custodianId: custodian.id, status: LoanStatus.ACTIVE, checkedOutAt, dueDate: new Date('2026-11-19T00:00:00.000Z') },
  });

  console.log(`Seeded ${await prisma.user.count()} users and ${await prisma.equipmentItem.count()} equipment items.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
