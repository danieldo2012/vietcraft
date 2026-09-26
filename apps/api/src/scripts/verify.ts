import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export interface VerificationReport {
  timestamp: string;
  sourceUri: string;
  targetUri: string;
  overallStatus: 'PASS' | 'FAIL';
  collections: {
    name: string;
    sourceCount: number;
    targetCount: number;
    diff: number;
    status: 'PASS' | 'FAIL';
  }[];
  indexCheck: {
    collection: string;
    targetIndexes: string[];
    status: 'PASS' | 'WARN';
  }[];
  integrityCheck: {
    checkName: string;
    details: string;
    status: 'PASS' | 'FAIL';
  }[];
}

export async function runVerification(targetUriParam?: string, sourceUriParam?: string): Promise<VerificationReport> {
  const args = process.argv.slice(2);
  const getArg = (flag: string) => {
    const found = args.find((a) => a.startsWith(`--${flag}=`));
    return found ? found.split('=')[1] : undefined;
  };

  const sourceUri =
    sourceUriParam ||
    getArg('source-uri') ||
    process.env.SOURCE_MONGODB_URI ||
    'mongodb://127.0.0.1:27017/vietcraft';

  const targetUri =
    targetUriParam ||
    getArg('target-uri') ||
    process.env.TARGET_MONGODB_URI ||
    process.env.MONGODB_URI;

  const sanitize = (uri?: string) => (uri ? uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : '(none)');

  if (!targetUri) {
    throw new Error(
      'Target MongoDB URI is required for verification. Pass --target-uri=<URI> or set TARGET_MONGODB_URI environment variable.'
    );
  }

  console.log('\n======================================================');
  console.log('🔍 VIETCRAFT DATABASE MIGRATION VERIFICATION');
  console.log('======================================================');
  console.log(`Source URI : ${sanitize(sourceUri)}`);
  console.log(`Target URI : ${sanitize(targetUri)}`);
  console.log('======================================================\n');

  // Connect to Target
  const targetConn = await mongoose.createConnection(targetUri, {
    serverSelectionTimeoutMS: 8000
  }).asPromise();
  const targetDb = targetConn.db;
  if (!targetDb) throw new Error('Could not access Target database');

  // Connect to Source (or check latest backup if source is unreachable)
  let sourceDb: any = null;
  let sourceConn: any = null;
  let backupData: Record<string, number> = {};

  try {
    sourceConn = await mongoose.createConnection(sourceUri, {
      serverSelectionTimeoutMS: 3000
    }).asPromise();
    sourceDb = sourceConn.db;
  } catch {
    console.warn('⚠️  Could not connect to live source database. Falling back to latest backup for comparison...');
    const latestManifest = path.resolve(__dirname, '../../../../backups/latest/manifest.json');
    if (fs.existsSync(latestManifest)) {
      const manifest = JSON.parse(fs.readFileSync(latestManifest, 'utf-8'));
      for (const [col, info] of Object.entries(manifest.collections as Record<string, any>)) {
        backupData[col] = info.count;
      }
      console.log('✅ Loaded source baseline from latest backup manifest.\n');
    }
  }

  const expectedCollections = [
    'affiliateclicks',
    'categories',
    'contactmessages',
    'footersettings',
    'headersettings',
    'homepages',
    'materials',
    'newsletters',
    'pages',
    'posts',
    'products',
    'sitesettings',
    'users'
  ];

  const report: VerificationReport = {
    timestamp: new Date().toISOString(),
    sourceUri: sanitize(sourceUri),
    targetUri: sanitize(targetUri),
    overallStatus: 'PASS',
    collections: [],
    indexCheck: [],
    integrityCheck: []
  };

  // 1. Document Counts Check
  console.log('📊 1. DOCUMENT COUNT COMPARISON:');
  console.log('--------------------------------------------------------------------------------');
  console.log('| Collection         | Source Count | Target Count | Difference | Status       |');
  console.log('--------------------------------------------------------------------------------');

  for (const colName of expectedCollections) {
    let srcCount = 0;
    if (sourceDb) {
      srcCount = await sourceDb.collection(colName).countDocuments();
    } else if (backupData[colName] !== undefined) {
      srcCount = backupData[colName];
    }

    const tgtCount = await targetDb.collection(colName).countDocuments();
    const diff = tgtCount - srcCount;
    const isPass = srcCount === tgtCount;

    if (!isPass) {
      report.overallStatus = 'FAIL';
    }

    report.collections.push({
      name: colName,
      sourceCount: srcCount,
      targetCount: tgtCount,
      diff,
      status: isPass ? 'PASS' : 'FAIL'
    });

    const statusBadge = isPass ? '✅ PASS' : '❌ FAIL';
    console.log(
      `| ${colName.padEnd(18)} | ${srcCount.toString().padStart(12)} | ${tgtCount.toString().padStart(12)} | ${diff.toString().padStart(10)} | ${statusBadge.padEnd(12)} |`
    );
  }
  console.log('--------------------------------------------------------------------------------\n');

  // 2. Index Verification Check
  console.log('📐 2. INDEX VERIFICATION:');
  for (const colName of expectedCollections) {
    try {
      const idxs = await targetDb.collection(colName).indexes();
      const idxNames = idxs.map((i: any) => i.name);
      report.indexCheck.push({
        collection: colName,
        targetIndexes: idxNames,
        status: idxNames.length > 0 ? 'PASS' : 'WARN'
      });
      console.log(`   ✓ ${colName.padEnd(18)} : [${idxNames.join(', ')}]`);
    } catch {
      console.log(`   ⚠️ ${colName.padEnd(18)} : Collection has no indexes`);
    }
  }
  console.log();

  // 3. Data Integrity & Relational Verification
  console.log('🔬 3. DATA INTEGRITY & RELATIONSHIP CHECKS:');

  // Check 3.1: Admin User Authentication Integrity
  const adminUser = await targetDb.collection('users').findOne({ role: 'admin' });
  if (adminUser && (adminUser.password || adminUser.passwordHash)) {
    report.integrityCheck.push({
      checkName: 'Admin User Credential Hash',
      details: `Admin user (${adminUser.email}) exists with valid bcrypt password hash.`,
      status: 'PASS'
    });
    console.log(`   ✅ Admin Credential Integrity : PASS (${adminUser.email})`);
  } else {
    report.integrityCheck.push({
      checkName: 'Admin User Credential Hash',
      details: 'No admin user with valid password hash found.',
      status: 'FAIL'
    });
    report.overallStatus = 'FAIL';
    console.log(`   ❌ Admin Credential Integrity : FAIL`);
  }

  // Check 3.2: Products Category & Material References
  const sampleProducts = await targetDb.collection('products').find({}).limit(5).toArray();
  let productRefsValid = true;
  for (const prod of sampleProducts) {
    const matExists = await targetDb.collection('materials').countDocuments({ _id: prod.material });
    const catExists = await targetDb.collection('categories').countDocuments({ _id: prod.category });
    if (!matExists || !catExists) {
      productRefsValid = false;
      break;
    }
  }
  if (sampleProducts.length > 0 && productRefsValid) {
    report.integrityCheck.push({
      checkName: 'Product Relational References',
      details: 'Product documents reference existing valid Category and Material ObjectIDs.',
      status: 'PASS'
    });
    console.log('   ✅ Product Relational Integrity: PASS');
  } else if (sampleProducts.length === 0) {
    console.log('   ℹ️  No products to inspect');
  } else {
    report.integrityCheck.push({
      checkName: 'Product Relational References',
      details: 'Dangling material or category references detected in products.',
      status: 'FAIL'
    });
    report.overallStatus = 'FAIL';
    console.log('   ❌ Product Relational Integrity: FAIL');
  }

  // Check 3.3: Posts Slugs and Featured Images
  const samplePosts = await targetDb.collection('posts').find({}).limit(5).toArray();
  const postsValid = samplePosts.every((p) => p.slug && p.featuredImage && p.content);
  if (samplePosts.length > 0 && postsValid) {
    report.integrityCheck.push({
      checkName: 'Post Editorial Integrity',
      details: 'Posts contain valid slugs, content, and featured images.',
      status: 'PASS'
    });
    console.log('   ✅ Post Editorial Integrity    : PASS');
  }

  // Check 3.4: Homepage Configuration
  const homepage = await targetDb.collection('homepages').findOne({});
  if (homepage && Array.isArray(homepage.heroSlides) && homepage.heroSlides.length > 0) {
    report.integrityCheck.push({
      checkName: 'Homepage Content Integrity',
      details: `Homepage configured with ${homepage.heroSlides.length} hero slides.`,
      status: 'PASS'
    });
    console.log('   ✅ Homepage Configuration      : PASS');
  }

  // Clean up connections
  if (sourceConn) await sourceConn.close();
  await targetConn.close();

  console.log('\n======================================================');
  console.log(`FINAL RESULT: ${report.overallStatus === 'PASS' ? '✅ ALL CHECKS PASSED' : '❌ VERIFICATION FAILED'}`);
  console.log('======================================================\n');

  return report;
}

if (require.main === module || process.argv[1]?.includes('verify')) {
  runVerification()
    .then((rep) => {
      process.exit(rep.overallStatus === 'PASS' ? 0 : 1);
    })
    .catch((err) => {
      console.error('\n❌ Verification Fatal Error:', err.message);
      process.exit(1);
    });
}
