import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env';

export interface BackupManifest {
  timestamp: string;
  sourceUri: string;
  totalCollections: number;
  totalDocuments: number;
  collections: Record<
    string,
    {
      count: number;
      indexes: any[];
    }
  >;
}

export async function runBackup(customSourceUri?: string, customOutputDir?: string): Promise<string> {
  const sourceUri = customSourceUri || ENV.MONGODB_URI || 'mongodb://127.0.0.1:27017/vietcraft';
  const sanitizedUri = sourceUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`\n📦 Starting VietCraft Database Backup...`);
  console.log(`🔌 Source Database: ${sanitizedUri}`);

  await mongoose.connect(sourceUri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed.');
  }

  const now = new Date();
  const timestampStr = now.toISOString().replace(/[:.]/g, '-');
  const backupBaseDir = customOutputDir || path.resolve(__dirname, '../../../../backups');
  const backupFolder = path.join(backupBaseDir, `vietcraft-${timestampStr}`);

  if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder, { recursive: true });
  }

  const collections = await db.listCollections().toArray();
  const manifest: BackupManifest = {
    timestamp: now.toISOString(),
    sourceUri: sanitizedUri,
    totalCollections: collections.length,
    totalDocuments: 0,
    collections: {}
  };

  console.log(`📁 Target directory: ${backupFolder}`);
  console.log(`📋 Found ${collections.length} collections.\n`);

  for (const col of collections.sort((a, b) => a.name.localeCompare(b.name))) {
    const colName = col.name;
    const documents = await db.collection(colName).find({}).toArray();
    const indexes = await db.collection(colName).indexes();

    const filePath = path.join(backupFolder, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), 'utf-8');

    manifest.collections[colName] = {
      count: documents.length,
      indexes
    };
    manifest.totalDocuments += documents.length;

    console.log(`  ✓ Exported ${colName.padEnd(18)} : ${documents.length.toString().padStart(4)} docs`);
  }

  const manifestPath = path.join(backupFolder, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  // Also create/update a 'latest' pointer directory for convenience
  const latestFolder = path.join(backupBaseDir, 'latest');
  if (!fs.existsSync(latestFolder)) {
    fs.mkdirSync(latestFolder, { recursive: true });
  }
  for (const colName of Object.keys(manifest.collections)) {
    fs.copyFileSync(path.join(backupFolder, `${colName}.json`), path.join(latestFolder, `${colName}.json`));
  }
  fs.copyFileSync(manifestPath, path.join(latestFolder, 'manifest.json'));

  await mongoose.disconnect();

  console.log(`\n🎉 Backup successfully completed!`);
  console.log(`   Total collections: ${manifest.totalCollections}`);
  console.log(`   Total documents:   ${manifest.totalDocuments}`);
  console.log(`   Manifest saved:    ${manifestPath}`);
  return backupFolder;
}

if (require.main === module || process.argv[1]?.includes('backup')) {
  runBackup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ Backup failed:', err.message);
      process.exit(1);
    });
}
