import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { env } from '../config/env.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let vectorStoreInstance = null;

// Helper function to get embeddings instance
const getEmbeddings = () => {
    return new GoogleGenerativeAIEmbeddings({
        apiKey: env.GEMINI_API_KEY,
        model: "gemini-embedding-001",
    });
};

// Helper function to get Qdrant config
const getQdrantConfig = () => {
    return {
        url: env.QDRANT_URL,
        apiKey: env.QDRANT_API_KEY,
        collectionName: "restaurento_policies",
    };
};

// Production Ready: Connects to existing collection without re-embedding text files
const getVectorStore = async () => {
    if (vectorStoreInstance) return vectorStoreInstance;

    try {
        vectorStoreInstance = await QdrantVectorStore.fromExistingCollection(
            getEmbeddings(),
            getQdrantConfig()
        );
        return vectorStoreInstance;
    } catch (error) {
        console.error("Failed to connect to existing Qdrant collection:", error);
        throw error;
    }
};

// Admin/Utility function logic moved to utils/seedPolicies.js

export const chatWithPolicyBot = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        // Fast connection, avoids file I/O and embedding generation on user request
        const vectorStore = await getVectorStore();

        const llm = new ChatGoogleGenerativeAI({
            apiKey: env.GEMINI_API_KEY,
            model: "gemini-2.5-flash",
            temperature: 0,
        });

        const retriever = vectorStore.asRetriever({ k: 3 });
        const relevantDocs = await retriever.invoke(message);
        const contextText = relevantDocs.map(doc => doc.pageContent).join("\n\n");

        const prompt = `You are Resto, a warm, friendly, and helpful AI support assistant for "Restaurento" — a premium restaurant booking platform. 🍽️

Your personality:
- Use a conversational, upbeat tone — like a friendly concierge, not a robot.
- Use emojis occasionally to make responses feel warm (but don't overdo it).
- Keep answers short and easy to understand. Avoid long walls of text.
- Always be empathetic. If someone is frustrated, acknowledge their feelings first.
- End responses with a helpful follow-up offer, like "Is there anything else I can help you with? 😊"

Your rules:
- Only answer questions about Restaurento policies, bookings, refunds, and platform rules.
- Use ONLY the context provided below. Do NOT make up information.
- If the answer is not in the context, say: "I'm not sure about that one! 🤔 For the best help, please reach out to our team at support@restaurento.com — they'll be happy to assist!"

Context:
${contextText}

User Question: ${message}

Answer:`;

        const response = await llm.invoke(prompt);

        return res.status(200).json({
            success: true,
            reply: response.content,
        });

    } catch (error) {
        console.error("Chatbot Error:", error);

        // Handle case where collection might not exist yet
        if (error.message && error.message.includes("Not Found")) {
            return res.status(503).json({
                success: false,
                message: "Chatbot knowledge base is not initialized. Please ask the admin to run the seed endpoint."
            });
        }

        return res.status(500).json({ success: false, message: "Failed to process chat request." });
    }
};
