const fs = require("fs");
const path = require("path");

function createBackup() {
  const dbPath = path.join(__dirname, "..", "prisma", "dev.db");
  const backupsDir = path.join(__dirname, "..", "backups");

  if (!fs.existsSync(dbPath)) {
    console.log("Xatolik: prisma/dev.db fayli topilmadi!");
    return;
  }

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const date = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `backup_db_${date}.db`;
  const destPath = path.join(backupsDir, backupFileName);

  fs.copyFileSync(dbPath, destPath);
  console.log(`Zaxira nusxasi muvaffaqiyatli saqlandi: backups/${backupFileName}`);

  // Faqat oxirgi 10 ta zaxirani saqlab, eskirganlarini tozalash
  const files = fs.readdirSync(backupsDir)
    .filter((f) => f.startsWith("backup_db_") && f.endsWith(".db"))
    .map((f) => ({ name: f, time: fs.statSync(path.join(backupsDir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);

  if (files.length > 10) {
    for (let i = 10; i < files.length; i++) {
      fs.unlinkSync(path.join(backupsDir, files[i].name));
      console.log(`Eski zaxira o'chirildi: ${files[i].name}`);
    }
  }
}

createBackup();
