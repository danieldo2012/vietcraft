import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vietcraft';
  console.log(`Connecting to ${uri}...`);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;
  if (!db) {
    console.error('Database connection handle not found');
    process.exit(1);
  }

  const collections = await db.listCollections().toArray();
  console.log('\n--- Collections & Document Counts ---');
  for (const c of collections.sort((a, b) => a.name.localeCompare(b.name))) {
    const count = await db.collection(c.name).countDocuments();
    const indexes = await db.collection(c.name).indexes();
    console.log(`${c.name}: ${count} docs (indexes: ${indexes.map((idx: any) => idx.name).join(', ')})`);
  }

  await mongoose.disconnect();
  console.log('\nDisconnected successfully.');
}

main().catch((err) => {
  console.error('Error checking DB:', err);
  process.exit(1);
});
