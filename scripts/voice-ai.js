// ============================================================================
// Ovozli Xabarlarni AI Orqali Eshitish va Xarajatga Aylantirish Moduli
// Google Gemini 1.5 Flash / Groq Whisper / OpenAI Whisper orqali ishlaydi
// ============================================================================
require("dotenv").config();

/**
 * Matndan raqam va ming/million so'zlarini ajratib olish (yordamchi funksiya)
 */
function extractAmountFromText(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  // Masalan: "150 ming", "1.5 million", "200 000", "50000"
  const millionMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:mln|million|melyon)/);
  if (millionMatch) {
    return Math.round(parseFloat(millionMatch[1].replace(",", ".")) * 1000000);
  }

  const thousandMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:ming|k\b)/);
  if (thousandMatch) {
    return Math.round(parseFloat(thousandMatch[1].replace(",", ".")) * 1000);
  }

  const rawNumberMatch = lower.match(/\b(\d{4,9})\b/);
  if (rawNumberMatch) {
    return parseInt(rawNumberMatch[1], 10);
  }

  return null;
}

/**
 * Matn mazmuniga qarab kategoriya taxmin qilish
 */
function detectCategory(text) {
  const lower = (text || "").toLowerCase();
  if (lower.includes("ijara") || lower.includes("arenda")) return "Do'kon/Ombor ijarasi";
  if (lower.includes("oylik") || lower.includes("ish haqi") || lower.includes("avans") || lower.includes("maosh")) return "Ish haqi (Oylik)";
  if (lower.includes("benzin") || lower.includes("yoqilgi") || lower.includes("dizel") || lower.includes("metan") || lower.includes("dostavka") || lower.includes("transport") || lower.includes("taksi") || lower.includes("mashina")) return "Transport va logistika";
  if (lower.includes("svet") || lower.includes("elektr") || lower.includes("gaz") || lower.includes("suv") || lower.includes("musor") || lower.includes("kommunal")) return "Kommunal to'lovlar";
  if (lower.includes("tushlik") || lower.includes("obed") || lower.includes("ovqat") || lower.includes("choy") || lower.includes("non") || lower.includes("somsa") || lower.includes("shirinlik")) return "Oziq-ovqat va tushlik";
  if (lower.includes("sement") || lower.includes("tovar") || lower.includes("material") || lower.includes("yuk") || lower.includes("xarid")) return "Tovar xaridi";
  return "Boshqa xarajatlar";
}

/**
 * Google Gemini Flash orqali audioni tahlil qilish
 */
