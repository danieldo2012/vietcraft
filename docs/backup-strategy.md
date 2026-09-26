# VietCraft - Database Backup & Disaster Recovery Strategy

## 1. Automated Backups via MongoDB Atlas
If using MongoDB Atlas in production:
1. **Continuous Cloud Backups**: Atlas provides point-in-time restores (PITR) with RPO (Recovery Point Objective) of 1 minute.
2. **Scheduled Daily Snapshots**: Retained for 7 days, 30 days, or 1 year according to data compliance policies.

---

## 2. Automated Self-Hosted Backup Script

For Docker or self-hosted virtual machines, schedule a recurring cron job executing `mongodump`:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/mongodb"
DATABASE_NAME="vietcraft"
S3_BUCKET="s3://vietcraft-database-backups"

mkdir -p "$BACKUP_DIR"

# Perform mongodump
mongodump --db "$DATABASE_NAME" --gzip --archive="$BACKUP_DIR/backup_$TIMESTAMP.gz"

# Encrypt & Upload to AWS S3 / Cloudflare R2
aws s3 cp "$BACKUP_DIR/backup_$TIMESTAMP.gz" "$S3_BUCKET/$DATABASE_NAME/backup_$TIMESTAMP.gz"

# Retain local backups for 7 days
find "$BACKUP_DIR" -type f -mtime +7 -name "*.gz" -exec rm {} \;
```

---

## 3. Database Restoration Procedure

To restore from an archive:

```bash
# Decompress and restore into target database
mongorestore --drop --gzip --archive=backup_20260916_000000.gz --db vietcraft
```
