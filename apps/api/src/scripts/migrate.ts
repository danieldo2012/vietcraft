import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();
import {
  User,
  Material,
  Category,
  Product,
  Post,
  Homepage,
  SiteSettings,
  HeaderSettings,
  FooterSettings,
  Page,
  ContactMessage,
  Newsletter,
  AffiliateClick
} from '../models';

export interface MigrationOptions {
  sourceUri?: string;
  targetUri?: string;
  fromBackup?: string;
  force?: boolean;
  dryRun?: boolean;
}

export interface MigrationResult {
  success: boolean;
  sourceUri: string;
  targetUri: string;
  migratedCollections: Record<string, { count: number; status: 'SUCCESS' | 'SKIPPED' | 'FAILED'; error?: string }>;
  totalMigrated: number;
}

const MODELS = [
  User,
  Material,
  Category,
  Product,
  Post,
  Homepage,
  SiteSettings,
  HeaderSettings,
  FooterSettings,
  Page,
  ContactMessage,
  Newsletter,
  AffiliateClick
];

export async function runMigration(options: MigrationOptions = {}): Promise<MigrationResult> {
  const args = process.argv.slice(2);
  const getArg = (flag: string) => {
    const found = args.find((a) => a.startsWith(`--${flag}=`));
    return found ? found.split('=')[1] : undefined;
  };
  const hasFlag = (flag: string) => args.includes(`--${flag}`);

  const sourceUri =
    options.sourceUri ||
    getArg('source-uri') ||
    process.env.SOURCE_MONGODB_URI ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/vietcraft';

  const targetUri =
    options.targetUri ||
    getArg('target-uri') ||
    process.env.TARGET_MONGODB_URI ||
    process.env.ATLAS_MONGODB_URI;

  const fromBackup = options.fromBackup || getArg('from-backup');
  const force = options.force !== undefined ? options.force : hasFlag('force');
  const dryRun = options.dryRun !== undefined ? options.dryRun : hasFlag('dry-run');

  const sanitize = (uri?: string) => (uri ? uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : '(none)');

  console.log('\n======================================================');
  console.log('🚀 VIETCRAFT MONGODB PRODUCTION MIGRATION');
  console.log('======================================================');
  console.log(`Source : ${fromBackup ? `Backup [${fromBackup}]` : sanitize(sourceUri)}`);
  console.log(`Target : ${sanitize(targetUri)}`);
  console.log(`Mode   : ${dryRun ? 'DRY-RUN (No writes)' : 'LIVE MIGRATION'}`);
  console.log(`Force  : ${force ? 'YES (Overwrite permitted)' : 'NO (Safe mode)'}`);
  console.log('======================================================\n');

  if (!targetUri) {
    throw new Error(
      'Target MongoDB URI is required. Provide via --target-uri=<URI> or TARGET_MONGODB_URI environment variable.\nExample:\n  npx tsx src/scripts/migrate.ts --target-uri="mongodb+srv://admin:pass@cluster.mongodb.net/vietcraft"'
    );
  }

  if (targetUri === sourceUri && !fromBackup) {
    throw new Error('Target URI cannot be identical to Source URI.');
  }

  // 1. Connect to Target Database
  console.log('🔌 Connecting to Target Database...');
  const targetConnection = await mongoose.createConnection(targetUri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: 20
  }).asPromise();

  const targetDb = targetConnection.db;
  if (!targetDb) {
    throw new Error('Could not access Target database instance.');
  }
  console.log('✅ Connected to Target database.\n');

  // 2. Safety Check: Verify if Target Database already contains documents
  console.log('🔍 Checking Target Database state...');
  const targetExistingCollections = await targetDb.listCollections().toArray();
  let targetHasData = false;
  const existingCounts: Record<string, number> = {};

  for (const c of targetExistingCollections) {
    const count = await targetDb.collection(c.name).countDocuments();
    if (count > 0) {
      targetHasData = true;
      existingCounts[c.name] = count;
    }
  }

  if (targetHasData) {
    console.warn('⚠️  Target database already contains existing documents:');
    for (const [col, count] of Object.entries(existingCounts)) {
      console.warn(`    - ${col}: ${count} docs`);
    }
    if (!force) {
      await targetConnection.close();
      throw new Error(
        'ABORTED: Target database is NOT empty. To overwrite existing target collections, re-run with --force flag.'
      );
    }
    console.log('⚠️  --force specified: Existing collections in target will be cleared prior to import.\n');
  } else {
    console.log('✅ Target database is clean (0 documents found).\n');
  }

  // 3. Connect to Source (or load from Backup)
  const collectionData: Record<string, any[]> = {};

  if (fromBackup) {
    console.log(`📂 Loading data from backup directory: ${fromBackup}...`);
    if (!fs.existsSync(fromBackup)) {
      throw new Error(`Backup directory not found: ${fromBackup}`);
    }
    const files = fs.readdirSync(fromBackup).filter((f) => f.endsWith('.json') && f !== 'manifest.json');
    for (const file of files) {
      const colName = path.basename(file, '.json');
      const content = fs.readFileSync(path.join(fromBackup, file), 'utf-8');
      collectionData[colName] = JSON.parse(content);
      console.log(`   Loaded ${colName}: ${collectionData[colName].length} docs from file`);
    }
  } else {
    console.log('🔌 Connecting to Source Database...');
    const sourceConnection = await mongoose.createConnection(sourceUri, {
      serverSelectionTimeoutMS: 5000
    }).asPromise();
    const sourceDb = sourceConnection.db;
    if (!sourceDb) {
      throw new Error('Could not access Source database instance.');
    }

    const sourceCols = await sourceDb.listCollections().toArray();
    for (const c of sourceCols) {
      collectionData[c.name] = await sourceDb.collection(c.name).find({}).toArray();
    }
    await sourceConnection.close();
    console.log('✅ Extracted collections from source database.\n');
  }

  // 4. Dry-run early exit
  if (dryRun) {
    console.log('📋 DRY-RUN SUMMARY (No changes written to Target):');
    let dryTotal = 0;
    for (const [col, docs] of Object.entries(collectionData)) {
      console.log(`   - ${col.padEnd(18)} : ${docs.length.toString().padStart(4)} docs would be migrated`);
      dryTotal += docs.length;
    }
    console.log(`\nTotal: ${dryTotal} documents across ${Object.keys(collectionData).length} collections.`);
    await targetConnection.close();
    return {
      success: true,
      sourceUri: sanitize(sourceUri),
      targetUri: sanitize(targetUri),
      migratedCollections: Object.fromEntries(
        Object.entries(collectionData).map(([col, docs]) => [col, { count: docs.length, status: 'SUCCESS' }])
      ),
      totalMigrated: dryTotal
    };
  }

  // 5. Build Indexes on Target using Mongoose Models
  console.log('📐 Synchronizing Indexes on Target Database...');
  for (const ModelClass of MODELS) {
    try {
      const TargetModel = targetConnection.model(ModelClass.modelName, ModelClass.schema);
      await TargetModel.syncIndexes();
      console.log(`   ✓ Indexes synchronized for model: ${ModelClass.modelName} [${TargetModel.collection.name}]`);
    } catch (idxErr: any) {
      console.warn(`   ⚠️ Warning syncing indexes for ${ModelClass.modelName}:`, idxErr.message);
    }
  }
  console.log('✅ Index synchronization complete.\n');

  // 6. Migrate Documents
  console.log('🚚 Migrating collections to Target Database...');
  const result: MigrationResult = {
    success: true,
    sourceUri: sanitize(sourceUri),
    targetUri: sanitize(targetUri),
    migratedCollections: {},
    totalMigrated: 0
  };

  for (const [colName, docs] of Object.entries(collectionData)) {
    try {
      const targetCol = targetDb.collection(colName);
      if (force && targetHasData && existingCounts[colName]) {
        await targetCol.deleteMany({});
      }

      if (docs.length > 0) {
        // Convert serialized ObjectIDs / Dates back to BSON types if needed
        const bsonDocs = docs.map((doc: any) => {
          const transformed = { ...doc };
          if (transformed._id && typeof transformed._id === 'string' && transformed._id.match(/^[0-9a-fA-F]{24}$/)) {
            transformed._id = new mongoose.Types.ObjectId(transformed._id);
          }
          return transformed;
        });

        const insertResult = await targetCol.insertMany(bsonDocs, { ordered: false });
        const insertedCount = insertResult.insertedCount;
        result.migratedCollections[colName] = { count: insertedCount, status: 'SUCCESS' };
        result.totalMigrated += insertedCount;
        console.log(`   ✓ ${colName.padEnd(18)} : ${insertedCount.toString().padStart(4)} docs inserted`);
      } else {
        result.migratedCollections[colName] = { count: 0, status: 'SUCCESS' };
        console.log(`   ✓ ${colName.padEnd(18)} :    0 docs (empty collection)`);
      }
    } catch (err: any) {
      result.success = false;
      result.migratedCollections[colName] = { count: 0, status: 'FAILED', error: err.message };
      console.error(`   ❌ Failed migrating ${colName}:`, err.message);
    }
  }

  await targetConnection.close();

  console.log('\n======================================================');
  console.log(`🎉 MIGRATION ${result.success ? 'COMPLETED SUCCESSFULLY' : 'COMPLETED WITH WARNINGS'}`);
  console.log(`   Total Documents Migrated: ${result.totalMigrated}`);
  console.log('======================================================\n');

  return result;
}

if (require.main === module || process.argv[1]?.includes('migrate')) {
  runMigration()
    .then((res) => {
      process.exit(res.success ? 0 : 1);
    })
    .catch((err) => {
      console.error('\n❌ Migration Fatal Error:', err.message);
      process.exit(1);
    });
}
