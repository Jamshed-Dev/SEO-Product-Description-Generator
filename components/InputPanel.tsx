
import React, { useRef } from 'react';
import { SparklesIcon, UploadIcon, XCircleIcon, LinkIcon } from './icons';
import { DescriptionType, WEBSITE_TYPE, SOCIAL_TYPE, SocialMediaLanguageStyle, ENGLISH_STYLE, BANGLISH_STYLE, BENGALI_STYLE } from '../types';

interface InputPanelProps {
  productName: string;
  setProductName: (name: string) => void;
  productDetails: string;
  setProductDetails: (details: string) => void;
  selectedImage: File | null;
  onImageChange: (file: File | null) => void;
  productSourceUrl: string; 
  setProductSourceUrl: (url: string) => void; 
  onGenerate: () => void;
  isLoading: boolean;
  descriptionType: DescriptionType;
  onDescriptionTypeChange: (type: DescriptionType) => void;
  socialMediaLanguageStyle: SocialMediaLanguageStyle;
  onSocialMediaLanguageStyleChange: (style: SocialMediaLanguageStyle) => void;
}

const getDisplayFileNamePart = (name: string | undefined): string => {
  if (!name) return 'Image'; 

  const originalName = name;
  const preferredMaxLength = 25; 

  let detectedExtension = '';
  const extMatch = name.match(/\.([a-zA-Z0-9]+)$/);
  if (extMatch && extMatch[0]) {
    detectedExtension = extMatch[0];
  }
  
  const nameWithoutExtension = detectedExtension ? name.substring(0, name.length - detectedExtension.length) : name;

  const isProblematicBase64 = nameWithoutExtension.length > 40 && 
                              nameWithoutExtension.startsWith('ey') && 
                              /^[a-zA-Z0-9+/=]+$/.test(nameWithoutExtension);

  if (isProblematicBase64) {
    return "Product Image" + detectedExtension;
  }
  
  if (nameWithoutExtension.length > preferredMaxLength) {
    const charsToKeep = preferredMaxLength - 3; 
    return nameWithoutExtension.substring(0, Math.max(0, charsToKeep)) + "..." + detectedExtension;
  }
  
  return originalName; 
};


