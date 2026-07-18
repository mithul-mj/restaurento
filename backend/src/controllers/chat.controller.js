import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { env } from '../config/env.config.js';
import MiniSearch from 'minisearch';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let vectorStoreInstance = null;
let miniSearchInstance = null

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


const getMiniSearch = async () => {
    if (miniSearchInstance) return miniSearchInstance

    const policyPath = path.join(__dirname, '../data/policies.txt');
    const policyText = fs.readFileSync(policyPath, 'utf-8');

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50
    })
    const docs = await textSplitter.createDocuments([policyText])

    miniSearchInstance = new MiniSearch({
        fields: ['text'],
        storeFields: ['text'],
    })
    const indexDocs = docs.map((doc, index) => ({
        id: index,
        text: doc.pageContent
    }))
    miniSearchInstance.addAll(indexDocs);
    return miniSearchInstance
}



const hybridSearch = async (query, k = 3) => {
    const vectorStore = await getVectorStore()
    const minisearch = await getMiniSearch()

    const retriever = vectorStore.asRetriever({ k: k * 2 })
    const vectorResults = await retriever.invoke(query)

    const keywordResults = minisearch.search(query, { prefix: true }).slice(0, k * 2);
    const documentScores = new Map();
    vectorResults.forEach((doc, rank) => {
        const score = 1 / (rank + 60) // 60 is the standard RRF constant
        documentScores.set(doc.pageContent, score)
    })
    keywordResults.forEach((res, rank) => {
        const currentScore = documentScores.get(res.text) || 0;
        const score = 1 / (rank + 60);
        documentScores.set(res.text, currentScore + score)
    })
    const sortedDocs = Array.from(documentScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, k)
        .map(([content]) => content)
    return sortedDocs
}

// Admin/Utility function logic moved to utils/seedPolicies.js

export const chatWithPolicyBot = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const llm = new ChatGoogleGenerativeAI({
            apiKey: env.GEMINI_API_KEY,
            model: "gemini-2.5-flash",
            temperature: 0,
        });

        // Use our new Hybrid Search
        const relevantTexts = await hybridSearch(message, 3);
        const contextText = relevantTexts.join("\n\n");

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
- NEVER use Markdown formatting. Do NOT use asterisks (*) for bold text or bullet points. Use standard plain text, spacing, and emojis (like 🔹 or 📍) for bullet points.
- If the answer is not in the context, say: "I'm not sure about that one! 🤔 For the best help, please reach out to our team at support@restaurento.com — they'll be happy to assist!"

Context:
${contextText}

User Question: ${message}

Answer:`;

        const response = await llm.invoke(prompt);

        // Strip any stubborn markdown asterisks (bolding/bullets) the LLM might have ignored the prompt about
        const cleanReply = response.content.replace(/\*/g, '');

        return res.status(200).json({
            success: true,
            reply: cleanReply,
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
