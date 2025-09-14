# Cooking City

A Next.js application built on Solana blockchain for token trading and management.

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Blockchain**: Solana Web3.js, Anchor Framework
- **UI/UX**: TailwindCSS, HeroUI, Framer Motion, Lottie animations
- **Charts**: KLineCharts, ECharts for trading visualization
- **Wallet**: Reown AppKit for Solana wallet integration
- **APIs**: Jupiter API for DEX aggregation, Raydium SDK
- **Internationalization**: next-intl for multi-language support

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Solana wallet (Phantom, Solflare, etc.)
- Reown Cloud project for wallet connectivity

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chef_web
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   - `NEXT_PUBLIC_PROJECT_ID`: Your Reown Cloud project ID
   - Add other required environment variables as needed

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── api/           # API integration (token, price, user data)
├── app/           # Next.js app router pages
├── components/    # Reusable React components
├── context/       # React context providers (Auth, Price)
├── hooks/         # Custom React hooks
├── i18n/          # Internationalization configuration
├── lib/           # Utility libraries
├── types/         # TypeScript type definitions
└── utils/         # Helper functions and utilities
```

## License

This project is proprietary software. All rights reserved.

## Resources

- [Solana Documentation](https://docs.solana.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Reown AppKit Documentation](https://docs.reown.com)
- [Anchor Framework](https://www.anchor-lang.com/)
