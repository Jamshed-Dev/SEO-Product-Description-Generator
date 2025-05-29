
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { 
    SeoContent, 
    DescriptionBlock, 
    ImageData, 
    DescriptionType, 
    GeneratedContent, 
    SocialMediaPost,
    SocialMediaLanguageStyle,
    WEBSITE_TYPE,
    SOCIAL_TYPE,
    BANGLISH_STYLE, 
    ENGLISH_STYLE,
    BENGALI_STYLE
} from '../types';

// API_KEY will be passed dynamically.
// const API_KEY = "AIzaSyBXvUT8xkJMQtlrWEeYppHkH53BOwnCJYg"; // Removed hardcoded key

// if (!API_KEY) {
//   throw new Error("API_KEY is not set. This is required to use the Gemini API.");
// }
// const ai = new GoogleGenAI({ apiKey: API_KEY }); // ai instance will be created within generateContent

const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

const generateWebsitePrompt = (productName: string, productDetails: string, imageInput?: ImageData, productSourceUrl?: string): string => {
  let primarySourceInstruction = "";
  let productNameInstruction = productName.trim() ? `"${productName}"` : "(Not explicitly provided by user)";
  let productDetailsInstruction = productDetails.trim() ? `"${productDetails}"` : "(Not explicitly provided by user)";

  if (productSourceUrl && (!productName.trim() || productName.trim().length < 5) && (!productDetails.trim() || productDetails.trim().length < 20)) {
    primarySourceInstruction = `
CRITICAL INSTRUCTION: The user has provided a Product Source URL ("${productSourceUrl}") and minimal or no other product details.
Your primary task is to:
1. Attempt to access and thoroughly analyze the content of this URL: "${productSourceUrl}".
2. From the URL's content, extract the full product name, brand, key features, benefits, usage instructions, suitable skin types/concerns, origin (if available), and any other relevant product information.
3. Use THIS EXTRACTED INFORMATION as the main source to generate all sections of the product description JSON.
4. If an image is also provided, use it as visual context to supplement or verify information from the URL.
5. If the Product Name field below is marked "(Not explicitly provided by user)", you MUST determine it from the URL.
6. If you CANNOT access the URL, or if the URL does not seem to contain product information, or if extraction is otherwise impossible, you MUST still generate a valid JSON structure. In such a case, clearly state in the introductory paragraph of the "seoDescription" that information could not be retrieved from the URL, and then try to generate generic but plausible K-Beauty content if an image is available, or placeholder content if no other information source exists. Acknowledge the limitation.
This URL-based extraction is paramount for this request.
`;
    productNameInstruction = `(Attempt to determine from URL: ${productSourceUrl}. If provided by user: "${productName}")`;
    productDetailsInstruction = `(Attempt to determine from URL: ${productSourceUrl}. If provided by user: "${productDetails}")`;
  } else if (productSourceUrl) {
    primarySourceInstruction = `A Product Source URL ("${productSourceUrl}") has been provided for additional context. If accessible, use its content to enrich and supplement the details provided below. If there's a conflict, prioritize explicitly provided details unless they are very sparse.`;
  }

  const imageContextInstruction = imageInput 
    ? "An image of the product/packaging is also provided. Use visual information from the image (like text on packaging, product appearance, branding) to supplement, verify, or (if other details are sparse and URL is primary) assist in extracting details."
    : "No product image provided.";

  return `
You are an expert SEO copywriter and K-Beauty enthusiast specializing in Korean beauty products.
Your goal is to generate a comprehensive, engaging, and SEO-optimized product description.
The output MUST be a valid JSON object. Do not include any text outside the JSON object, including markdown fences.

${primarySourceInstruction}

User Provided Inputs (interpret with context from CRITICAL INSTRUCTION above, if any):
Product Name: ${productNameInstruction}
Product Details: ${productDetailsInstruction}
${imageContextInstruction}

Based on ALL available information (prioritizing URL extraction if indicated, then explicit details, then image), generate the following JSON structure:
{
  "productTitle": "string (Full product name, potentially enhanced for SEO. If extracted from URL, ensure accuracy. e.g., 'Brand Name Product Name - Key Benefit')",
  "seoDescription": [
    { "type": "paragraph", "content": "string (Introductory paragraph: what the product is, main purpose, key benefits. If URL extraction failed, state it here.)" },
    { "type": "heading", "level": 2, "content": "Key Features" },
    {
      "type": "paragraph",
      "content": "string (Detail key features using bullet points formatted as '\\n- Feature Name: Description.'. Include aspects like main active ingredients (and their role), special formulation aspects (pH-balanced, fragrance-free, etc.). If extracted from URL, be specific.)"
    },
    { "type": "heading", "level": 2, "content": "Benefits" },
    {
      "type": "paragraph",
      "content": "string (List 3–5 clear benefits, using bullet points formatted as '\\n- Benefit statement.')"
    },
    { "type": "heading", "level": 2, "content": "How to Use" },
    {
      "type": "paragraph",
      "content": "string (Clear, step-by-step usage instructions.)"
    },
    { "type": "heading", "level": 2, "content": "Suitable For" },
    {
      "type": "paragraph",
      "content": "string (Specific skin types and concerns this product addresses.)"
    },
    { "type": "heading", "level": 2, "content": "Origin" },
    {
      "type": "paragraph",
      "content": "string (e.g., 'Made in Korea'. If not found, state 'Origin not specified' or omit heading & paragraph.)"
    }
  ],
  "h1Headings": ["string (suggested H1 headings, max 3-5, compelling, based on product name/key benefits)"],
  "broadMatchKeywords": ["string (relevant broad match SEO keywords, max 5-10)"],
  "metaTitle": "string (compelling meta title, 50-60 characters, product name + primary benefit)",
  "metaDescription": "string (concise meta description, 150-160 characters, summarize benefits, encourage clicks, include product name)"
}

General Guidelines:
- Ensure all content is enticing and highlights key benefits/ingredients accurately based on the primary information source.
- Adopt a friendly, informative, slightly playful K-Beauty tone.
- Vary sentence structure; avoid robotic phrasing. Aim for human-like copy.
- All string values in JSON must be properly escaped.
- "seoDescription" array must follow the specified sequence.
- Bullet points within paragraph content strings MUST use '\\n- ' prefix.
- If information for a section is unavailable even after attempting URL extraction, create sensible placeholders or state that. Do not leave critical fields like productTitle empty if it can be derived.
- If URL extraction fails and no other details are present, make it clear this is placeholder content.
`;
};

