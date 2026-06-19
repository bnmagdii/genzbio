import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));
  const PORT = 3000;

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // REST API Endpoints

  // 1. AI Bio Generator Endpoint
  app.post('/api/ai/generate-bio', async (req, res) => {
    const { name, profession, niche, interests, tone } = req.body;
    if (!name || !profession) {
      return res.status(400).json({ error: 'Name and Profession are required fields.' });
    }

    const prompt = `Generate a set of premium, Gen Z-styled profile biographies for a person named "${name}" who is a "${profession}". 
niche: "${niche || 'General'}"
interests: "${interests || 'General'}"
tone: "${tone || 'Creator'}"

Generate exactly five versions of the biography as defined below:
1. Short Bio: A punchy single-sentence bio (max 85 characters).
2. Medium Bio: A standard multi-sentence bio (1-2 sentences, max 160 characters).
3. Long Bio: A detailed aesthetic narrative bio (2-3 sentences, max 260 characters).
4. Emoji Version: A cool, visually striking bio constructed primarily out of aesthetic emojis and short buzzwords (e.g. 👾 | coding | ☕ etc).
5. SEO Version: A bio optimized with highly relevant tech or social niche keywords and aesthetic hashtags.

Style it with premium Gen-Z dialect where appropriate but remain cohesive. Ensure the response format is strictly JSON matching this structure:
{
  "shortBio": "...",
  "mediumBio": "...",
  "longBio": "...",
  "emojiVersion": "...",
  "seoVersion": "..."
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              shortBio: { type: Type.STRING },
              mediumBio: { type: Type.STRING },
              longBio: { type: Type.STRING },
              emojiVersion: { type: Type.STRING },
              seoVersion: { type: Type.STRING }
            },
            required: ['shortBio', 'mediumBio', 'longBio', 'emojiVersion', 'seoVersion']
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || '{}');
      res.json(data);
    } catch (error: any) {
      console.error('Bio generation error:', error);
      res.status(500).json({ error: error.message || 'AI Bio generation failed.' });
    }
  });

  // 2. AI Profile Image Generator Endpoint
  app.post('/api/ai/generate-image', async (req, res) => {
    const { gender, style, background, colors, accessories } = req.body;

    let imagePrompt = `A premium Gen-Z aesthetic ${style || 'Avatar'} profile picture portrait. `;
    if (gender) imagePrompt += `Gender representation: ${gender}. `;
    if (background) imagePrompt += `Background style: ${background}. `;
    if (colors) imagePrompt += `Color palette theme: ${colors} (neon accents and glow, dark premium styling). `;
    if (accessories) imagePrompt += `Accessories or details: ${accessories}. `;
    imagePrompt += `Style details: Visually styled as a high-density, clean-cut, modern vector digital illustration, highly polished, cool and professional graphics suitable for Notion, Discord, Linear, or Apple-style interfaces. Front facing portrait. Elegant glassmorphic background layer, smooth gradients, no technical metadata or text labels on screen, no credit borders. Return pristine graphic design.`;

    try {
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: imagePrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: '1:1'
          }
        }
      });

      let base64Image = null;
      const parts = imageResponse.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }

      if (!base64Image) {
        throw new Error('No image bytes were returned from the Gemini Image model.');
      }

      res.json({ base64: base64Image });
    } catch (error: any) {
      console.error('Image generation error:', error);
      res.status(500).json({ error: error.message || 'AI Image generation failed.' });
    }
  });

  // 3. AI Color Palette Generator Endpoint
  app.post('/api/ai/generate-palette', async (req, res) => {
    const { mood } = req.body;
    const prompt = `Create a cohesive, extremely aesthetic Gen-Z color palette based on mood/concept: "${mood || 'premium dark neon'}".
Return a JSON object containing:
- name: A cool Gen-Z style name for the palette (e.g. CyberGlow, PastelGoth, ToxicMint, VelvetVoid).
- colors: An array of exactly 5 premium hex color codes compatible with glassmorphism and modern visual styling.
- primary: The dominant aesthetic color selector.
- description: A brief, punchy modern description detailing the aesthetic styling.

JSON structure:
{
  "name": "...",
  "colors": ["#...", "#...", "#...", "#...", "#..."],
  "primary": "#...",
  "description": "..."
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              colors: { type: Type.ARRAY, items: { type: Type.STRING } },
              primary: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['name', 'colors', 'primary', 'description']
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || '{}');
      res.json(data);
    } catch (error: any) {
      console.error('Palette generation error:', error);
      res.status(500).json({ error: error.message || 'AI Palette generation failed.' });
    }
  });

  // 4. AI Username Generator Endpoint
  app.post('/api/ai/generate-username', async (req, res) => {
    const { name, niche, vibe } = req.body;
    const prompt = `Generate 8 aesthetic, trendy Gen-Z style handles/usernames for a person named "${name || 'User'}".
niche: "${niche || 'General'}"
vibe: "${vibe || 'Neon hacker / minimalist designer'}"

Incorporate elite Gen-Z prefix/suffix constructs like .zip, .raw, .iso, _void, 0x, core, pixel, cyber, phantom, exo, v1, retro, syn, etc. Avoid cheesy options. Ensure they sound highly professional yet extremely next-gen (Linear, Notion, Discord style).

Return exactly a JSON list of usernames matching this structure:
{
  "usernames": ["...", "...", "...", ...]
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              usernames: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['usernames']
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || '{}');
      res.json(data);
    } catch (error: any) {
      console.error('Username generation error:', error);
      res.status(500).json({ error: error.message || 'AI Username generation failed.' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully on port ${PORT}`);
  });
}

startServer();
