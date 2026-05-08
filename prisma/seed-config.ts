import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.siteConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' },
  });

  const providers = [
    { provider: 'CINETPAY', merchantName: 'CinetPay', description: 'Mobile Money et cartes bancaires (Wave, Orange Money, MTN, Visa, Mastercard)', isActive: true },
    { provider: 'STRIPE', merchantName: 'Stripe', description: 'Cartes bancaires internationales (Visa, Mastercard, American Express)', isActive: false },
  ];

  for (const p of providers) {
    await prisma.paymentProviderConfig.upsert({
      where: { provider: p.provider },
      update: {},
      create: p,
    });
  }

  console.log('Seeded configs');
  await prisma.$disconnect();
}

main().catch(console.error);
