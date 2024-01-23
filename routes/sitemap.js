const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
router.get("/", async (req, res) => {
  const items = await (
    await db.get("items").find({}).project({ _id: 1 })
  ).toArray();
  const itemsMap = items
    .map((item) => {
      return ` <url>
    
    <loc>${process.env.FRONT_BASE_URL}/items/${item._id.toString()}</loc>

    <lastmod>2024-01-20</lastmod>

    <changefreq>monthly</changefreq>

    <priority>0.8</priority>

 </url>`;
    })
    .join("");
  const siteMap = `<?xml version="1.0" encoding="UTF-8"?>

    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    
       <url>
    
          <loc>${process.env.FRONT_BASE_URL}</loc>
    
          <lastmod>2024-01-20</lastmod>
    
          <changefreq>monthly</changefreq>
    
          <priority>0.9</priority>
    
       </url>
     

      ${itemsMap}
    
    </urlset> `;
  return res.send(siteMap);
});
module.exports = router;
