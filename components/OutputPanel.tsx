
import React, { useCallback, useMemo } from 'react';
import { 
    GeneratedContent, 
    SeoContent, 
    SocialMediaPost, 
    DescriptionBlock, 
    WEBSITE_TYPE, 
    SOCIAL_TYPE 
} from '../types';
import { CopyIcon, DownloadIcon, CheckCircleIcon, HtmlIcon, SparklesIcon, TrendingUpIcon, QuillPenIcon } from './icons';

interface OutputPanelProps {
  content: GeneratedContent | null;
  isLoading: boolean;
  error: string | null;
}

const OutputSection: React.FC<{ title: string; children: React.ReactNode, actionButton?: React.ReactNode, className?: string }> = ({ title, children, actionButton, className = "" }) => (
  <div className={`mb-8 ${className}`}>
    <div className="flex justify-between items-center mb-3 border-b-2 border-slate-700 pb-2">
      <h3 className="text-xl font-semibold text-rose-500 font-poppins">{title}</h3>
      {actionButton}
    </div>
    {children}
  </div>
);

const ListItem: React.FC<{ children: React.ReactNode }> = ({children}) => (
  <li className="text-slate-300 mb-1.5 pl-3 border-l-2 border-rose-400 text-sm leading-relaxed">{children}</li>
);

const escapeHtml = (unsafe: string): string => {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

const generateHtmlForSeoDescription = (descriptionBlocks: DescriptionBlock[] | undefined): string => {
  if (!descriptionBlocks) return '';
  let html = '';
  descriptionBlocks.forEach(block => {
    if (block.type === 'heading') {
      const level = block.level || 2;
      html += `<h${level}>${escapeHtml(block.content)}</h${level}>\n`;
    } else if (block.type === 'paragraph') {
      const lines = block.content.split('\n');
      let currentParagraphContent = '';
      let inList = false;

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- ')) {
          if (currentParagraphContent) {
            html += `<p>${escapeHtml(currentParagraphContent.trim())}</p>\n`;
            currentParagraphContent = '';
          }
          if (!inList) {
            html += '<ul>\n';
            inList = true;
          }
          html += `  <li>${escapeHtml(trimmedLine.substring(2).trim())}</li>\n`;
        } else {
          if (inList) {
            html += '</ul>\n';
            inList = false;
          }
          if (trimmedLine) {
            currentParagraphContent += (currentParagraphContent ? ' ' : '') + trimmedLine;
          } else if (currentParagraphContent) {
            html += `<p>${escapeHtml(currentParagraphContent.trim())}</p>\n`;
            currentParagraphContent = '';
          }
        }
      });

      if (inList) {
        html += '</ul>\n';
      }
      if (currentParagraphContent) {
        html += `<p>${escapeHtml(currentParagraphContent.trim())}</p>\n`;
      }
    }
  });
  return html.trim();
};

const RenderStructuredContentBlock: React.FC<{ content: string }> = ({ content }) => {
  const elements: React.ReactNode[] = [];
  let currentParagraphLines: string[] = [];
  let currentListItems: string[] = [];

  const lines = content.split('\n');

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      elements.push(<p key={`p-${elements.length}`}>{currentParagraphLines.join(' ').trim()}</p>);
      currentParagraphLines = [];
    }
  };

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1">
          {currentListItems.map((item, idx) => (
            <li key={`li-${elements.length}-${idx}`}>{item}</li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('- ')) {
      flushParagraph(); 
      currentListItems.push(trimmedLine.substring(2).trim());
    } else {
      flushList(); 
      if (trimmedLine) {
        currentParagraphLines.push(trimmedLine);
      } else if (currentParagraphLines.length > 0) {
        flushParagraph();
      }
    }
  });

  flushParagraph(); 
  flushList(); 

  return <>{elements}</>;
};

