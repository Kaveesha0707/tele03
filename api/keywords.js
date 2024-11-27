const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();


const connectToDatabase = async () => {
  if (mongoose.connection.readyState) return; // Avoid reconnecting if already connected

  const MONGO_URI = process.env.MONGO_URI;

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Database connection failed");
  }
};

// Define Schema and Model with channelId
const keywordSchema = new mongoose.Schema({
  text: { type: String, required: true },
  alertCount: { type: Number, default: 0 },
  channelId: { type: String, required: true },  // Add the channelId field
});

const Keyword = mongoose.model('Keyword', keywordSchema);

// Use CORS middleware
const corsMiddleware = cors({
  origin: "*", // Allow all origins, or specify a particular origin (e.g., 'https://example.com')
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
});

module.exports = async (req, res) => {

  corsMiddleware(req, res, async () => {
    try {
      await connectToDatabase();

      // GET Request: Get all keywords, optionally filter by channelId
      if (req.method === 'GET') {
        const { channelId } = req.query;

        let keywords;
        if (channelId) {
          keywords = await Keyword.find({ channelId });  // Filter by channelId
        } else {
          keywords = await Keyword.find();  // Get all keywords if no channelId is provided
        }

        return res.status(200).json(keywords);
      }

      // POST Request: Add a new keyword with channelId
      if (req.method === 'POST') {
        const { text, channelId } = req.body;

        if (!text || !channelId) {
          return res.status(400).send('Both keyword text and channelId are required.');
        }

        const existingKeyword = await Keyword.findOne({ text, channelId });
        if (existingKeyword) {
          return res.status(400).send('Keyword already exists in this channel.');
        }

        const newKeyword = new Keyword({ text, channelId });
        await newKeyword.save();
        return res.status(201).json(newKeyword);
      }

      // DELETE Request: Delete a keyword by ID
      if (req.method === 'DELETE') {
        const { id } = req.query;

        if (!id) {
          return res.status(400).send('Keyword ID is required.');
        }

        const deletedKeyword = await Keyword.findByIdAndDelete(id);
        if (!deletedKeyword) {
          return res.status(404).send('Keyword not found.');
        }

        return res.status(204).send();
      }

      // If the method is not GET, POST, or DELETE, return Method Not Allowed
      res.setHeader('Allow', 'GET, POST, DELETE');
      return res.status(405).send('Method Not Allowed');
    } catch (err) {
      console.error('Unhandled server error:', err);
      return res.status(500).send('A server error has occurred. Please try again later.');
    }
  });
};