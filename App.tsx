
import React, { useState, useCallback, useEffect } from 'react';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { ApiKeySetup } from './components/ApiKeySetup'; // New component
import { GeneratedContent, ImageData, DescriptionType, WEBSITE_TYPE, SocialMediaLanguageStyle, BANGLISH_STYLE } from './types';
import { generateContent as generateGeminiContent } from './services/geminiService';
import { CogIcon } from './components/icons'; // Icon for settings/change API key

const API_KEY_STORAGE_KEY = 'geminiApiKey';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [productName, setProductName] = useState<string>('');
  const [productDetails, setProductDetails] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [productSourceUrl, setProductSourceUrl] = useState<string>('');
  
  const [descriptionType, setDescriptionType] = useState<DescriptionType>(WEBSITE_TYPE);
  const [socialMediaLanguageStyle, setSocialMediaLanguageStyle] = useState<SocialMediaLanguageStyle>(BANGLISH_STYLE);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeySubmit = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem(API_KEY_STORAGE_KEY, newApiKey);
    setError(null); // Clear any previous errors like "API key needed"
  };

  const handleChangeApiKey = () => {
    setApiKey(null);
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setError(null); // Clear errors when going back to API key setup
    setGeneratedContent(null); // Clear previous results
  };

  const handleImageChange = useCallback((file: File | null) => {
    setSelectedImage(file);
    if (file) {
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImageBase64(base64String);
      };
      reader.onerror = () => {
        setError("Failed to read image file.");
        setImageBase64(null);
        setImageMimeType(null);
        setSelectedImage(null);
      }
      reader.readAsDataURL(file);
    } else {
      setImageBase64(null);
      setImageMimeType(null);
    }
  }, []);

  const isApiKeyError = (err: unknown): boolean => {
    if (err instanceof Error) {
      const lowerCaseMessage = err.message.toLowerCase();
      return lowerCaseMessage.includes("api key") || 
             lowerCaseMessage.includes("permission denied") ||
             lowerCaseMessage.includes("forbidden") ||
             (lowerCaseMessage.includes("http response") && (err.message.includes("400") || err.message.includes("401") || err.message.includes("403")));
    }
    return false;
  };

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      setError('API Key is not set. Please configure your API Key.');
      handleChangeApiKey(); // Redirect to API key setup
      return;
    }

    if (productSourceUrl.trim()) {
        // If URL is provided, other fields are optional, so proceed.
    } else if (!productName.trim() && !productDetails.trim() && !selectedImage) {
      setError('Please provide a Product Source URL, or Product Name, Details, or an Image to generate content.');
      return;
    } else if (!productName.trim() && !selectedImage) {
       if(!productDetails.trim()){ 
         setError('If no Product Source URL is given, please enter a product name or upload an image.');
         return;
       }
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    let imageInput: ImageData | undefined = undefined;
    if (imageBase64 && imageMimeType) {
      imageInput = { base64: imageBase64, mimeType: imageMimeType };
    }

    let caughtError: unknown = null; 

    try {
      const content = await generateGeminiContent(
        apiKey, // Pass the API key
        descriptionType, 
        productName, 
        productDetails, 
        imageInput,
        socialMediaLanguageStyle,
        productSourceUrl 
      );
      setGeneratedContent(content);
    } catch (err) {
      caughtError = err; // Assign error to the outer scope variable
      console.error(err);
      if (isApiKeyError(err)) {
        setError("Invalid API Key. Please update your API Key.");
        setIsLoading(false); 
        setTimeout(() => {
           handleChangeApiKey();
        }, 1500);
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred. Check console for details.');
      }
    } finally {
      // Ensure isLoading is false only if not an API key error that redirects
      if (!(caughtError && isApiKeyError(caughtError))) {
         setIsLoading(false);
      }
    }
  }, [apiKey, descriptionType, productName, productDetails, imageBase64, imageMimeType, socialMediaLanguageStyle, selectedImage, productSourceUrl]);

  if (!apiKey) {
    return <ApiKeySetup onApiKeySubmit={handleApiKeySubmit} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-200">
      <header className="bg-slate-800 shadow-lg sticky top-0 z-50 border-b border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <h1 className="text-3xl font-bold text-rose-500 font-poppins">
              FinesseGlow Content Spark ✨
            </h1>
            <button
              onClick={handleChangeApiKey}
              title="Change API Key"
              aria-label="Change API Key"
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-700 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-slate-800 flex items-center"
            >
              <CogIcon className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">API Key Settings</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">
          <InputPanel
            productName={productName}
            setProductName={setProductName}
            productDetails={productDetails}
            setProductDetails={setProductDetails}
            selectedImage={selectedImage}
            onImageChange={handleImageChange}
            productSourceUrl={productSourceUrl} 
            setProductSourceUrl={setProductSourceUrl} 
            onGenerate={handleGenerate}
            isLoading={isLoading}
            descriptionType={descriptionType}
            onDescriptionTypeChange={setDescriptionType}
            socialMediaLanguageStyle={socialMediaLanguageStyle}
            onSocialMediaLanguageStyleChange={setSocialMediaLanguageStyle}
          />
          <OutputPanel
            content={generatedContent}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
      <footer className="bg-slate-800 text-center py-6 shadow-top mt-auto border-t border-slate-700">
         <div className="text-sm text-slate-400">
           <p>&copy; {new Date().getFullYear()} <a href="https://finesseglow.com/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">Finesse Glow</a>. All rights reserved.</p>
           <p className="mt-1">Completely created by MD Jamshed Alam</p>
           <p className="mt-1">
             <a href="https://jamshed.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">Website</a> | {}
             <a href="https://github.com/Jamshed-Dev/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">GitHub</a> | {}
             <a href="https://www.linkedin.com/in/jamshed-dev/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">LinkedIn</a>
           </p>
         </div>
      </footer>
    </div>
  );
};

export default App;
