import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import mongoose from "mongoose";

dotenv.config();

console.log("Starting server initialization...");
console.log("MongoDB URI:", process.env.MONGODB_URI?.split("@")[0] + "***@***"); // Log without credentials

let chatsCollection = null;

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log("✓ MongoDB Connected Successfully");
  // Initialize the collection after connection
  const db = mongoose.connection.db;
  if (db) {
    chatsCollection = db.collection("chats");
    console.log("✓ Chats collection initialized");
  }
})
.catch((err) => {
  console.error("✗ MongoDB Connection Error:");
  console.error("  Code:", err.code);
  console.error("  Message:", err.message);
  console.error("\nTroubleshooting:");
  console.error("1. Check if your IP address is whitelisted in MongoDB Atlas");
  console.error("2. Verify MongoDB connection string in .env file");
  console.error("3. Ensure you have internet connectivity");
  console.error("4. Try accessing MongoDB Atlas website to check cluster status");
});



const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/chat", async (req, res) => {

  try {

    const userMessage = req.body.message;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      reply: response.data.choices[0].message.content,
    });

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: "Something went wrong",
    });

  }

});

app.post("/analyze-image", upload.single("image"), async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        error: "No image uploaded",
      });

    }

    const message = req.body.message || "Analyze this image";

    const base64Image = req.file.buffer.toString("base64");

    const response = await axios.post(

      "https://api.groq.com/openai/v1/chat/completions",

      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",

        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: message,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${req.file.mimetype};base64,${base64Image}`,
                },
              },
            ],
          },
        ],

        max_tokens: 500,
      },

      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }

    );

    res.json({
      reply: response.data.choices[0].message.content,
    });

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: "Image analysis failed",
    });

  }

});

app.get("/history", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!chatsCollection) {
      return res.json({ history: [] });
    }

    const history = await chatsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    res.json({ history });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to load history" });
  }
});

app.post("/history", async (req, res) => {
  try {
    const { userId, title, type, content } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: "userId and title are required" });
    }

    const chatEntry = {
      userId,
      title,
      type: type || "text",
      content,
      createdAt: new Date(),
    };

    if (chatsCollection) {
      await chatsCollection.insertOne(chatEntry);
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to save history" });
  }
});

app.post("/search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const serpApiKey = process.env.SERP_API_KEY;

    if (!serpApiKey) {
      return res.status(500).json({ error: "SerpAPI key is not configured" });
    }

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        q: query,
        engine: "google",
        api_key: serpApiKey,
        num: 5,
      },
    });

    const results = (response.data.organic_results || []).slice(0, 5).map((item) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
    }));

    const answer = results.length
      ? `Top live search results for "${query}":\n\n${results
          .map(
            (result, index) =>
              `${index + 1}. ${result.title}\n${result.snippet}\n${result.link}`
          )
          .join("\n\n")}`
      : `No live results found for "${query}."`;

    res.json({ answer, results });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});