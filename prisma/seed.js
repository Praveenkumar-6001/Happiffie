const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.user.upsert({
    where: { email: 'ananya.customer@happiffie.test' },
    update: {},
    create: {
      id: 'seed_customer_ananya',
      name: 'Ananya Raman',
      email: 'ananya.customer@happiffie.test',
      phone: '+919876543210',
      passwordHash: '$2b$10$demoCustomerHash',
      role: 'customer',
    },
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: 'temple.bloom@happiffie.test' },
    update: {},
    create: {
      id: 'seed_vendor_temple_bloom_user',
      name: 'Temple Bloom Manager',
      email: 'temple.bloom@happiffie.test',
      phone: '+919876543211',
      passwordHash: '$2b$10$demoVendorHash',
      role: 'vendor',
    },
  });

  const photoVendorUser = await prisma.user.upsert({
    where: { email: 'golden.hour@happiffie.test' },
    update: {},
    create: {
      id: 'seed_vendor_golden_hour_user',
      name: 'Golden Hour Manager',
      email: 'golden.hour@happiffie.test',
      phone: '+919876543212',
      passwordHash: '$2b$10$demoVendorHash',
      role: 'vendor',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@happiffie.test' },
    update: {},
    create: {
      id: 'seed_admin_user',
      name: 'Happiffie Admin',
      email: 'admin@happiffie.test',
      phone: '+919876543213',
      passwordHash: '$2b$10$demoAdminHash',
      role: 'admin',
    },
  });

  const decorator = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {
      businessName: 'Temple Bloom Decor',
      experience: 11,
      rating: 4.8,
      responseRate: 96,
      verified: true,
      status: 'active',
    },
    create: {
      id: 'seed_vendor_temple_bloom',
      userId: vendorUser.id,
      businessName: 'Temple Bloom Decor',
      experience: 11,
      rating: 4.8,
      responseRate: 96,
      verified: true,
      status: 'active',
    },
  });

  const photographer = await prisma.vendor.upsert({
    where: { userId: photoVendorUser.id },
    update: {
      businessName: 'Golden Hour Weddings',
      experience: 8,
      rating: 4.6,
      responseRate: 88,
      verified: true,
      status: 'active',
    },
    create: {
      id: 'seed_vendor_golden_hour',
      userId: photoVendorUser.id,
      businessName: 'Golden Hour Weddings',
      experience: 8,
      rating: 4.6,
      responseRate: 88,
      verified: true,
      status: 'active',
    },
  });

  await prisma.vendorProfile.upsert({
    where: { vendorId: decorator.id },
    update: {
      description: 'Traditional South Indian wedding decorators with floral mandap and temple theme expertise.',
      services: ['decorator', 'flower_designer', 'event_planner'],
      specializations: ['traditional south indian', 'temple theme', 'wedding'],
      cities: ['chennai', 'kanchipuram', 'pondicherry'],
      travelRadius: 80,
      priceMin: '150000',
      priceMax: '600000',
    },
    create: {
      vendorId: decorator.id,
      description: 'Traditional South Indian wedding decorators with floral mandap and temple theme expertise.',
      services: ['decorator', 'flower_designer', 'event_planner'],
      specializations: ['traditional south indian', 'temple theme', 'wedding'],
      cities: ['chennai', 'kanchipuram', 'pondicherry'],
      travelRadius: 80,
      priceMin: '150000',
      priceMax: '600000',
    },
  });

  await prisma.vendorProfile.upsert({
    where: { vendorId: photographer.id },
    update: {
      description: 'Wedding photography and candid video team for large celebrations.',
      services: ['photographer'],
      specializations: ['wedding', 'candid', 'reception'],
      cities: ['chennai', 'coimbatore'],
      travelRadius: 120,
      priceMin: '90000',
      priceMax: '350000',
    },
    create: {
      vendorId: photographer.id,
      description: 'Wedding photography and candid video team for large celebrations.',
      services: ['photographer'],
      specializations: ['wedding', 'candid', 'reception'],
      cities: ['chennai', 'coimbatore'],
      travelRadius: 120,
      priceMin: '90000',
      priceMax: '350000',
    },
  });

  await upsertAvailability(decorator.id, '2026-08-15', true);
  await upsertAvailability(decorator.id, '2026-09-01', true);
  await upsertAvailability(photographer.id, '2026-08-15', true);

  await createPortfolioOnce(decorator.id, 'https://cdn.example.com/temple-bloom/mandap.jpg', 'wedding_decor');
  await createPortfolioOnce(photographer.id, 'https://cdn.example.com/golden-hour/wedding.jpg', 'wedding_photography');

  const requirement = await prisma.requirement.upsert({
    where: { id: 'seed_requirement_wedding_chennai' },
    update: {
      eventType: 'wedding',
      city: 'chennai',
      budget: '500000',
      guestCount: 500,
      theme: 'Traditional South Indian',
      eventDate: new Date('2026-08-15T00:00:00.000Z'),
      specialNotes: 'Temple style mandap with jasmine and marigold flowers.',
      status: 'matching',
    },
    create: {
      id: 'seed_requirement_wedding_chennai',
      userId: customer.id,
      eventType: 'wedding',
      city: 'chennai',
      budget: '500000',
      guestCount: 500,
      theme: 'Traditional South Indian',
      eventDate: new Date('2026-08-15T00:00:00.000Z'),
      specialNotes: 'Temple style mandap with jasmine and marigold flowers.',
      status: 'matching',
    },
  });

  await upsertMatch(requirement.id, decorator.id, 99.4, 1, 'AI ranked vendor for theme, budget, city, availability, rating, and response rate.');
  await upsertMatch(requirement.id, photographer.id, 94.6, 2, 'AI ranked vendor for wedding experience, budget fit, city, availability, and rating.');

  const invitation = await prisma.invitation.upsert({
    where: { id: 'seed_invitation_temple_bloom' },
    update: {
      status: 'accepted',
      respondedAt: new Date(),
    },
    create: {
      id: 'seed_invitation_temple_bloom',
      vendorId: decorator.id,
      requirementId: requirement.id,
      status: 'accepted',
      sentAt: new Date(),
      respondedAt: new Date(),
    },
  });

  await prisma.response.upsert({
    where: { id: 'seed_response_temple_bloom' },
    update: {
      quotation: '275000',
      message: 'Available for the requested date with floral mandap package.',
      status: 'accepted',
    },
    create: {
      id: 'seed_response_temple_bloom',
      vendorId: decorator.id,
      requirementId: requirement.id,
      invitationId: invitation.id,
      quotation: '275000',
      message: 'Available for the requested date with floral mandap package.',
      status: 'accepted',
    },
  });

  const booking = await prisma.booking.upsert({
    where: { id: 'seed_booking_temple_bloom' },
    update: {
      amount: '275000',
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
    },
    create: {
      id: 'seed_booking_temple_bloom',
      vendorId: decorator.id,
      userId: customer.id,
      requirementId: requirement.id,
      amount: '275000',
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
    },
  });

  await prisma.review.upsert({
    where: { bookingId: booking.id },
    update: {
      rating: 5,
      review: 'Excellent planning discussion and quick quotation.',
    },
    create: {
      bookingId: booking.id,
      userId: customer.id,
      vendorId: decorator.id,
      rating: 5,
      review: 'Excellent planning discussion and quick quotation.',
    },
  });

  console.log('Seed complete');
  console.table([
    { type: 'customer', id: customer.id, email: customer.email },
    { type: 'vendor', id: decorator.id, email: vendorUser.email },
    { type: 'vendor', id: photographer.id, email: photoVendorUser.email },
    { type: 'requirement', id: requirement.id, email: customer.email },
    { type: 'booking', id: booking.id, email: customer.email },
  ]);
}

async function upsertAvailability(vendorId, date, available) {
  await prisma.vendorAvailability.upsert({
    where: {
      vendorId_date: {
        vendorId,
        date: new Date(`${date}T00:00:00.000Z`),
      },
    },
    update: { available },
    create: {
      vendorId,
      date: new Date(`${date}T00:00:00.000Z`),
      available,
    },
  });
}

async function createPortfolioOnce(vendorId, imageUrl, category) {
  const existing = await prisma.portfolio.findFirst({ where: { vendorId, imageUrl } });
  if (existing) return existing;
  return prisma.portfolio.create({ data: { vendorId, imageUrl, category } });
}

async function upsertMatch(requirementId, vendorId, score, rank, reason) {
  await prisma.match.upsert({
    where: {
      requirementId_vendorId: {
        requirementId,
        vendorId,
      },
    },
    update: {
      score,
      rank,
      matchedByAI: true,
      reason,
    },
    create: {
      requirementId,
      vendorId,
      score,
      rank,
      matchedByAI: true,
      reason,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
