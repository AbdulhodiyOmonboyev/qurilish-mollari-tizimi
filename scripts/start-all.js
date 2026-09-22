// ============================================================================
// Production All-In-One Runner
// Next.js Web Server + Anti-Sleep Keep-Alive + Telegram Bot (agar token bo'lsa)
// Bitta Render Free Web Service konteynerida barchasini 24/7 ishlatadi.
// ============================================================================
const { fork } = require("child_process");
const path = require("path");
require("dotenv").config();

console.log("=========================================================");
console.log("🚀 [Tizim Boshqaruvi] Production xizmatlari ishga tushmoqda...");
console.log(`🕒 Sana/Vaqt: ${new Date().toISOString()}`);
console.log(`🌐 PORT: ${process.env.PORT || 3000}`);
console.log("=========================================================");

const childProcesses = [];

// 1. Next.js Web Dashboard
const nextCli = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
const port = process.env.PORT || "3000";

console.log(`📦 [1/3] Next.js Web Dashboard yuklanmoqda (Port: ${port})...`);
const nextProcess = fork(nextCli, ["start", "-p", port], {
  stdio: "inherit",
  env: process.env,
});
childProcesses.push({ name: "Next.js Web", proc: nextProcess });

// 2. Anti-Sleep Keep-Alive Xizmati
console.log(`🛡️  [2/3] Anti-Sleep Keep-Alive xizmati yuklanmoqda...`);
const keepAliveProcess = fork(path.join(__dirname, "keep-alive.js"), [], {
  stdio: "inherit",
  env: process.env,
});
childProcesses.push({ name: "Anti-Sleep Keep-Alive", proc: keepAliveProcess });

// 3. Telegram Bot (Agar TELEGRAM_BOT_TOKEN kiritilgan bo'lsa)
const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (botToken && botToken !== "YOUR_TELEGRAM_BOT_TOKEN_HERE" && botToken.trim() !== "") {
  console.log(`🤖 [3/3] Telegram Bot xizmati yuklanmoqda...`);
  const botProcess = fork(path.join(__dirname, "telegram-bot.js"), [], {
    stdio: "inherit",
    env: process.env,
  });
  childProcesses.push({ name: "Telegram Bot", proc: botProcess });
} else {
  console.log(`ℹ️ [3/3] Telegram Bot token kiritilmagan, faqat Web va Anti-Sleep ishlaydi.`);
}

// Xavfsiz to'xtatish (Graceful Shutdown)
function handleShutdown(signal) {
  console.log(`\n🛑 [Signal: ${signal}] Barcha xizmatlar to'xtatilmoqda...`);
  for (const item of childProcesses) {
    try {
      console.log(`   To'xtatilmoqda: ${item.name}`);
      item.proc.kill("SIGTERM");
    } catch (e) {}
  }
  process.exit(0);
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

// Asosiy Next.js to'xtab qolsa, butun jarayonni to'xtatish
nextProcess.on("exit", (code) => {
  console.log(`⚠️ Next.js server to'xtadi (kod: ${code}). Tizim yakunlanmoqda.`);
  handleShutdown("NEXT_EXIT");
});
