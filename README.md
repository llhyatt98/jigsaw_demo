# JigsawStack SDK Demo with Perplexity AI Clone

This project demonstrates the integration of [JigsawStack SDK](https://jigsawstack.com/) with Next.js, featuring a Perplexity-like search interface for web search, image results, and source browsing.

## About JigsawStack SDK

JigsawStack is a powerful SDK that provides web scraping, AI-powered search, and other capabilities. This demo showcases:

- Web search functionality with AI-enhanced results
- Image search capabilities
- Source extraction and citation from search results
- AI-generated overviews of search topics

## Features

- **Perplexity-style Search Interface**: A clean, dark-themed UI with tabbed navigation
- **Real-time AI-powered Results**: Get AI-enhanced search results with sources
- **Multiple Result Types**: View search summaries, image galleries, and source lists
- **Responsive Design**: Works well on mobile and desktop devices

## Getting Started

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

## Accessing the Perplexity Clone

- From the home page, click on the "Perplexity Search" link
- Or navigate directly to [http://localhost:3000/perplexity](http://localhost:3000/perplexity)
- Enter any search query in the search box and click the search button
- Navigate between the Search, Images, and Sources tabs to explore different result types

## API Details

The application uses a custom API route at `/api/perplexity` that accepts a `query` parameter. This route uses JigsawStack's web search functionality to fetch results and return them in a structured format.

Example API call:
```
GET /api/perplexity?query=What%20is%20the%20capital%20of%20France
```

## Timeout Handling

Search requests have a built-in 30-second timeout to prevent hanging requests. If you experience timeouts, try simplifying your query.

## Notes

- This is a demo project and uses a sample API key
- For production use, secure your API key using environment variables
