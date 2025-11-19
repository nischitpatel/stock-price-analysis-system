import { getUsTop5Indices } from "../services/indices.service.js";

export async function usTop5Indices(req, res) {
  try {
    const payload = await getUsTop5Indices();
    // Indices move a lot; cache briefly
    res.set("Cache-Control", "public, max-age=10, stale-while-revalidate=30");
    res.json(payload);
  } catch (e) {
    console.error("US indices error:", e);
    const isTimeout = String(e?.code || e?.cause?.code || "").includes("TIMEOUT");
    res.status(isTimeout ? 504 : 500).json({
      error: "Failed to fetch US indices",
      details: e?.message || String(e)
    });
  }
}
