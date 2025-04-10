'use client';

import { useState } from 'react';
import Image from 'next/image';

// Type definitions for the Jigsaw response
interface JigsawPerplexityResponse {
  success: boolean;
  query: string;
  ai_overview: string;
  is_safe: boolean;
  image_urls: string[];
  results: SearchResult[];
}

interface SearchResult {
  title: string;
  url: string;
  description: string;
  content: string | null;
  site_name: string;
  site_long_name: string;
  age?: string;
  language: string;
  is_safe: boolean;
  favicon?: string;
  thumbnail?: string;
  snippets: string[];
}

// Tab component
const TabButton = ({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode 
}) => (
  <button
    className={`px-4 py-3 font-medium text-sm rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'text-gray-300 hover:bg-gray-700'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default function PerplexityPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [result, setResult] = useState<JigsawPerplexityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'search' | 'images' | 'sources'>('search');
  const [searchState, setSearchState] = useState<'pre-search' | 'searching' | 'results'>('pre-search');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    setSearchState('searching');
    setLoading(true);
    setError(null);
    
    try {
      // Call our API with the search query
      const response = await fetch(`/api/perplexity?query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
      setSearchState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    handleSearch(new Event('submit') as any);
  };

  const handleNewSearch = () => {
    setSearchState('pre-search');
    setResult(null);
    setSearchQuery('');
  };

  // Render the search tab content
  const renderSearchTab = () => {
    if (!result) return null;

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-blue-400 mb-2">AI Overview</h2>
          <p className="text-gray-200">{result.ai_overview}</p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">Top Results</h2>
          {result.results.slice(0, 3).map((item, index) => (
            <div key={index} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-colors bg-gray-900">
              <div className="flex items-start gap-3">
                {item.favicon && (
                  <img 
                    src={item.favicon} 
                    alt={`${item.site_name} favicon`} 
                    className="w-5 h-5 mt-1"
                  />
                )}
                <div>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    {item.title}
                  </a>
                  <p className="text-gray-400 text-sm">{item.site_long_name}</p>
                  <div 
                    className="mt-2 text-sm text-gray-300"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the images tab content
  const renderImagesTab = () => {
    if (!result) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">Images related to "{result.query}"</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {result.image_urls.map((url, index) => (
            <div key={index} className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900 hover:border-blue-500 transition-colors">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <div className="relative h-40 w-full">
                  <img 
                    src={url} 
                    alt={`Search result image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the sources tab content
  const renderSourcesTab = () => {
    if (!result) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">Sources for "{result.query}"</h2>
        <div className="space-y-6">
          {result.results.map((item, index) => (
            <div key={index} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-colors bg-gray-900">
              <div className="flex items-start gap-3">
                {item.favicon && (
                  <img 
                    src={item.favicon} 
                    alt={`${item.site_name} favicon`} 
                    className="w-5 h-5 mt-1"
                  />
                )}
                <div className="flex-1">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    {item.title}
                  </a>
                  <p className="text-gray-400 text-sm">{item.site_long_name}</p>
                  <div 
                    className="mt-2 text-sm text-gray-300"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                  {item.snippets && item.snippets.length > 0 && (
                    <div className="mt-3 border-t border-gray-700 pt-3">
                      <p className="text-xs text-gray-400 mb-2">Excerpts from this source:</p>
                      <ul className="space-y-2">
                        {item.snippets.slice(0, 2).map((snippet, idx) => (
                          <li key={idx} className="text-sm text-gray-300">
                            "{snippet.length > 200 ? snippet.substring(0, 200) + '...' : snippet}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {item.thumbnail && (
                  <div className="hidden sm:block flex-shrink-0 ml-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                      <img 
                        src={item.thumbnail} 
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the pre-search state
  const renderPreSearchForm = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-full max-w-2xl text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">Perplexity Search</h1>
          <p className="text-gray-300 text-lg">
            Ask any question and get AI-powered search results using JigsawStack
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="w-full max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask a question..."
              className="w-full px-6 py-5 pr-14 text-lg bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              required
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Example questions: "What are the most visited places in Japan?", "How does a quantum computer work?"</p>
          </div>
        </form>
        
        <div className="mt-16 pt-8 border-t border-gray-800 w-full max-w-2xl">
          <p className="text-center text-sm text-gray-500">
            Powered by JigsawStack SDK &middot; Search engine + AI-powered results
          </p>
        </div>
      </div>
    );
  };

  // Render the searching loading state
  const renderSearchingState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-full max-w-2xl">
          <div className="flex items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Searching: "{searchQuery}"</h1>
          </div>
          
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mr-6"></div>
              <div>
                <p className="text-xl font-medium text-white">Searching with JigsawStack...</p>
                <p className="text-gray-400 mt-2">This may take up to 30 seconds.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={handleNewSearch}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              New Search
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        {searchState === 'pre-search' && renderPreSearchForm()}
        
        {searchState === 'searching' && renderSearchingState()}
        
        {searchState === 'results' && (
          <div className="py-6">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {result ? `"${result.query}"` : 'Search Results'}
                  </h1>
                  <p className="text-gray-400">
                    {result ? 'Search results powered by JigsawStack' : 'Loading search results...'}
                  </p>
                </div>
                <button
                  onClick={handleNewSearch}
                  className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors self-start"
                >
                  New Search
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-6 bg-red-900/30 border border-red-700 text-red-200 rounded-lg mb-6">
                <p><strong>Error:</strong> {error}</p>
                <div className="mt-4">
                  <button 
                    onClick={handleRetry}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Retrying...' : 'Retry Request'}
                  </button>
                </div>
              </div>
            )}
            
            {result && !loading && (
              <>
                <div className="flex space-x-2 mb-6 border-b border-gray-800 pb-2">
                  <TabButton 
                    active={activeTab === 'search'} 
                    onClick={() => setActiveTab('search')}
                  >
                    Search
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'images'} 
                    onClick={() => setActiveTab('images')}
                  >
                    Images ({result.image_urls.length})
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'sources'} 
                    onClick={() => setActiveTab('sources')}
                  >
                    Sources ({result.results.length})
                  </TabButton>
                </div>
                
                <div className="mt-6">
                  {activeTab === 'search' && renderSearchTab()}
                  {activeTab === 'images' && renderImagesTab()}
                  {activeTab === 'sources' && renderSourcesTab()}
                </div>
              </>
            )}
          </div>
        )}
        
        <footer className="mt-12 py-6 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>Powered by JigsawStack Web Search API</p>
        </footer>
      </div>
    </div>
  );
} 