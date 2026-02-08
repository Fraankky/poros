#!/usr/bin/env node
/**
 * Simple Seed Script - Creates admin user and test articles
 */

require('dotenv').config();
const { PrismaClient } = require("../node_modules/.prisma/client/index.js");
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting simple database seed...\n');

    // 1. Create Admin User
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@poros.dev' },
      update: {},
      create: {
        email: 'admin@poros.dev',
        name: 'Admin',
        password: adminPassword,
        role: 'admin',
        isActive: true
      }
    });
    console.log(`   ✓ Admin user created: ${admin.email}`);

    // 2. Create Categories
    console.log('\n📁 Creating categories...');
    const categories = [
      { name: 'Technology', slug: 'technology' },
      { name: 'Business', slug: 'business' },
      { name: 'Lifestyle', slug: 'lifestyle' },
      { name: 'Uncategorized', slug: 'uncategorized' }
    ];

    const categoryMap = {};
    for (const cat of categories) {
      const created = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat
      });
      categoryMap[cat.slug] = created.id;
      console.log(`   ✓ ${cat.name}`);
    }

    // 3. Create Test Articles
    console.log('\n📰 Creating test articles...');
    const articles = [
      {
        title: 'Getting Started with Web Development',
        slug: 'getting-started-web-development',
        content: '<p>This is a comprehensive guide to getting started with web development...</p>',
        excerpt: 'Learn the basics of web development with this beginner-friendly guide.',
        categoryId: categoryMap['technology'],
        coverImageUrl: null,
        status: 'PUBLISHED'
      },
      {
        title: 'Understanding Modern Business Strategies',
        slug: 'modern-business-strategies',
        content: '<p>Business strategies have evolved significantly in the digital age...</p>',
        excerpt: 'Explore modern business strategies for the digital economy.',
        categoryId: categoryMap['business'],
        coverImageUrl: null,
        status: 'PUBLISHED'
      },
      {
        title: 'Healthy Living Tips for Busy Professionals',
        slug: 'healthy-living-busy-professionals',
        content: '<p>Maintaining a healthy lifestyle while managing a busy career...</p>',
        excerpt: 'Tips and tricks for staying healthy with a busy schedule.',
        categoryId: categoryMap['lifestyle'],
        coverImageUrl: null,
        status: 'DRAFT'
      }
    ];

    for (const article of articles) {
      const existing = await prisma.article.findUnique({
        where: { slug: article.slug }
      });

      if (!existing) {
        await prisma.article.create({
          data: {
            ...article,
            author: 'Admin',
            viewCount: 0,
            publishedAt: article.status === 'PUBLISHED' ? new Date() : null
          }
        });
        console.log(`   ✓ ${article.title}`);
      } else {
        console.log(`   ⚠️  Skipping (exists): ${article.title}`);
      }
    }

    // 4. Verification
    console.log('\n🔍 Verifying seed...');
    const articleCount = await prisma.article.count();
    const categoryCount = await prisma.category.count();
    const userCount = await prisma.user.count();

    console.log(`   ✓ Users: ${userCount}`);
    console.log(`   ✓ Categories: ${categoryCount}`);
    console.log(`   ✓ Articles: ${articleCount}`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Seeding completed!');
    console.log('='.repeat(50));
    console.log('\nLogin credentials:');
    console.log('  Email: admin@poros.dev');
    console.log('  Password: admin123');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seed };