const generateSocialMediaPrompt = (
  productName: string, 
  productDetails: string, 
  languageStyle: SocialMediaLanguageStyle,
  imageInput?: ImageData,
  productSourceUrl?: string
): string => {
  let languageInstruction = "";
  const hashtagGuidance = "Hashtags should always be in English, relevant to K-Beauty and the product (e.g., #SkincareRoutine, #KBeautyFinds, #GlassSkinGoal).";

  if (languageStyle === ENGLISH_STYLE) {
    languageInstruction = "Generate the content strictly in English. All text fields (title, intro, sections, callToAction) must be in English. Use emojis extensively.";
  } else if (languageStyle === BENGALI_STYLE) {
    languageInstruction = "Generate the content strictly in Bengali (বাংলা). All text fields must be in Bengali. Use emojis extensively.";
  } else { // BANGLISH_STYLE
    languageInstruction = "Generate the content in a mix of Bengali and English (Banglish). Ensure a good balance. Use emojis extensively.";
  }
  
  let primarySourceInstruction = "";
  let productNameInstruction = productName.trim() ? `"${productName}"` : "(Not explicitly provided by user)";
  let productDetailsInstruction = productDetails.trim() ? `"${productDetails}"` : "(Not explicitly provided by user)";

  if (productSourceUrl && (!productName.trim() || productName.trim().length < 5) && (!productDetails.trim() || productDetails.trim().length < 20)) {
    primarySourceInstruction = `
CRITICAL INSTRUCTION: The user has provided a Product Source URL ("${productSourceUrl}") and minimal or no other product details.
Your primary task is to:
1. Attempt to access and thoroughly analyze the content of this URL: "${productSourceUrl}".
2. From the URL's content, extract the full product name, brand, key selling points, and any visually appealing aspects or benefits suitable for a social media post.
3. Use THIS EXTRACTED INFORMATION as the main source to generate all sections of the social media post JSON.
4. If an image is also provided, use it as visual context to make the post more engaging and to supplement info from the URL.
5. If the Product Name field below is marked "(Not explicitly provided by user)", you MUST determine it from the URL for the post's title.
6. If you CANNOT access the URL, or if the URL does not seem to contain product information, or if extraction is otherwise impossible, you MUST still generate a valid JSON structure. In such a case, clearly state in the "intro" that information could not be retrieved from the URL, then try to create a generic but engaging K-Beauty post if an image is available, or a placeholder post if no other info exists. Acknowledge the limitation.
This URL-based extraction is paramount for this request.
`;
    productNameInstruction = `(Attempt to determine from URL: ${productSourceUrl}. If provided by user: "${productName}")`;
    productDetailsInstruction = `(Attempt to determine from URL: ${productSourceUrl}. If provided by user: "${productDetails}")`;
  } else if (productSourceUrl) {
    primarySourceInstruction = `A Product Source URL ("${productSourceUrl}") has been provided for additional context. If accessible, use its content to find engaging points and details to enrich the post based on the explicit details provided below.`;
  }

  const imageContextInstruction = imageInput 
    ? "An image of the product is also provided. Use its visual cues (packaging, texture if visible, overall vibe) to enhance the post's appeal and assist in deriving information if other sources are sparse."
    : "No product image provided.";

return `
You are a creative social media manager for "Finesse Glow", skilled at crafting captivating K-Beauty posts.
The output MUST be a valid JSON object. Do not include any text outside the JSON object (no markdown fences).

${primarySourceInstruction}

User Provided Inputs (interpret with context from CRITICAL INSTRUCTION above, if any):
Product Name: ${productNameInstruction}
Product Details: ${productDetailsInstruction}
Selected Language Style: "${languageStyle}" (${languageInstruction})
${imageContextInstruction}

Key Requirements:
1. Shop Name: Naturally integrate "Finesse Glow" (e.g., in intro or closing).
2. Website: 'callToAction' MUST include "https://finesseglow.com/".
3. Hashtags: ALL hashtags MUST be in ENGLISH.

Follow this JSON structure:
{
  "title": "string (Product name with relevant emojis. Language per Selected Language Style. If from URL, ensure accuracy. If URL extraction failed and no name given, create a generic K-beauty title.)",
  "intro": "string (Engaging intro, 2-3 lines, mention 'Finesse Glow'. Language per Selected Language Style. If URL extraction failed, state it here.)",
  "keyBenefitsSection": "string (Optional. '💎 Key Benefits' heading + bullet points '✔️ Benefit 1...'. Language per style.)",
  "keyIngredientsSection": "string (Optional. '🌿 Key Ingredients' heading + '🌱 Ingredient 1...'. Language per style.)",
  "howToUseSection": "string (Optional. '📌 How to Use' heading + numbered steps. Language per style.)",
  "closingStatement": "string (Optional. Catchy closing, mention 'Finesse Glow'. Language per style.)",
  "callToAction": "string (Call to action, MUST include 'https://finesseglow.com/'. Language per style.)",
  "hashtags": ["string (Array of 5-10 ENGLISH hashtags. ${hashtagGuidance})"]
}

Adapt content, sections, emojis, and hashtags based on the primary information source (URL if prioritized, otherwise explicit details/image) and "Selected Language Style".
Strictly follow requirements for "Finesse Glow", "https://finesseglow.com/", and English-only hashtags.
Omit optional sections (empty string or no key) if not supported by available info.
Ensure valid JSON (escape newlines with \\n etc.). Tone: upbeat, friendly, persuasive.
If URL extraction fails and no other details are present, make it clear this is placeholder content.
`;
};


