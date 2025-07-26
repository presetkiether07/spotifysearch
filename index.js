const express = require("express");
const axios = require("axios");
const app = express();

// Replace these with your actual Spotify API keys
const client_id = "9c947484d1d74725a2ae7dfa1ead35b6";
const client_secret = "2ea2f43035574686a494dbb2ac243457";

async function getAccessToken() {
  const response = await axios.post("https://accounts.spotify.com/api/token", 
    new URLSearchParams({ grant_type: "client_credentials" }), {
    headers: {
      Authorization:
        "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data.access_token;
}

app.get("/api/spotify", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing ?q= parameter" });

  try {
    const token = await getAccessToken();
    const { data } = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const results = data.tracks.items.map((track) => ({
      title: track.name,
      trackUrl: track.external_urls.spotify,
      thumbnail: track.album.images[0]?.url || null,
      release_date: track.album.release_date,
      duration: `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`,
    }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch from Spotify API" });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("🟢 Spotify Search API is running.");
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