export const InputPanel: React.FC<InputPanelProps> = ({
  productName,
  setProductName,
  productDetails,
  setProductDetails,
  selectedImage,
  onImageChange,
  productSourceUrl, 
  setProductSourceUrl, 
  onGenerate,
  isLoading,
  descriptionType,
  onDescriptionTypeChange,
  socialMediaLanguageStyle,
  onSocialMediaLanguageStyleChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  const generateButtonText = descriptionType === WEBSITE_TYPE ? 'Generate SEO Description' : 'Generate Social Media Post';

  const productDetailsPlaceholder = () => {
    let basePlaceholder = "Key ingredients, benefits, texture, suitability, etc.";
    if (productSourceUrl.trim()) {
        basePlaceholder = "Optionally add specific details to emphasize or complement the URL content.";
    } else if (descriptionType === WEBSITE_TYPE) {
      basePlaceholder = "Key ingredients (e.g., Centella Asiatica Extract 77%), benefits (soothing, hydrating), texture (watery, lightweight), suitability (sensitive skin, acne-prone), etc.";
    } else { // SOCIAL_TYPE
      basePlaceholder = "Key selling points, main ingredients, desired tone (e.g., fun, informative), any specific promotions to mention, target audience for social media.";
    }

    if (descriptionType === SOCIAL_TYPE && !productSourceUrl.trim()) {
        if (socialMediaLanguageStyle === BENGALI_STYLE) {
            basePlaceholder += "\n(বাংলাতে তথ্য দিলে ভালো ফল পাওয়া যাবে।)";
        } else if (socialMediaLanguageStyle === BANGLISH_STYLE) {
            basePlaceholder += "\n(Mixing English & Bengali details can help the AI.)";
        }
    }
    return basePlaceholder;
  };
  
  const productNamePlaceholder = productSourceUrl.trim() 
    ? "Optional: Override or specify product name if URL is unclear."
    : "e.g., SKIN 1004 Madagascar Centella Tone Brightening Toner";

  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col space-y-6 h-full max-h-[calc(100vh-16rem)] overflow-y-auto text-slate-200">
      <h2 className="text-2xl font-semibold text-slate-100 border-b border-slate-700 pb-4 font-poppins">Product Source & Details</h2>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5 font-poppins">
          1. Content Type
        </label>
        <fieldset className="mt-1">
          <legend className="sr-only">Content type</legend>
          <div className="flex items-center space-x-4">
            {(
              [
                { id: WEBSITE_TYPE, title: 'Website SEO' },
                { id: SOCIAL_TYPE, title: 'Social Media' },
              ] as { id: DescriptionType; title: string }[]
            ).map((option) => (
              <div key={option.id} className="flex items-center">
                <input
                  id={option.id}
                  name="description-type"
                  type="radio"
                  checked={descriptionType === option.id}
                  onChange={() => onDescriptionTypeChange(option.id)}
                  className="h-4 w-4 text-rose-500 border-slate-500 focus:ring-rose-500 bg-slate-700 focus:ring-offset-slate-800"
                />
                <label htmlFor={option.id} className="ml-2 block text-sm text-slate-200">
                  {option.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {descriptionType === SOCIAL_TYPE && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 font-poppins">
            1b. Social Media Language Style
          </label>
          <fieldset className="mt-1">
            <legend className="sr-only">Social media language style</legend>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {(
                [
                  { id: ENGLISH_STYLE, title: 'English Only' },
                  { id: BANGLISH_STYLE, title: 'Bengali-English Mix' },
                  { id: BENGALI_STYLE, title: 'Bengali Only' },
                ] as { id: SocialMediaLanguageStyle; title: string }[]
              ).map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    id={option.id}
                    name="social-media-language-style"
                    type="radio"
                    checked={socialMediaLanguageStyle === option.id}
                    onChange={() => onSocialMediaLanguageStyleChange(option.id)}
                    className="h-4 w-4 text-rose-500 border-slate-500 focus:ring-rose-500 bg-slate-700 focus:ring-offset-slate-800"
                  />
                  <label htmlFor={option.id} className="ml-2 block text-sm text-slate-200">
                    {option.title}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      )}
      
      <div>
        <label htmlFor="productSourceUrl" className="block text-sm font-medium text-slate-300 mb-1.5 font-poppins">
          2. Product Source URL (Primary Input if Provided)
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
                type="url"
                id="productSourceUrl"
                value={productSourceUrl}
                onChange={(e) => setProductSourceUrl(e.target.value)}
                placeholder="https://example.com/product-page"
                className="w-full p-3.5 pl-10 border border-slate-600 bg-slate-700 text-slate-50 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out placeholder-slate-400"
                aria-label="Product Source URL"
            />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          If a URL is provided, the AI will attempt to extract product information from it. Name, details, and image below become supplementary.
          The AI's ability to access and interpret URLs varies.
        </p>
      </div>

      <div>
        <label htmlFor="productName" className="block text-sm font-medium text-slate-300 mb-1.5 font-poppins">
          3. Name of the Product {productSourceUrl.trim() ? <span className="text-xs text-slate-400">(Supplementary)</span> : ''}
        </label>
        <input
          type="text"
          id="productName"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder={productNamePlaceholder}
          className="w-full p-3.5 border border-slate-600 bg-slate-700 text-slate-50 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out placeholder-slate-400"
          aria-label="Product Name"
        />
      </div>

      <div className="flex-grow flex flex-col min-h-[200px]">
        <label htmlFor="productDetails" className="block text-sm font-medium text-slate-300 mb-1.5 font-poppins">
          4. Product Details {productSourceUrl.trim() ? <span className="text-xs text-slate-400">(Supplementary)</span> : ''}
        </label>
        <textarea
          id="productDetails"
          value={productDetails}
          onChange={(e) => setProductDetails(e.target.value)}
          placeholder={productDetailsPlaceholder()}
          rows={7} 
          className="w-full p-3.5 border border-slate-600 bg-slate-700 text-slate-50 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex-grow resize-none transition duration-150 ease-in-out placeholder-slate-400"
          aria-label="Product Details"
        />
         {!productSourceUrl.trim() && (<p className="mt-2 text-xs text-slate-400">
          The more specific your details, the richer the AI-generated content will be.
        </p>)}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5 font-poppins">
          5. Product Image {productSourceUrl.trim() ? <span className="text-xs text-slate-400">(Supplementary Context)</span> : '(Optional)'}
        </label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id="imageUpload"
          aria-label="Upload product image"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center p-3.5 border-2 border-dashed border-slate-600 rounded-lg hover:border-rose-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 ease-in-out text-slate-400 hover:text-rose-500 bg-slate-700 hover:bg-slate-600"
        >
          <UploadIcon className="w-5 h-5 mr-2.5" />
          {selectedImage ? 'Change Image' : 'Select Image'}
        </button>
        {selectedImage && (
          <div className="mt-4 p-3 border border-slate-700 rounded-lg bg-slate-700 relative group">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Product Preview"
              className="max-h-36 w-auto rounded-md mx-auto shadow-sm"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-slate-600 rounded-full p-1 text-slate-300 hover:text-red-400 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-150 opacity-70 group-hover:opacity-100"
              title="Remove image"
              aria-label="Remove selected image"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
            <p 
              className="text-xs text-slate-400 mt-2 text-center truncate" 
              title={selectedImage.name}
            >
              {getDisplayFileNamePart(selectedImage.name)} ({(selectedImage.size / 1024).toFixed(1)} KB)
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className={`w-full flex items-center justify-center p-4 text-lg bg-rose-600 text-white rounded-lg shadow-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 ease-in-out font-poppins font-medium ${
          isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'
        }`}
        aria-live="polite"
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <SparklesIcon className="w-6 h-6 mr-2.5" />
        )}
        {isLoading ? 'Generating...' : generateButtonText}
      </button>
    </div>
  );
};
