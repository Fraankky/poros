#!/usr/bin/env node
/**
 * Prisma Seed Script for WordPress Migration
 */

require('dotenv').config();
const { neonConfig } = require("@neondatabase/serverless");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { PrismaClient } = require("@prisma/client");
const ws = require("ws");
const fs = require('fs').promises;
const path = require('path');

// Configure Neon for Node.js
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
console.log('🔗 Connecting to database...');
console.log('   Connection string exists:', !!connectionString);
if (!connectionString) {
  console.error('❌ DATABASE_URL is not set!');
  process.exit(1);
}
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const CONFIG = {
  inputFile: path.join(__dirname, '..', 'cleaned-data.json'),
  batchSize: 50
};

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Read cleaned data
    console.log('📖 Reading cleaned data...');
    const rawData = await fs.readFile(CONFIG.inputFile, 'utf-8');
    const data = JSON.parse(rawData);

    console.log(`   Articles: ${data.articles.length}`);
    console.log(`   Categories: ${data.categories.length}`);

    // Create default category first
    console.log('\n📁 Creating default category...');
    const defaultCategory = await prisma.category.upsert({
      where: { slug: 'uncategorized' },
      update: {},
      create: {
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Default category'
      }
    });
    console.log(`   ✓ Default category: ${defaultCategory.id}`);

    // Seed Articles
    console.log('\n📰 Seeding articles...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < data.articles.length; i++) {
      const article = data.articles[i];
      
      try {
        // Check if article already exists
        const existing = await prisma.article.findUnique({
          where: { slug: article.slug }
        });

        if (existing) {
          console.log(`   ⚠️  Skipping (exists): ${article.title}`);
          continue;
        }

        await prisma.article.create({
          data: {
            title: article.title,
            slug: article.slug,
            content: article.content,
            excerpt: article.excerpt || article.content.substring(0, 200) + '...',
            coverImageUrl: article.coverImage,
            author: article.author || 'Admin',
            authorEmail: article.authorEmail,
            status: 'PUBLISHED',
            viewCount: 0,
            publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
            categoryId: defaultCategory.id
          }
        });

        successCount++;
        
        if ((i + 1) % 10 === 0) {
          console.log(`   Progress: ${i + 1}/${data.articles.length} articles...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Failed: ${article.title} - ${error.message}`);
      }
    }

    // Verification
    console.log('\n🔍 Verifying migration...');
    const articleCount = await prisma.article.count();
    const categoryCount = await prisma.category.count();

    console.log(`   ✓ Total articles in DB: ${articleCount}`);
    console.log(`   ✓ Total categories in DB: ${categoryCount}`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary');
    console.log('='.repeat(50));
    console.log(`Articles created: ${successCount}`);
    console.log(`Articles failed: ${errorCount}`);
    console.log(`Total in database: ${articleCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('\n✅ Seeding completed!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seed };