async function processWithGemini(audioBuffer, mimeType, apiKey) {
  const prompt =
    "Siz qurilish mollari savdosi va ombor tizimining aqlli hisobchisisiz. " +
    "Ushbu o'zbek tilidagi audio ovozli xabarni tinglang va undan chiqim (xarajat) ma'lumotlarini aniqlang.\n" +
    "Talablar:\n" +
    "1. 'transcript': Audioda aytilgan aniq o'zbekcha gap.\n" +
    "2. 'amount': Xarajat summasi (faqat raqam, masalan: 150000, 200000, 1000000). Ming va million so'zlarini to'liq son ko'rinishida yozing.\n" +
    "3. 'note': Xarajat nimaga qilingani haqida qisqa tushunarli izoh.\n" +
    "4. 'category': Quyidagi ro'yxatdan bittasini tanlang: 'Tovar xaridi', 'Do'kon/Ombor ijarasi', 'Ish haqi (Oylik)', 'Transport va logistika', 'Kommunal to'lovlar', 'Oziq-ovqat va tushlik', 'Boshqa xarajatlar'.\n\n" +
    "Javobni FAQAT JSON formatida qaytaring, boshqa hech qanday so'z qo'shmang:\n" +
    "{\n  \"transcript\": \"...\",\n  \"amount\": 150000,\n  \"note\": \"...\",\n  \"category\": \"...\"\n}";

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "audio/ogg",
              data: audioBuffer.toString("base64"),
            },
          },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API xatosi (${res.status}): ${errText.slice(0, 150)}`);
  }

  const data = await res.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) throw new Error("Gemini javob bermadi");

  const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleanJson);

  return {
    transcript: parsed.transcript || "Ovozli xabar",
    amount: Number(parsed.amount) || extractAmountFromText(parsed.transcript) || 0,
    note: parsed.note || parsed.transcript,
    category: parsed.category || detectCategory(parsed.transcript),
    engine: "Google Gemini 1.5 Flash",
  };
}

/**
 * Groq Whisper orqali audioni matnga o'girish
 */
async function processWithGroq(audioBuffer, mimeType, apiKey) {
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: mimeType || "audio/ogg" });
  formData.append("file", blob, "voice.ogg");
  formData.append("model", "whisper-large-v3");
  formData.append("language", "uz");
  formData.append("prompt", "Qurilish mollari xarajati: 100 ming so'm benzin, tushlik, ijara");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) throw new Error(`Groq Whisper xatosi: ${res.status}`);
  const data = await res.json();
  const transcript = data.text || "";

  const amount = extractAmountFromText(transcript) || 0;
  const category = detectCategory(transcript);

  return {
    transcript,
    amount,
    note: transcript,
    category,
    engine: "Groq Whisper Large v3",
  };
}

/**
 * OpenAI Whisper orqali audioni matnga o'girish
 */
async function processWithOpenAI(audioBuffer, mimeType, apiKey) {
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: mimeType || "audio/ogg" });
  formData.append("file", blob, "voice.ogg");
  formData.append("model", "whisper-1");
  formData.append("language", "uz");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) throw new Error(`OpenAI Whisper xatosi: ${res.status}`);
  const data = await res.json();
  const transcript = data.text || "";

  const amount = extractAmountFromText(transcript) || 0;
  const category = detectCategory(transcript);

  return {
    transcript,
    amount,
    note: transcript,
    category,
    engine: "OpenAI Whisper",
  };
}

/**
 * Asosiy ovozli xabarni qayta ishlash funksiyasi
 */
async function parseVoiceExpense(audioBuffer, mimeType, caption) {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GIMINI_AI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Agar Gemini kaliti bo'lsa
  if (geminiKey && geminiKey.trim() !== "") {
    try {
      return await processWithGemini(audioBuffer, mimeType, geminiKey.trim());
    } catch (e) {
      console.warn("Gemini orqali aniqlashda xatolik:", e.message);
    }
  }

  // 2. Agar Groq kaliti bo'lsa
  if (groqKey && groqKey.trim() !== "") {
    try {
      return await processWithGroq(audioBuffer, mimeType, groqKey.trim());
    } catch (e) {
      console.warn("Groq orqali aniqlashda xatolik:", e.message);
    }
  }

  // 3. Agar OpenAI kaliti bo'lsa
  if (openaiKey && openaiKey.trim() !== "") {
    try {
      return await processWithOpenAI(audioBuffer, mimeType, openaiKey.trim());
    } catch (e) {
      console.warn("OpenAI orqali aniqlashda xatolik:", e.message);
    }
  }

  // 4. Agar caption (xabar tagidagi yozuv) berilgan bo'lsa
  if (caption && caption.trim() !== "") {
    const amount = extractAmountFromText(caption);
    if (amount) {
      return {
        transcript: caption,
        amount,
        note: caption,
        category: detectCategory(caption),
        engine: "Matn tahlilchisi (Caption)",
      };
    }
  }

  // Agar hech qanday AI kaliti sozlanmagan bo'lsa
  return {
    error: "NO_AI_KEY",
    message: "AI kaliti topilmadi",
  };
}

module.exports = {
  parseVoiceExpense,
  extractAmountFromText,
  detectCategory,
};
