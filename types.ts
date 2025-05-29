
export interface DescriptionBlock {
  type: 'paragraph' | 'heading';
  content: string;
  level?: 2 | 3 | 4 | 5 | 6; // Optional heading level, default to <h2>
}

export interface SeoContent {
  productTitle: string;
  seoDescription: DescriptionBlock[];
  h1Headings: string[];
  broadMatchKeywords: string[];
  metaTitle: string;
  metaDescription: string;
}

export interface SocialMediaPost {
  title: string; // e.g., "🧖‍♀️ 3W Clinic Snail Foam Cleansing 100ml 🧖‍♀️"
  intro: string; // e.g., "✨ Deep Cleanse & Hydrate Your Skin! ✨\n3W Clinic Snail Foam Cleansing আপনার ত্বককে..."
  keyBenefitsSection?: string; // Formatted string with "💎 Key Benefits\n✔️ Benefit 1..."
  keyIngredientsSection?: string; // Formatted string (if applicable)
  howToUseSection?: string;    // Formatted string "📌 How to Use\n1. Step 1..."
  closingStatement?: string; // e.g., "🌟 3W Clinic Snail Foam Cleansing – ত্বককে মসৃণ ও গ্লো প্রদান করুন! 🌟"
  callToAction: string; // e.g., "🛍️ অর্ডার করতে DM করুন অথবা ভিজিট করুন finesseglow.com"
  hashtags: string[]; // e.g., ["#3WClinic", "#SnailFoamCleansing", ...]
}

export interface ImageData {
  base64: string;
  mimeType: string;
}

export type DescriptionType = 'website' | 'social';
export type SocialMediaLanguageStyle = 'english' | 'banglish' | 'bengali';

export const WEBSITE_TYPE = 'website' as const;
export const SOCIAL_TYPE = 'social' as const;

export const ENGLISH_STYLE = 'english' as const;
export const BANGLISH_STYLE = 'banglish' as const;
export const BENGALI_STYLE = 'bengali' as const;

export interface TypedContent<T extends DescriptionType, D> {
  type: T;
  data: D;
}

export type GeneratedSeoContent = TypedContent<typeof WEBSITE_TYPE, SeoContent>;
export type GeneratedSocialMediaPost = TypedContent<typeof SOCIAL_TYPE, SocialMediaPost>; // languageStyle could be added here if needed in output

export type GeneratedContent = GeneratedSeoContent | GeneratedSocialMediaPost;

// Removed NodeJS.ProcessEnv declaration as API_KEY is no longer from environment variables.
// declare global {
//   namespace NodeJS {
//     interface ProcessEnv {
//       API_KEY: string;
//     }
//   }
// }