const calculateSeoScore = (seoContent: SeoContent | null): number => {
  if (!seoContent || !seoContent.seoDescription) return 0;

  let score = 0;
  const MAX_SCORE = 100;

  if (seoContent.productTitle && seoContent.productTitle.length > 5) score += 10;

  let structureScore = 0;
  const { seoDescription } = seoContent;
  if (seoDescription.length > 0 && seoDescription[0].type === 'paragraph' && seoDescription[0].content.trim().length > 20) structureScore += 5;
  
  const checkSectionPresence = (headingText: string, points: number, minContentLength: number = 10): void => {
    const headingIndex = seoDescription.findIndex(block => block.type === 'heading' && block.content.includes(headingText));
    if (headingIndex !== -1 && headingIndex + 1 < seoDescription.length) {
      const nextBlock = seoDescription[headingIndex + 1];
      if (nextBlock.type === 'paragraph' && nextBlock.content.trim().length > minContentLength) {
        structureScore += points;
      }
    }
  };
  checkSectionPresence("Key Features", 4);
  checkSectionPresence("Benefits", 4);
  checkSectionPresence("How to Use", 4);
  checkSectionPresence("Suitable For", 4);
  checkSectionPresence("Origin", 4, 5);
  score += Math.min(structureScore, 25);

  if (seoContent.h1Headings && seoContent.h1Headings.length > 0) score += Math.min(seoContent.h1Headings.length * 2, 10);
  if (seoContent.broadMatchKeywords && seoContent.broadMatchKeywords.length > 0) score += Math.min(seoContent.broadMatchKeywords.length, 10);

  if (seoContent.metaTitle) {
    if (seoContent.metaTitle.length >= 40 && seoContent.metaTitle.length <= 65) score += 15;
    else if (seoContent.metaTitle.length > 0) score += 5;
  }
  if (seoContent.metaDescription) {
    if (seoContent.metaDescription.length >= 100 && seoContent.metaDescription.length <= 165) score += 15;
    else if (seoContent.metaDescription.length > 0) score += 5;
  }

  const mainDescriptionText = seoDescription.map(b => b.content).join(' ').toLowerCase() || '';
  const productNameParts = seoContent.productTitle?.toLowerCase().split(' ') || [];
  if (productNameParts.some(part => part.length > 3 && mainDescriptionText.includes(part))) score += 10;

  let bulletsScore = 0;
  ['Key Features', 'Benefits'].forEach(sectionName => {
    const headingIndex = seoDescription.findIndex(b => b.type === 'heading' && b.content.includes(sectionName));
    if (headingIndex !== -1 && headingIndex + 1 < seoDescription.length) {
      const nextBlock = seoDescription[headingIndex + 1];
      if (nextBlock.type === 'paragraph' && nextBlock.content.includes('\n- ')) bulletsScore += 2.5;
    }
  });
  score += bulletsScore;

  return Math.min(Math.round(score), MAX_SCORE);
};

