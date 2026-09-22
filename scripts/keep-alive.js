// ============================================================================
// Anti-Sleep / Keep-Alive Xizmati
// Render va boshqa bulutli hostinglarda bepul rejimlarda tizim 15 daqiqa
// harakatsizlikdan so'ng uxlab qolishining oldini oladi.
// ============================================================================
require("dotenv").config();

function getBaseUrl() {
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.trim();
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.trim();
  }
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
}

const baseUrl = getBaseUrl();
const targetEndpoint = `${baseUrl.replace(/\/$/, "")}/api/health`;
const INTERVAL_MS = parseInt(process.env.KEEP_ALIVE_INTERVAL_MS, 10) || 10 * 60 * 1000; // 10 daqiqa

console.log("---------------------------------------------------------");
console.log("🛡️  [Anti-Sleep Keep-Alive] Xizmati faollashtirildi");
console.log(`🌐 Target Endpoint: ${targetEndpoint}`);
console.log(`⏱️  Ping oralig'i: ${INTERVAL_MS / 60000} daqiqa`);
console.log("---------------------------------------------------------");

let pingCount = 0;

async function ping() {
  pingCount++;
  const startTime = Date.now();
  const timeStr = new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  try {
    const response = await fetch(targetEndpoint, {
      method: "GET",
      headers: {
        "User-Agent": "Render-KeepAlive-Bot/1.0",
        "Cache-Control": "no-cache",
      },
    });

    const duration = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      console.log(
        `✅ [Anti-Sleep #${pingCount}] [${timeStr}] Muvaffaqiyatli ping! Status: ${response.status} (${duration}ms) | DB: ${data.database || "ok"} | Uptime: ${data.uptime || "N/A"}`
      );
    } else {
      console.warn(
        `⚠️ [Anti-Sleep #${pingCount}] [${timeStr}] Server javob berdi, lekin xato kodi: ${response.status} (${duration}ms)`
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [Anti-Sleep #${pingCount}] [${timeStr}] Ping xatoligi (${duration}ms): ${error.message}`
    );
  }
}

// Dastlabki tekshiruv: server to'liq ishga tushgach (10 soniyadan so'ng)
setTimeout(ping, 10000);

// Har 10 daqiqada muntazam ping yuborish
const timer = setInterval(ping, INTERVAL_MS);

// Node.js to'xtatilganda tozalash
process.on("SIGINT", () => {
  clearInterval(timer);
  process.exit(0);
});
process.on("SIGTERM", () => {
  clearInterval(timer);
  process.exit(0);
});

module.exports = { ping };