export const generateContent = async (
  apiKey: string, // API key is now the first parameter
  descriptionType: DescriptionType,
  productName: string,
  productDetails: string,
  imageInput?: ImageData,
  socialMediaLanguageStyle: SocialMediaLanguageStyle = BANGLISH_STYLE,
  productSourceUrl?: string 
): Promise<GeneratedContent> => {

  if (!apiKey) {
    throw new Error("API Key is missing. Please configure the API Key.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const textPrompt = descriptionType === WEBSITE_TYPE 
    ? generateWebsitePrompt(productName, productDetails, imageInput, productSourceUrl)
    : generateSocialMediaPrompt(productName, productDetails, socialMediaLanguageStyle, imageInput, productSourceUrl);

  const requestParts: Part[] = [{ text: textPrompt }];

  if (imageInput) {
    requestParts.push({
      inlineData: {
        mimeType: imageInput.mimeType,
        data: imageInput.base64,
      },
    });
  }

  const contents = (imageInput || productSourceUrl) ? { parts: requestParts } : textPrompt;

  let jsonStr = ""; 

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: contents, 
        config: {
            responseMimeType: "application/json",
            temperature: 0.75, 
            topP: 0.95,
            topK: 40,
        }
    });

    jsonStr = response.text.trim(); 

    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    if (descriptionType === WEBSITE_TYPE) {
      const parsedData = JSON.parse(jsonStr) as SeoContent;
      if (!parsedData.productTitle && !(productSourceUrl && (!productName && !productDetails))) { 
          console.warn("productTitle is missing or empty in SeoContent. URL was primary source:", !!productSourceUrl);
      }
      if (!Array.isArray(parsedData.seoDescription) || parsedData.seoDescription.length === 0) {
          console.warn("seoDescription is missing or empty in SeoContent. URL was primary source:", !!productSourceUrl);
          if (!productSourceUrl) throw new Error("Received incomplete SeoContent: seoDescription is missing/empty.");
          parsedData.seoDescription = parsedData.seoDescription || [{type: 'paragraph', content: 'Product description could not be generated from the provided information.'}];
      }
       parsedData.seoDescription.forEach((block: DescriptionBlock, index: number) => {
          if (!block.type || typeof block.content !== 'string') {
              if (productSourceUrl && block.content && block.content.includes("could not be retrieved")) return;
              throw new Error(`Invalid block in SEO description (index ${index}): type or content is missing/invalid.`);
          }
      });
      return { type: WEBSITE_TYPE, data: parsedData };
    } else { // SOCIAL_TYPE
      const parsedData = JSON.parse(jsonStr) as SocialMediaPost;
      if (!parsedData.title && !(productSourceUrl && (!productName && !productDetails))) {
         console.warn("title is missing or empty in SocialMediaPost. URL was primary source:", !!productSourceUrl);
      }
      if (!parsedData.intro) {
         console.warn("intro is missing in SocialMediaPost. URL was primary source:", !!productSourceUrl);
         if (!productSourceUrl) throw new Error("Received incomplete SocialMediaPost: intro is missing.");
         parsedData.intro = parsedData.intro || "Content could not be generated from the provided information.";
      }
      if (!parsedData.callToAction || !Array.isArray(parsedData.hashtags)) {
        console.error("Malformed JSON structure for SocialMediaPost:", parsedData);
        throw new Error("Received incomplete or malformed JSON structure for SocialMediaPost from API (callToAction or hashtags).");
      }
      return { type: SOCIAL_TYPE, data: parsedData };
    }

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    let errorMessage = "An unknown error occurred while generating content.";
    if (error instanceof SyntaxError) {
      errorMessage = `Failed to parse JSON response from API: ${error.message}. The API might have returned an invalid JSON. This can happen if the AI struggles with the provided URL.`;
      console.error("Problematic JSON string that failed to parse for type " + descriptionType + ":", jsonStr);
    } else if (error instanceof Error) {
        // Check for specific API key error messages
        if (error.message.toLowerCase().includes("api key") || 
            error.message.toLowerCase().includes("permission denied") ||
            error.message.toLowerCase().includes("forbidden") ||
            (error.message.toLowerCase().includes("http response") && (error.message.includes("400") || error.message.includes("401") || error.message.includes("403")))
           ) {
             errorMessage = `API Key Error: ${error.message}. Please check your API key and its permissions.`;
        } else if (error.message.includes("Malformed JSON") || error.message.includes("incomplete or malformed JSON")) {
            errorMessage = error.message; 
        } else {
             errorMessage = `Failed to generate content: ${error.message}. If using a URL, it might be inaccessible or difficult for the AI to process.`;
        }
    }
    throw new Error(errorMessage);
  }
};
