import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});



/* 🔐 SAFE JSON CLEANER */
function extractJson(text) {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
}

/* ---------------- AI TEXT ---------------- */

export async function generateAdContent(ad) {
  const prompt = `
You are a JSON API.
Return ONLY valid JSON.
Do NOT use markdown, backticks, or explanations.

Create a catchy marketplace ad description and hashtags.

Category: ${ad.category}
Sub-category: ${ad.sub_category}
Title: ${ad.title}
Price: ${ad.price}

Return JSON in this exact format:
{
  "description": "string",
  "hashtags": ["#tag1", "#tag2"]
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  const raw = response.choices[0].message.content;
  const clean = extractJson(raw);

  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error("❌ AI JSON PARSE FAILED");
    console.error("RAW:", raw);
    throw err;
  }
}





export async function generatePromoImage(ad) {
  const prompt = `
Create a modern promotional banner for:
${ad.title} - Rs ${ad.price}
Category: ${ad.category}
`;

  const image = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024"
  });

  return image.data[0].url;
}
