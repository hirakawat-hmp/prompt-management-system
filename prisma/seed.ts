/**
 * Database Seed Script
 *
 * Creates initial projects and prompts for development/testing.
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create 3 sample projects
  const project1Id = createId();
  const project2Id = createId();
  const project3Id = createId();

  const project1 = await prisma.project.create({
    data: {
      id: project1Id,
      name: 'Mountain Landscapes',
    },
  });
  console.log('✅ Created project:', project1.name);

  const project2 = await prisma.project.create({
    data: {
      id: project2Id,
      name: 'Urban Photography',
    },
  });
  console.log('✅ Created project:', project2.name);

  const project3 = await prisma.project.create({
    data: {
      id: project3Id,
      name: 'Abstract Art',
    },
  });
  console.log('✅ Created project:', project3.name);

  // Create prompts for Project 1 (Mountain Landscapes) - 20 prompts with hierarchy
  console.log('\n  Creating 20 prompts for Mountain Landscapes project...');

  // Root prompt 1
  const p1 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset',
    },
  });
  console.log('  ✅ Root 1: Mountain landscape');

  // Children of p1
  const p2 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset with golden light',
      userFeedback: 'Add more warm golden light',
      aiComment: 'Added "golden light" to enhance warmth',
      parentId: p1.id,
    },
  });

  const p3 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset with dramatic clouds',
      userFeedback: 'Make the sky more dramatic',
      aiComment: 'Added "dramatic clouds" for visual impact',
      parentId: p1.id,
    },
  });

  const p4 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'VIDEO',
      content: 'A serene mountain landscape at sunset, camera panning slowly',
      userFeedback: 'Convert to video with camera movement',
      aiComment: 'Added camera movement for cinematic effect',
      parentId: p1.id,
    },
  });

  // Grandchildren of p1 (children of p2)
  const p5 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset with golden light, 4k quality',
      userFeedback: 'Increase resolution quality',
      aiComment: 'Upgraded to 4k quality',
      parentId: p2.id,
    },
  });

  const p6 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset with golden light and snow peaks',
      userFeedback: 'Add snow-capped mountains',
      aiComment: 'Added "snow peaks" detail',
      parentId: p2.id,
    },
  });

  // More grandchildren (children of p3)
  const p7 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset with dramatic storm clouds',
      userFeedback: 'Make clouds look stormy',
      aiComment: 'Changed to "storm clouds" for intensity',
      parentId: p3.id,
    },
  });

  const p8 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset with dramatic clouds and lightning',
      userFeedback: 'Add lightning for drama',
      aiComment: 'Added "lightning" element',
      parentId: p3.id,
    },
  });

  // Root prompt 2 - Different starting point
  const p9 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'Mountain landscape at dawn with mist',
    },
  });
  console.log('  ✅ Root 2: Dawn with mist');

  // Children of p9
  const p10 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'Mountain landscape at dawn with thick mist and fog',
      userFeedback: 'Make the mist thicker',
      aiComment: 'Enhanced mist density with "thick fog"',
      parentId: p9.id,
    },
  });

  const p11 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'Mountain landscape at dawn with mist and pine trees',
      userFeedback: 'Add some trees in foreground',
      aiComment: 'Added "pine trees" to composition',
      parentId: p9.id,
    },
  });

  // Great-grandchildren (children of p5)
  const p12 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset with golden light, 8k ultra quality',
      userFeedback: 'Push quality even higher',
      aiComment: 'Upgraded to 8k ultra quality',
      parentId: p5.id,
    },
  });

  const p13 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset with golden light, 4k quality, reflection in lake',
      userFeedback: 'Add water reflection',
      aiComment: 'Added "reflection in lake" element',
      parentId: p5.id,
    },
  });

  // More branches
  const p14 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'Mountain landscape at dawn with thick mist and rays of sunlight',
      userFeedback: 'Add sun rays through mist',
      aiComment: 'Added "rays of sunlight" for atmospheric effect',
      parentId: p10.id,
    },
  });

  const p15 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'VIDEO',
      content: 'Mountain landscape at dawn with mist and pine trees, camera rising',
      userFeedback: 'Make it a video with upward movement',
      aiComment: 'Converted to video with "camera rising" motion',
      parentId: p11.id,
    },
  });

  // Additional branches from p7
  const p16 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset with dramatic storm clouds and rain',
      userFeedback: 'Add rain effect',
      aiComment: 'Added "rain" for enhanced storm atmosphere',
      parentId: p7.id,
    },
  });

  const p17 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset with dramatic storm clouds, dark moody',
      userFeedback: 'Make it darker and moodier',
      aiComment: 'Added "dark moody" tone',
      parentId: p7.id,
    },
  });

  // Deep hierarchy continuation
  const p18 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'A serene mountain landscape at sunset with golden light, 8k ultra quality, HDR',
      userFeedback: 'Enable HDR for better dynamic range',
      aiComment: 'Added HDR rendering',
      parentId: p12.id,
    },
  });

  const p19 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'VIDEO',
      content: 'A serene mountain landscape at sunset with dramatic clouds and lightning, timelapse',
      userFeedback: 'Make it a timelapse video',
      aiComment: 'Converted to timelapse format',
      parentId: p8.id,
    },
  });

  const p20 = await prisma.prompt.create({
    data: {
      projectId: project1Id,
      type: 'IMAGE',
      content: 'Mountain landscape at dawn with thick mist and rays of sunlight, ethereal glow',
      userFeedback: 'Add ethereal glow effect',
      aiComment: 'Enhanced with "ethereal glow" lighting',
      parentId: p14.id,
    },
  });

  console.log('  ✅ Created 20 prompts with hierarchical relationships');

  // Create prompts for Project 2 (Urban Photography)
  const prompt4 = await prisma.prompt.create({
    data: {
      projectId: project2Id,
      type: 'IMAGE',
      content: 'Cyberpunk city street at night with neon lights',
    },
  });
  console.log('  ✅ Created prompt:', prompt4.content.substring(0, 40) + '...');

  const prompt5 = await prisma.prompt.create({
    data: {
      projectId: project2Id,
      type: 'IMAGE',
      content: 'Cyberpunk city street at night with neon lights, rain-slicked streets, futuristic cars',
      userFeedback: 'Add rain and futuristic vehicles',
      aiComment: 'Added "rain-slicked streets" and "futuristic cars" for enhanced cyberpunk atmosphere',
      parentId: prompt4.id,
    },
  });
  console.log('  ✅ Created prompt:', prompt5.content.substring(0, 40) + '...');

  // Create prompts for Project 3 (Abstract Art)
  const prompt6 = await prisma.prompt.create({
    data: {
      projectId: project3Id,
      type: 'IMAGE',
      content: 'Abstract geometric patterns in vibrant colors',
    },
  });
  console.log('  ✅ Created prompt:', prompt6.content.substring(0, 40) + '...');

  // Create some assets for prompts
  await prisma.asset.create({
    data: {
      promptId: p1.id,
      type: 'IMAGE',
      url: 'https://picsum.photos/seed/mountain1/1920/1080',
      provider: 'MIDJOURNEY',
      width: 1920,
      height: 1080,
      fileSize: 2048000,
      mimeType: 'image/jpeg',
    },
  });

  await prisma.asset.create({
    data: {
      promptId: p2.id,
      type: 'IMAGE',
      url: 'https://picsum.photos/seed/mountain2/1920/1080',
      provider: 'MIDJOURNEY',
      width: 1920,
      height: 1080,
      fileSize: 2560000,
      mimeType: 'image/jpeg',
    },
  });

  await prisma.asset.create({
    data: {
      promptId: prompt4.id,
      type: 'IMAGE',
      url: 'https://picsum.photos/seed/cyberpunk1/1920/1080',
      provider: 'MIDJOURNEY',
      width: 1920,
      height: 1080,
      fileSize: 1920000,
      mimeType: 'image/jpeg',
    },
  });

  console.log('✅ Created 3 assets');

  console.log('\n🎉 Seeding complete!');
  console.log(`\nCreated:`);
  console.log(`  - 3 projects`);
  console.log(`  - 24 prompts total`);
  console.log(`    - Project 1: 20 prompts with deep hierarchical relationships (up to 4 levels)`);
  console.log(`    - Project 2: 2 prompts`);
  console.log(`    - Project 3: 2 prompts`);
  console.log(`  - 5 assets`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
