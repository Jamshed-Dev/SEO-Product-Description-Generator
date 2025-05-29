# FinesseGlow Content Spark ✨

**FinesseGlow Content Spark** is a web application designed to generate SEO-friendly product descriptions and engaging social media posts for Korean beauty products. It leverages the power of the Google Gemini API to create compelling content tailored to your needs.

## 🌟 Features

*   **Dual Content Generation**:
    *   **Website SEO Descriptions**: Creates detailed, structured, and SEO-optimized product descriptions including meta titles, meta descriptions, H1 suggestions, and broad match keywords.
    *   **Social Media Posts**: Generates captivating posts for social media platforms.
*   **Multiple Input Methods**:
    *   **Product Source URL**: Provide a URL to a product page, and the AI will attempt to extract information. This is the primary input method if provided.
    *   **Product Name**: Specify the name of the product.
    *   **Product Details**: Describe key features, ingredients, benefits, texture, suitability, etc.
    *   **Product Image**: Upload an image for visual context, which the AI can use to enhance the description.
*   **Language Customization (for Social Media)**:
    *   English Only
    *   Bengali-English Mix (Banglish)
    *   Bengali Only
*   **SEO Insights (for Website Content)**:
    *   **SEO Score**: Get an estimated SEO score (out of 100) for your generated website description.
    *   **Human-Tone Guidance**: Reminders to review and personalize AI-generated content.
*   **User-Friendly Interface**:
    *   Clean and intuitive design built with Tailwind CSS.
    *   Clear input fields and organized output display.
    *   Image preview and removal.
*   **Output Management**:
    *   Copy generated text (full description, HTML, meta tags, social posts) to clipboard.
    *   Download generated content as a `.txt` file.
*   **API Key Management**:
    *   Securely prompts for your Gemini API key on first use.
    *   Stores the API key in your browser's `localStorage` for convenience (not sent to any server except Google's).
    *   Allows changing or clearing the API key through settings.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript
*   **Styling**: Tailwind CSS (via CDN)
*   **AI**: Google Gemini API (`@google/genai`)
*   **Module Loading**: ES Modules with `importmap` (dependencies loaded from `esm.sh`)

## 🚀 Getting Started

### Prerequisites

1.  **Google Gemini API Key**: You need a valid API key from Google AI Studio.
    *   Visit [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key) to create and obtain your API key.
2.  **Modern Web Browser**: A browser that supports ES Modules and `importmap` (e.g., Chrome, Firefox, Edge, Safari - recent versions).

### Running the Application

1.  **Clone the repository (if applicable) or download the files.**
    ```bash
    # If you have git
    # git clone <repository-url>
    # cd <repository-directory>
    ```
2.  **Ensure all files are in the same directory structure as provided:**
    ```
    .
    ├── App.tsx
    ├── README.md
    ├── components/
    │   ├── ApiKeySetup.tsx
    │   ├── InputPanel.tsx
    │   ├── OutputPanel.tsx
    │   └── icons.tsx
    ├── index.html
    ├── index.tsx
    ├── metadata.json
    ├── services/
    │   └── geminiService.ts
    └── types.ts
    ```
3.  **Open `index.html` in your web browser.**
    *   No build step or local server is strictly necessary due to the use of CDN for Tailwind CSS and `esm.sh` for JavaScript modules. Simply double-click `index.html` or open it via your browser's "File > Open" menu.

### First-Time Setup

*   On launching the application for the first time, you will be prompted to enter your Google Gemini API key.
*   Paste your key into the input field and click "Save and Continue."
*   The key will be stored in your browser's `localStorage`.

## ⚙️ How to Use

1.  **Set API Key**: If not already set, provide your Gemini API key.
2.  **Select Content Type**:
    *   Choose "Website SEO" to generate a detailed product description.
    *   Choose "Social Media" to generate a social media post.
3.  **(If Social Media) Select Language Style**: Choose between English, Banglish, or Bengali.
4.  **Provide Product Information**:
    *   **Product Source URL (Recommended for best results if available)**: Paste the URL of the product page. The AI will try to fetch details from here.
    *   **Product Name**: Enter the product's name (can be supplementary if URL is provided).
    *   **Product Details**: Add specific information like ingredients, benefits, texture, target audience, etc. (can be supplementary if URL is provided).
    *   **Product Image**: Optionally upload an image for the AI to use as visual context.
5.  **Generate Content**: Click the "Generate" button.
6.  **Review Output**:
    *   The generated content will appear in the right-hand panel.
    *   For website content, review the SEO score and individual sections.
    *   For social media content, review the post structure and hashtags.
7.  **Use Content**:
    *   Use the copy buttons to copy specific parts of the content or the entire output.
    *   Use the download button to save the content as a text file.
8.  **Change API Key**: Click the "API Key Settings" (cog icon) in the header to change or clear your stored API key.

## 📁 File Structure Overview

```
.
├── App.tsx                 # Main application component, state management
├── README.md               # This file
├── components/             # React UI components
│   ├── ApiKeySetup.tsx     # Component for API key input
│   ├── InputPanel.tsx      # Component for user inputs
│   ├── OutputPanel.tsx     # Component for displaying generated content
│   └── icons.tsx           # SVG icons used in the app
├── index.html              # Main HTML entry point, loads Tailwind CSS and scripts
├── index.tsx               # React application entry point, mounts App
├── metadata.json           # Application metadata (name, description)
├── services/               # Services for external interactions
│   └── geminiService.ts    # Logic for interacting with the Google Gemini API
└── types.ts                # TypeScript type definitions for the application
```

## 📝 Notes

*   The application relies on the Gemini API's ability to access and interpret web pages if a URL is provided. The success of URL-based extraction can vary.
*   Always review and edit AI-generated content to ensure accuracy, brand voice alignment, and a human touch.
*   The API key is stored locally in your browser. Clearing your browser's local storage for this site will remove the key.

## 👨‍💻 Author

*   **MD Jamshed Alam**
    *   Website: [jamshed.dev](https://jamshed.dev/)
    *   GitHub: [@Jamshed-Dev](https://github.com/Jamshed-Dev/)
    *   LinkedIn: [in/jamshed-dev](https://www.linkedin.com/in/jamshed-dev/)

This application is a product of **Finesse Glow**.
&copy; {current_year} [Finesse Glow](https://finesseglow.com/). All rights reserved.
(Replace `{current_year}` with the actual current year if automating).
