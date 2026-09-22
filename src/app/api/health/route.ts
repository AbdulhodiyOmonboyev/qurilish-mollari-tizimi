import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  let dbStatus = "connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e: any) {
    dbStatus = `disconnected: ${e?.message || "error"}`;
  }

  return NextResponse.json(
    {
      status: "ok",
      service: "qurilish-boshqaruv-tizimi",
      message: "Qurilish Mollari Boshqaruv Tizimi faol ishlab turibdi",
      uptime: `${Math.floor(uptime / 60)} daqiqa ${Math.floor(uptime % 60)} soniya`,
      uptimeSeconds: Math.floor(uptime),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}
