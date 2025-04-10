import React, { useState } from 'react';
import { Sparkles, FileText, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { generateGeminiContent } from './config/gemini';

interface ProductDetails {
  name: string;
  features: string;
  benefits: string;
  targetAudience: string;
}

function App() {
  const [productDetails, setProductDetails] = useState<ProductDetails>({
    name: '',
    features: '',
    benefits: '',
    targetAudience: '',
  });
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateDescription = async () => {
    try {
      setError(null);

      // Validate inputs
      if (!productDetails.name || !productDetails.features || 
          !productDetails.benefits || !productDetails.targetAudience) {
        throw new Error('Please fill in all fields');
      }

      setLoading(true);
      const { name, features, benefits, targetAudience } = productDetails;
      
      const prompt = `Write a compelling, SEO-friendly product description for the following product:
      
      Product Name: ${name}
      Key Features: ${features}
      Benefits: ${benefits}
      Target Audience: ${targetAudience}
      
      Make it engaging, persuasive, and optimized for conversion. Include emojis where appropriate.
      Format it with clear sections for features and benefits.
      End with a strong call to action.`;

      const description = await generateGeminiContent(prompt);
      
      if (!description) {
        throw new Error('No description was generated. Please try again.');
      }
      
      setGeneratedDescription(description);
    } catch (error) {
      console.error('Error generating description:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
      setGeneratedDescription('');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatDescription = (text: string) => {
    // Remove any extra spaces and normalize line endings
    const normalizedText = text.replace(/\r\n/g, '\n').trim();
    
    // Split by double newlines to separate sections
    const sections = normalizedText.split(/\n\n+/);
    
    return sections.map((section, index) => {
      // Remove Markdown bold syntax
      const cleanText = section.replace(/\*\*/g, '');
      
      // Check if section is a heading (# or ##)
      if (cleanText.trim().match(/^#+\s/)) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-800 mb-3 mt-4">
            {cleanText.replace(/^#+\s*/, '')}
          </h3>
        );
      }

      // Check if section contains emojis
      const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(cleanText);
      
      // Apply different styles based on content type
      const sectionClass = `mb-4 ${
        hasEmoji ? 'text-lg font-medium' : 'text-gray-600'
      }`;

      // Split into lines to handle line breaks within sections
      const lines = cleanText.split('\n');
      return (
        <div key={index} className={sectionClass}>
          {lines.map((line, lineIndex) => (
            <React.Fragment key={`${index}-${lineIndex}`}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      );
    });
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {renderError()}
        <div className="flex items-center justify-center gap-2 mb-8">
          <FileText className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">AI Product Description Writer</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={productDetails.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Ultra Comfort Pro Chair"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Features (comma-separated)
              </label>
              <textarea
                name="features"
                value={productDetails.features}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Ergonomic design, Memory foam padding, Adjustable height"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Benefits (comma-separated)
              </label>
              <textarea
                name="benefits"
                value={productDetails.benefits}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Reduces back pain, Improves posture, Increases productivity"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                name="targetAudience"
                value={productDetails.targetAudience}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., office professionals seeking comfort"
              />
            </div>

            <button
              onClick={generateDescription}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {loading ? 'Generating...' : 'Generate AI Description'}
            </button>
          </div>
        </div>

        {generatedDescription && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Generated Description</h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>
            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                {formatDescription(generatedDescription)}
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Generated by AI • {new Date().toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.share?.({
                      title: 'Product Description',
                      text: generatedDescription
                    }).catch(() => {})}
                    className="text-gray-500 hover:text-purple-600 transition-colors"
                  >
                    Share
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="text-gray-500 hover:text-purple-600 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;