import { getMarketNews } from "../services/news.service.js";
import { getCompanyLatestNews } from "../services/news.service.js";

export async function marketNews(req, res) {
  try {
    const category = (req.query.category || "general").toLowerCase();
    const minId = req.query.minId ? Number(req.query.minId) : undefined;
    const limit = Number(req.query.limit || 20);

    const data = await getMarketNews({ category, minId, limit });

    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    res.json(data);
  } catch (error) {
    console.error("Error in marketNews controller:", error);
    const status = error?.response?.status || 500;
    res.status(status).json({ error: "Failed to fetch market news", details: error?.message || String(error) });
  }
}

export async function companyLatestNews(req, res) {
  try {
    const { symbol } = req.params;
    const days  = Number(req.query.days || 14);
    const limit = Number(req.query.limit || 20);

    const payload = await getCompanyLatestNews(symbol, { days, limit });

    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.json(payload);
  } catch (e) {
    const status = e?.response?.status || 500;
    res.status(status).json({ error: "Failed to fetch company latest news", details: e?.message || String(e) });
  }
}