const SeoStatusDisplay: React.FC<{ score: number }> = ({ score }) => {
  let statusLabel = "Needs Improvement", bgColor = "bg-red-700", textColor = "text-red-100";
  if (score >= 90) { statusLabel = "Excellent"; bgColor = "bg-green-700"; textColor = "text-green-100"; }
  else if (score >= 70) { statusLabel = "Good"; bgColor = "bg-lime-700"; textColor = "text-lime-100"; }
  else if (score >= 50) { statusLabel = "Fair"; bgColor = "bg-yellow-700"; textColor = "text-yellow-100"; }


  return (
    <div className="my-5 p-4 bg-slate-700 rounded-lg border border-slate-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <TrendingUpIcon className="w-7 h-7 text-rose-500 mr-3" />
          <h3 className="text-lg font-semibold text-slate-100 font-poppins">SEO Optimization Status</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor} shadow-sm`}>{statusLabel}</div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-3xl font-bold text-rose-500 font-poppins">{score}<span className="text-xl text-slate-400">/100</span></p>
      </div>
       <div className="w-full bg-slate-600 rounded-full h-2.5 mt-3">
        <div className={`${bgColor} h-2.5 rounded-full transition-all duration-500 ease-out`} style={{ width: `${score}%` }} role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`SEO Score: ${score} out of 100`}></div>
      </div>
    </div>
  );
};

const HumanToneGuidance: React.FC = () => (
  <div className="mb-5 mt-1 p-4 bg-sky-800 rounded-lg border border-sky-700">
    <div className="flex items-start">
      <QuillPenIcon className="w-7 h-7 text-sky-400 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="text-lg font-semibold text-slate-100 font-poppins mb-1">Human-Like Tone Guidance</h3>
        <p className="text-sm text-slate-300 leading-relaxed">Our AI is designed to generate text that aims for a natural and engaging tone. It's been instructed to vary sentence structures, use relatable language, and avoid robotic phrasing.</p>
        <p className="text-sm text-slate-300 leading-relaxed mt-1.5">✨ **Your Essential Touch:** AI provides a strong starting point. To truly make it your own and ensure it resonates as 100% human-written, always review, edit, and infuse the content with your unique brand voice, specific insights, or a personal touch. This final step is crucial for authenticity.</p>
      </div>
    </div>
  </div>
);

const ActionButton: React.FC<{onClick: () => void, title: string, ariaLabel: string, icon: React.ReactNode, copied?: boolean, copiedIcon?: React.ReactNode}> =
  ({onClick, title, ariaLabel, icon, copied, copiedIcon}) => (
  <button onClick={onClick} title={title} aria-label={ariaLabel} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-700 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-slate-800">
    {copied && copiedIcon ? copiedIcon : icon}
  </button>
);

export const OutputPanel: React.FC<OutputPanelProps> = ({ content, isLoading, error }) => {
  const [copiedStates, setCopiedStates] = React.useState<Record<string, boolean>>({});

  const seoScore = useMemo(() => {
    if (content && content.type === WEBSITE_TYPE) {
      return calculateSeoScore(content.data);
    }
    return 0;
  }, [content]);

  const handleCopyToClipboard = useCallback((text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates(prev => ({...prev, [id]: true}));
      setTimeout(() => setCopiedStates(prev => ({...prev, [id]: false})), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text. See console for details.');
    });
  }, []);

  const formatSeoContentForDownload = (data: SeoContent): string => {
    let text = `Product Title: ${data.productTitle}\n\n`;
    text += "SEO Description (Text):\n------------------------------------\n";
    data.seoDescription.forEach(block => text += block.type === 'heading' ? `\n## ${block.content}\n\n` : `${block.content}\n\n`);
    text += "\nSEO Description (HTML):\n------------------------------------\n";
    text += generateHtmlForSeoDescription(data.seoDescription);
    text += "\n------------------------------------\n\n";
    text += "\nSuggested H1 Headings:\n";
    data.h1Headings.forEach(h => text += `- ${h}\n`);
    text += "\nBroad Match Keywords:\n";
    data.broadMatchKeywords.forEach(k => text += `- ${k}\n`);
    text += `\nMeta Title: ${data.metaTitle}\n\nMeta Description: ${data.metaDescription}\n`;
    return text;
  };

  const formatSocialMediaPostForDownload = (data: SocialMediaPost): string => {
    let text = `${data.title}\n\n${data.intro}\n\n`;
    if (data.keyBenefitsSection) text += `${data.keyBenefitsSection}\n\n`;
    if (data.keyIngredientsSection) text += `${data.keyIngredientsSection}\n\n`;
    if (data.howToUseSection) text += `${data.howToUseSection}\n\n`;
    if (data.closingStatement) text += `${data.closingStatement}\n\n`;
    text += `${data.callToAction}\n\nHashtags:\n${data.hashtags.join(' ')}\n`;
    return text;
  };
  
  const handleDownload = useCallback(() => {
    if (!content) return;
    let textContent = "";
    let fileName = "generated_content.txt";

    if (content.type === WEBSITE_TYPE) {
      textContent = formatSeoContentForDownload(content.data);
      fileName = `${content.data.productTitle.replace(/\s+/g, '_')}_seo_content.txt`;
    } else if (content.type === SOCIAL_TYPE) {
      textContent = formatSocialMediaPostForDownload(content.data);
      fileName = `${content.data.title.substring(0,30).replace(/\s+/g, '_').replace(/[^\w.-]/g, '')}_social_post.txt`;
    }

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [content]);

  const renderSocialMediaContent = (socialPost: SocialMediaPost) => {
    const fullPostText = formatSocialMediaPostForDownload(socialPost);
    return (
      <div className="flex flex-col flex-grow h-full overflow-hidden text-slate-200">
        <div className="flex justify-between items-center mb-6 border-b-2 border-slate-700 pb-4 flex-shrink-0">
            <h2 className="text-2xl font-semibold text-slate-100 font-poppins">Social Media Post</h2>
        </div>

        <div className="overflow-y-auto flex-grow pr-3 space-y-4">
          <h1 
            className="text-2xl font-bold text-slate-50 mb-4 font-poppins whitespace-pre-wrap leading-tight break-words" 
            style={{ unicodeBidi: 'plaintext' }}
          >
            {socialPost.title}
          </h1>
          
          <div 
            className="space-y-3 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed break-words" 
            style={{ unicodeBidi: 'plaintext' }}
          >
            <p>{socialPost.intro}</p>
            {socialPost.keyBenefitsSection && <p>{socialPost.keyBenefitsSection}</p>}
            {socialPost.keyIngredientsSection && <p>{socialPost.keyIngredientsSection}</p>}
            {socialPost.howToUseSection && <p>{socialPost.howToUseSection}</p>}
            {socialPost.closingStatement && <p className="font-semibold">{socialPost.closingStatement}</p>}
            <p>{socialPost.callToAction}</p>
          </div>
          
          <OutputSection title="Hashtags" className="mt-6">
            <div className="flex flex-wrap gap-2">
              {socialPost.hashtags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2.5 py-1 bg-rose-800 text-rose-300 rounded-full text-xs font-medium break-words"
                >
                  {tag}
                </span>
              ))}
            </div>
          </OutputSection>
        </div>

        <div className="mt-auto pt-4 flex justify-end border-t border-slate-700 flex-shrink-0">
            <ActionButton
              onClick={() => handleCopyToClipboard(fullPostText, 'socialPost')}
              title="Copy full social media post text"
              ariaLabel="Copy full social media post text"
              icon={<CopyIcon className="w-5 h-5" />}
              copied={copiedStates['socialPost']}
              copiedIcon={<CheckCircleIcon className="w-5 h-5 text-green-400" />}
            />
            <ActionButton
                onClick={handleDownload}
                title="Download social media post"
                ariaLabel="Download social media post as a text file"
                icon={<DownloadIcon className="w-5 h-5" />}
            />
        </div>
      </div>
    );
  };

  const renderWebsiteSeoContent = (seoData: SeoContent) => {
    const fullDescriptionText = seoData.seoDescription.map(block => block.content).join('\n\n');
    return (
      <>
         <div className="flex justify-between items-center mb-6 border-b-2 border-slate-700 pb-4">
            <h2 className="text-2xl font-semibold text-slate-100 font-poppins">Your Result</h2>
            <div className="flex space-x-1.5">
            <ActionButton
                onClick={() => handleCopyToClipboard(fullDescriptionText, 'mainDescription')}
                title="Copy main description as plain text"
                ariaLabel="Copy main description as plain text"
                icon={<CopyIcon className="w-5 h-5" />}
                copied={copiedStates['mainDescription']}
                copiedIcon={<CheckCircleIcon className="w-5 h-5 text-green-400" />}
            />
            <ActionButton
                onClick={handleDownload}
                title="Download full content (text & HTML)"
                ariaLabel="Download full content as a text file including HTML version"
                icon={<DownloadIcon className="w-5 h-5" />}
            />
            </div>
        </div>
        <div className="overflow-y-auto flex-grow pr-3 space-y-4 text-slate-200">
            <h1 className="text-3xl font-bold text-slate-50 mb-5 font-poppins leading-tight">{seoData.productTitle}</h1>
            <OutputSection
            title="SEO Optimized Description"
            actionButton={
                <ActionButton
                onClick={() => handleCopyToClipboard(generateHtmlForSeoDescription(seoData.seoDescription), 'seoHtmlDescription')}
                title="Copy description as HTML"
                ariaLabel="Copy SEO description as HTML"
                icon={<HtmlIcon className="w-5 h-5" />}
                copied={copiedStates['seoHtmlDescription']}
                copiedIcon={<CheckCircleIcon className="w-5 h-5 text-green-400" />}
                />
            }
            >
            <div className="prose prose-invert prose-base sm:prose-lg prose-slate max-w-none prose-headings:font-poppins prose-headings:text-rose-500 prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-2 prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-1.5 prose-p:leading-relaxed prose-ul:pl-5 prose-li:marker:text-rose-500">
                {seoData.seoDescription.map((block: DescriptionBlock, index: number) => {
                if (block.type === 'heading') {
                    const Tag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
                    return <Tag key={index}>{block.content}</Tag>;
                }
                return <RenderStructuredContentBlock key={index} content={block.content} />;
                })}
            </div>
            </OutputSection>

            <OutputSection title="Suggested H1 Headings">
            <ul className="list-none space-y-1.5">{seoData.h1Headings.map((h, i) => <ListItem key={i}>{h}</ListItem>)}</ul>
            </OutputSection>
            <OutputSection title="Broad Match Keywords">
            <ul className="list-none space-y-1.5">{seoData.broadMatchKeywords.map((k, i) => <ListItem key={i}>{k}</ListItem>)}</ul>
            </OutputSection>
            <OutputSection title="Meta Title">
            <div className="flex items-start space-x-2">
                <p className="text-sm text-slate-200 bg-slate-700 p-3 rounded-lg flex-grow">{seoData.metaTitle}</p>
                <ActionButton onClick={() => handleCopyToClipboard(seoData.metaTitle, 'metaTitle')} title="Copy Meta Title" ariaLabel="Copy Meta Title" icon={<CopyIcon className="w-4 h-4"/>} copied={copiedStates['metaTitle']} copiedIcon={<CheckCircleIcon className="w-4 h-4 text-green-400"/>}/>
            </div>
            </OutputSection>
            <OutputSection title="Meta Description">
            <div className="flex items-start space-x-2">
                <p className="text-sm text-slate-200 bg-slate-700 p-3 rounded-lg flex-grow leading-relaxed">{seoData.metaDescription}</p>
                <ActionButton onClick={() => handleCopyToClipboard(seoData.metaDescription, 'metaDescription')} title="Copy Meta Description" ariaLabel="Copy Meta Description" icon={<CopyIcon className="w-4 h-4"/>} copied={copiedStates['metaDescription']} copiedIcon={<CheckCircleIcon className="w-4 h-4 text-green-400"/>}/>
            </div>
            </OutputSection>
            
            {seoData && <SeoStatusDisplay score={seoScore} />}
            {seoData && <HumanToneGuidance />}
        </div>
      </>
    );
  };

  if (isLoading) { 
    return (
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center h-full max-h-[calc(100vh-16rem)] text-slate-200">
        <svg className="animate-spin h-16 w-16 text-rose-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-200 text-xl font-poppins font-medium">Generating your K-Beauty content...</p>
        <p className="text-sm text-slate-400 mt-1">Please wait, magic is happening! ✨</p>
      </div>
    );
  }
  if (error) { 
    return (
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center h-full max-h-[calc(100vh-16rem)] text-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-2xl font-semibold text-red-400 mb-3 font-poppins">Oops! Something went wrong.</h3>
        <p className="text-red-300 bg-red-900/50 p-4 rounded-lg text-sm">{error}</p>
         <p className="mt-5 text-sm text-slate-400">Try adjusting your input or check your API key setup.</p>
      </div>
    );
  }
  if (!content) { 
    return (
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center h-full max-h-[calc(100vh-16rem)] text-slate-200">
        <SparklesIcon className="w-20 h-20 text-rose-600 mb-6 opacity-80" />
        <h3 className="text-2xl font-semibold text-slate-200 mb-2 font-poppins">Your Content Will Appear Here</h3>
        <p className="text-slate-400 mt-1 max-w-sm">Select content type, fill in product details, and click "Generate" to watch the K-Beauty magic unfold!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col h-full max-h-[calc(100vh-16rem)]">
      {content.type === WEBSITE_TYPE 
        ? renderWebsiteSeoContent(content.data as SeoContent) 
        : renderSocialMediaContent(content.data as SocialMediaPost)}
    </div>
  );
};
