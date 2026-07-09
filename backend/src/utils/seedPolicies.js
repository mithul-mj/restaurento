import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { env } from "../config/env.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedPolicies = async () => {
    try {
        const policyPath = path.join(__dirname, '../data/policies.txt');
        const hashPath = path.join(__dirname, '../data/policies.hash');

        if (!fs.existsSync(policyPath)) {
            console.log("policy file not found, skipping seeding");
            return;
        }

        const policyText = fs.readFileSync(policyPath, 'utf-8');

        // Generate a hash of the current policies.txt
        const currentHash = crypto.createHash('md5').update(policyText).digest('hex');

        let previousHash = null;
        if (fs.existsSync(hashPath)) {
            previousHash = fs.readFileSync(hashPath, 'utf-8');
        }

        const client = new QdrantClient({
            url: env.QDRANT_URL,
            apiKey: env.QDRANT_API_KEY
        });

        console.log("Connecting to Qdrant at:", env.QDRANT_URL);
        const collectionsResponse = await client.getCollections();
        console.log("Qdrant getCollections success!");
        const collectionExists = collectionsResponse.collections.some(
            (c) => c.name === "restaurento_policies"
        );

        // If collection exists AND the file hasn't changed, skip to save Gemini API costs
        if (collectionExists && currentHash === previousHash) {
            console.log("policies already seeded and unchanged. Skipping.");
            return;
        }

        // If we are here, it means the file changed OR collection doesn't exist
        console.log("Policy file updated or collection missing. Seeding/Overwriting Qdrant...");

        if (collectionExists) {
            // Drop the old collection to prevent duplicate/stale data
            await client.deleteCollection("restaurento_policies");
        }

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });

        const docs = await textSplitter.createDocuments([policyText]);

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: env.GEMINI_API_KEY,
            model: "gemini-embedding-001",
        });

        console.log("Starting embedding generation via Gemini...");
        await QdrantVectorStore.fromDocuments(
            docs,
            embeddings,
            {
                url: env.QDRANT_URL,
                apiKey: env.QDRANT_API_KEY,
                collectionName: "restaurento_policies",
            }
        );
        console.log("Embedding generation success!");

        // Save the new hash so we don't re-seed on the next restart
        fs.writeFileSync(hashPath, currentHash);

        console.log("Policies seeded and overwritten successfully!");
    } catch (error) {
        console.log("error occurred during seeding policies:", error.message);
    }
};
