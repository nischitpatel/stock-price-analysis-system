import {tickerStrip} from "../services/tickerstrip.service.js";

export async function getTickerStrip(req, res){
  try {
    const data = await tickerStrip();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
