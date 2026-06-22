import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MODE CRM database...');

  const password = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Adewale Okonkwo', email: 'adewale@modedigital.ng', password, role: 'admin', phone: '+234 801 234 5678' } }),
    prisma.user.create({ data: { name: 'Chioma Eze', email: 'chioma@modedigital.ng', password, role: 'sales', phone: '+234 802 345 6789' } }),
    prisma.user.create({ data: { name: 'Emeka Nwosu', email: 'emeka@modedigital.ng', password, role: 'developer', phone: '+234 803 456 7890' } }),
    prisma.user.create({ data: { name: 'Fatima Bello', email: 'fatima@modedigital.ng', password, role: 'manager', phone: '+234 804 567 8901' } }),
    prisma.user.create({ data: { name: 'Ibrahim Musa', email: 'ibrahim@modedigital.ng', password, role: 'support', phone: '+234 805 678 9012' } }),
  ]);

  await prisma.lead.createMany({
    data: [
      { name: 'Chukwudi Abiola', company: 'TechVenture Nigeria', email: 'chukwudi@techventure.ng', phone: '+234 810 111 2222', serviceInterested: 'website-development', source: 'website', budget: 1500000, currency: 'NGN', notes: 'Interested in a corporate website with CMS', status: 'new-lead', estimatedValue: 1500000, probability: 20, expectedCloseDate: new Date('2026-08-15'), assignedTo: users[1].id },
      { name: 'Amina Yusuf', company: 'Sahara Logistics', email: 'amina@saharalog.com', phone: '+234 811 222 3333', serviceInterested: 'ecommerce-development', source: 'facebook-ads', budget: 3000000, currency: 'NGN', notes: 'Needs e-commerce platform for logistics supplies', status: 'qualified', estimatedValue: 3000000, probability: 40, expectedCloseDate: new Date('2026-07-30'), assignedTo: users[1].id },
      { name: 'Olufemi Peters', company: 'EduFirst Academy', email: 'olufemi@edufirst.ng', phone: '+234 812 333 4444', serviceInterested: 'lms-development', source: 'google-ads', budget: 5000000, currency: 'NGN', notes: 'LMS for 500+ students', status: 'discovery-call', estimatedValue: 5000000, probability: 60, expectedCloseDate: new Date('2026-07-15'), assignedTo: users[3].id },
      { name: 'Grace Obi', company: 'HealthPlus Clinics', email: 'grace@healthplus.ng', phone: '+234 813 444 5555', serviceInterested: 'custom-software', source: 'referral', budget: 8000000, currency: 'NGN', notes: 'Hospital management system', status: 'proposal-sent', estimatedValue: 8000000, probability: 70, expectedCloseDate: new Date('2026-07-01'), assignedTo: users[3].id },
      { name: 'Ngozi Kalu', company: 'FashionHub Lagos', email: 'ngozi@fashionhub.ng', phone: '+234 814 555 6666', serviceInterested: 'ecommerce-development', source: 'whatsapp', budget: 2000000, currency: 'NGN', notes: 'Online fashion store', status: 'won', estimatedValue: 2000000, probability: 100, expectedCloseDate: new Date('2026-06-01'), assignedTo: users[1].id },
    ],
  });

  const services = [
    { name: 'Website Development', type: 'website-development', description: 'Custom responsive websites', basePrice: 500000, features: JSON.stringify(['Responsive Design', 'SEO Optimized', 'CMS Integration', 'Contact Forms', 'Analytics Setup']) },
    { name: 'E-commerce Development', type: 'ecommerce-development', description: 'Full-featured online stores', basePrice: 1500000, features: JSON.stringify(['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Inventory Management', 'Order Tracking']) },
    { name: 'LMS Development', type: 'lms-development', description: 'Learning management systems', basePrice: 3000000, features: JSON.stringify(['Course Management', 'Student Enrollment', 'Quiz/Assessment', 'Progress Tracking', 'Certificate Generation']) },
    { name: 'Custom Software', type: 'custom-software', description: 'Bespoke software solutions', basePrice: 5000000, features: JSON.stringify(['Requirements Analysis', 'Custom Architecture', 'API Development', 'Database Design', 'Testing & QA']) },
    { name: 'SEO Services', type: 'seo-services', description: 'Search engine optimization', basePrice: 150000, features: JSON.stringify(['Keyword Research', 'On-Page SEO', 'Technical SEO', 'Link Building', 'Monthly Reports']) },
    { name: 'Web Hosting', type: 'web-hosting', description: 'Reliable hosting with 99.9% uptime', basePrice: 30000, features: JSON.stringify(['99.9% Uptime', 'Free SSL', 'Daily Backups', '24/7 Support']) },
    { name: 'Domain Registration', type: 'domain-registration', description: 'Register and manage domains', basePrice: 5000, features: JSON.stringify(['Domain Search', 'DNS Management', 'Privacy Protection', 'Auto-Renewal']) },
    { name: 'Graphic Design', type: 'graphic-design', description: 'Professional graphic design', basePrice: 100000, features: JSON.stringify(['Logo Design', 'Brand Identity', 'Marketing Materials', 'Social Media Graphics']) },
    { name: 'Social Media Management', type: 'social-media-management', description: 'Complete social media management', basePrice: 200000, features: JSON.stringify(['Content Strategy', 'Post Scheduling', 'Community Management', 'Analytics']) },
    { name: 'CBT Platform', type: 'cbt-platform', description: 'Computer-based testing platforms', basePrice: 2000000, features: JSON.stringify(['Question Bank', 'Timed Exams', 'Auto-Grading', 'Result Analysis', 'Anti-Cheating']) },
  ];
  await prisma.service.createMany({ data: services });

  await prisma.hostingAccount.createMany({
    data: [
      { clientName: 'FashionHub Lagos', domainName: 'fashionhub.ng', registrationDate: new Date('2025-06-01'), expiryDate: new Date('2026-06-01'), hostingPlan: 'business', sslStatus: 'active', autoRenew: true, status: 'active', monthlyFee: 15000 },
      { clientName: 'TechVenture Nigeria', domainName: 'techventure.ng', registrationDate: new Date('2025-03-15'), expiryDate: new Date('2026-09-15'), hostingPlan: 'enterprise', sslStatus: 'active', autoRenew: true, status: 'active', monthlyFee: 25000 },
      { clientName: 'EduFirst Academy', domainName: 'edufirst.ng', registrationDate: new Date('2025-01-10'), expiryDate: new Date('2026-07-10'), hostingPlan: 'business', sslStatus: 'active', autoRenew: false, status: 'active', monthlyFee: 15000 },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
