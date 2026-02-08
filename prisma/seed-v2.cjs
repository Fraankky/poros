#!/usr/bin/env node
/**
 * Seed Database v2 - Import cleaned data with categories
 */

require('dotenv').config();
const { PrismaClient } = require("../node_modules/.prisma/client/index.js");
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

const CONFIG = {
  inputFile: path.join(__dirname, '..', 'cleaned-data-v2.json')
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

    // 1. Seed Categories
    console.log('\n📁 Seeding categories...');
    const categoryMap = {}; // Map slug to UUID
    
    for (const cat of data.categories) {
      try {
        const created = await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: {
            name: cat.name,
            slug: cat.slug,
            description: null
          }
        });
        
        categoryMap[cat.slug] = created.id;
        console.log(`   ✓ ${cat.name} (${cat.slug})`);
      } catch (error) {
        console.error(`   ❌ Failed to create category ${cat.name}:`, error.message);
      }
    }
    
    console.log(`   ✓ ${Object.keys(categoryMap).length} categories ready`);

    // 2. Seed Articles
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
          console.log(`   ⚠️  Skipping (exists): ${article.title.substring(0, 50)}...`);
          continue;
        }

        // Get category ID
        const categoryId = categoryMap[article.categorySlug];
        if (!categoryId) {
          console.error(`   ❌ Category not found: ${article.categorySlug}`);
          errorCount++;
          continue;
        }

        await prisma.article.create({
          data: {
            title: article.title,
            slug: article.slug,
            content: article.content,
            excerpt: article.excerpt,
            coverImageUrl: article.coverImage,
            author: article.author,
            authorEmail: article.authorEmail,
            status: 'PUBLISHED',
            viewCount: 0,
            publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
            categoryId: categoryId
          }
        });

        successCount++;
        
        if ((i + 1) % 20 === 0) {
          console.log(`   Progress: ${i + 1}/${data.articles.length} articles...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Failed: ${article.title.substring(0, 50)}... - ${error.message}`);
      }
    }

    // 3. Verification
    console.log('\n🔍 Verifying migration...');
    const articleCount = await prisma.article.count();
    const categoryCount = await prisma.category.count();
    
    // Get category distribution
    const categoryStats = await prisma.$queryRaw`
      SELECT c.name, c.slug, COUNT(a.id) as count
      FROM categories c
      LEFT JOIN articles a ON a."categoryId" = c.id
      GROUP BY c.id, c.name, c.slug
      ORDER BY count DESC
    `;

    console.log(`   ✓ Total articles in DB: ${articleCount}`);
    console.log(`   ✓ Total categories in DB: ${categoryCount}`);
    
    console.log('\n   Category Distribution:');
    categoryStats.forEach(stat => {
      console.log(`     - ${stat.name}: ${stat.count} articles`);
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`Categories created: ${Object.keys(categoryMap).length}`);
    console.log(`Articles created: ${successCount}`);
    console.log(`Articles failed: ${errorCount}`);
    console.log(`Total in database: ${articleCount}`);
    console.log('='.repeat(60));

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
