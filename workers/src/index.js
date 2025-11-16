/**
 * Cloudflare Workers with R2 Storage
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const questions = [
    { id: 1, title: "Build a Responsive TODO App", level: "easy", category: "frontend", description: "Create a responsive TODO app with add/edit/delete and persistent storage.", tags: ["React", "CSS Grid", "LocalStorage"], likes: 230, posted: "2025-10-25" },
    { id: 2, title: "E-commerce Database Schema", level: "medium", category: "schema-design", description: "Design normalized SQL tables for users, orders, and products.", tags: ["SQL", "Normalization", "ER Diagram"], likes: 148, posted: "2025-10-22" },
    { id: 3, title: "NFT Marketplace Smart Contract", level: "hard", category: "web3", description: "Write a Solidity contract for minting and trading NFTs with royalty support.", tags: ["Solidity", "ERC721", "Hardhat"], likes: 312, posted: "2025-09-30" },
    { id: 4, title: "Portfolio Website with Animations", level: "easy", category: "frontend", description: "Build a modern portfolio website with smooth scroll and framer motion animations.", tags: ["React", "Framer Motion", "Tailwind"], likes: 275, posted: "2025-10-18" },
    { id: 5, title: "Ride-Sharing Schema Design", level: "medium", category: "schema-design", description: "Design a scalable database for a ride-sharing platform with trip logs and payments.", tags: ["PostgreSQL", "Joins", "Keys"], likes: 201, posted: "2025-09-10" },
    { id: 6, title: "Decentralized Voting Smart Contract", level: "hard", category: "web3", description: "Implement a Solidity voting contract ensuring only one vote per address.", tags: ["Blockchain", "Solidity", "Security"], likes: 187, posted: "2025-08-29" },
    { id: 7, title: "Chat UI using React Hooks", level: "easy", category: "frontend", description: "Design a simple real-time chat interface using React and basic WebSockets.", tags: ["React", "Hooks", "WebSocket"], likes: 112, posted: "2025-09-15" },
    { id: 8, title: "Social Media Schema", level: "medium", category: "schema-design", description: "Create SQL tables for posts, likes, comments, and users efficiently.", tags: ["SQL", "Design", "Indexes"], likes: 250, posted: "2025-09-08" },
    { id: 9, title: "Token Swap Smart Contract", level: "hard", category: "web3", description: "Develop a Solidity DEX smart contract for swapping ERC20 tokens securely.", tags: ["Web3", "Solidity", "DEX"], likes: 355, posted: "2025-07-12" },
    { id: 10, title: "Weather Dashboard UI", level: "easy", category: "frontend", description: "Create a weather dashboard fetching data from OpenWeather API.", tags: ["API", "React", "Axios"], likes: 159, posted: "2025-08-20" },
    { id: 11, title: "Inventory Management DB Schema", level: "medium", category: "schema-design", description: "Design a relational schema for managing product stock and suppliers.", tags: ["SQL", "Inventory", "Keys"], likes: 143, posted: "2025-09-02" },
    { id: 12, title: "DeFi Lending Protocol", level: "hard", category: "web3", description: "Design and implement a Solidity smart contract simulating lending and borrowing.", tags: ["SmartContract", "DeFi", "Security"], likes: 310, posted: "2025-08-01" },
    { id: 13, title: "Music Player App", level: "easy", category: "frontend", description: "Build a React music player with play/pause and playlist features.", tags: ["React", "Hooks", "Audio API"], likes: 189, posted: "2025-09-21" },
    { id: 14, title: "Online Learning Platform Schema", level: "medium", category: "schema-design", description: "Model courses, lessons, and student progress efficiently in SQL.", tags: ["SQL", "Schema", "Optimization"], likes: 220, posted: "2025-08-10" },
    { id: 15, title: "Crowdfunding Smart Contract", level: "hard", category: "web3", description: "Write a Solidity contract to manage project funding with milestone verification.", tags: ["Solidity", "Crowdfunding", "Events"], likes: 335, posted: "2025-07-05" },
    { id: 16, title: "Responsive Landing Page", level: "easy", category: "frontend", description: "Design a responsive landing page using TailwindCSS and grid layout.", tags: ["HTML", "Tailwind", "Flexbox"], likes: 190, posted: "2025-09-13" },
    { id: 17, title: "Banking System Schema Design", level: "medium", category: "schema-design", description: "Design a robust SQL schema for customer accounts, transactions, and logs.", tags: ["SQL", "Schema", "Transactions"], likes: 267, posted: "2025-08-26" },
    { id: 18, title: "DAO Governance Smart Contract", level: "hard", category: "web3", description: "Create a DAO contract where token holders can vote on proposals.", tags: ["Solidity", "DAO", "Governance"], likes: 402, posted: "2025-07-18" },
    { id: 19, title: "Quiz App with Leaderboard", level: "easy", category: "frontend", description: "Develop a quiz app with timer and live leaderboard using React.", tags: ["React", "Timer", "State"], likes: 298, posted: "2025-10-01" },
    { id: 20, title: "Hospital Management Schema", level: "medium", category: "schema-design", description: "Design a complete SQL database for hospital patients, staff, and billing.", tags: ["Database", "Schema", "SQL"], likes: 176, posted: "2025-09-11" }
];

export default {
    async fetch(request, env, ctx) {
        
        // Existing questions endpoint
        if(request.url.endsWith('/questions')) {
            return new Response(JSON.stringify(questions), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
            });
        }

        // R2 Presigned URL endpoint
        if(request.url.endsWith('/get-upload-url') && request.method === 'POST') {
            try {
                const reqBody = await request.json();
                const { fileName, fileType } = reqBody;

                // Validate input
                if (!fileName || !fileType) {
                    return new Response(JSON.stringify({ error: 'fileName and fileType are required' }), {
                        status: 400,
                        headers: { 
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                }

                // Generate unique file name
                const uniqueFileName = `${Date.now()}-${fileName}`;
                const key = `uploads/${uniqueFileName}`;

                // Generate presigned URL for R2 (valid for 5 minutes)
                const presignedUrl = await env.MY_BUCKET.createMultipartUpload(key);
                
                // Alternative: Use R2's HTTP API for presigned URLs
                const url = new URL(`https://${env.R2_PUBLIC_URL}/${key}`);
                
                return new Response(JSON.stringify({
                    uploadUrl: url.toString(),
                    fileKey: key,
                    publicUrl: `https://${env.R2_PUBLIC_URL}/${key}`,
                    message: "Upload file directly to this URL using PUT request"
                }), {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                });

            } catch (error) {
                return new Response(JSON.stringify({ 
                    error: 'Failed to generate upload URL',
                    details: error.message 
                }), {
                    status: 500,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

        // Direct R2 Upload endpoint
        if(request.url.endsWith('/upload-file') && request.method === 'POST') {
            try {
                const formData = await request.formData();
                const file = formData.get('file');
                
                if (!file) {
                    return new Response(JSON.stringify({ error: 'No file provided' }), {
                        status: 400,
                        headers: { 
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                }

                // Generate unique file name
                const uniqueFileName = `${Date.now()}-${file.name}`;
                const key = `uploads/${uniqueFileName}`;

                // Upload to R2
                await env.MY_BUCKET.put(key, file.stream(), {
                    httpMetadata: {
                        contentType: file.type,
                    },
                });

                return new Response(JSON.stringify({
                    message: "File uploaded successfully",
                    fileKey: key,
                    publicUrl: `https://${env.R2_PUBLIC_URL}/${key}`
                }), {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                });

            } catch (error) {
                return new Response(JSON.stringify({ 
                    error: 'Failed to upload file',
                    details: error.message 
                }), {
                    status: 500,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

        // Existing question upload endpoint
        if(request.url.endsWith('/upload') && request.method === 'POST') {
            const reqBody = await request.json();
            const prob = {
                id: questions.length + 1,
                title: reqBody.title,
                level: reqBody.level,
                category: reqBody.category,
                description: reqBody.description,
                tags: reqBody.tags,
                likes: 0,
                posted: new Date().toISOString().split('T')[0]
            };
            
            questions.push(prob);
            return new Response(JSON.stringify({
                message: "Question added successfully", 
                question: prob
            }), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
            });
        }

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            });
        }

        return new Response('Hello World From Code Judgify!');
    },
};