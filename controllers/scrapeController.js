import { scrapeData } from '../services/scraperService.js';

export async function scrape(req, res, next) {
  try {
    const data = await scrapeData();
    res.json(data);
  } catch (error) {
    next(error);
  }
}