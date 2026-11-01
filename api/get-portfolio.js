export default async function handler(req, res) {
  // 1. 取得並防呆處理前端的 Origin 來源
  const rawOrigin = req.headers.origin || "";
  const origin = rawOrigin.toLowerCase().replace(/\/$/, "");

  // 2. 設定你允許的真實 GitHub Pages 網址（請確認跟你真實網址一致，不可加尾巴斜線）
  const allowedOrigin = "https://akira9478.github.io/"; // 👈 請換成你的 GitHub Pages 網址

  // 3. 跨域安全檢查與回應標頭設定
  if (origin === allowedOrigin || process.env.NODE_ENV === "development") {
    // 允許跨來源存取，並明確告知瀏覽器允許帶上哪些標頭與方法
    res.setHeader("Access-Control-Allow-Origin", rawOrigin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  } else {
    console.log(`[拒絕存取] 收到未授權的 Origin: "${rawOrigin}"`);
    return res.status(403).json({ error: "Access Denied: Unapproved Origin" });
  }

  // 4. 🔥 關鍵：優先處理瀏覽器的 OPTIONS 預檢請求
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 5. 確保只處理 GET 請求
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const GAS_URL = process.env.GOOGLE_SCRIPT_URL;
    if (!GAS_URL) {
      return res.status(500).json({ error: "環境變數未設定" });
    }

    const response = await fetch(GAS_URL);
    const apiData = await response.json();

    return res.status(200).json(apiData);
  } catch (error) {
    return res.status(500).json({ error: "伺服器錯誤", details: error.message });
  }
}
