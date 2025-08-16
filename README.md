
# Backtesting Platform Frontend

This is the frontend for the Backtesting Platform, built with Next.js and React. It provides an interactive web interface for configuring, running, and visualizing financial strategy backtests, fundamental analysis, and news insights.

## Features
- **Dashboard**: Visualize backtest results, monthly returns, and strategy comparisons.
- **Strategy Configuration**: Set up and customize trading strategies.
- **Fundamental Analysis**: View key financial metrics and analysis.
- **Stock News**: Display relevant news and sentiment for selected assets.
- **Authentication**: OAuth integration for secure access.

## Tech Stack & Dependencies
- **Next.js**: React-based framework for server-side rendering and routing.
- **React**: UI library for building interactive components.
- **Tailwind CSS / PostCSS**: For modern, responsive styling.
- **ESLint**: Code linting and quality enforcement.
- **pnpm**: Fast, disk-efficient package manager.
- **Vercel**: Deployment platform (see `.vercel/project.json`).
- **Other Libraries**: See `package.json` for a complete list (e.g., charting, authentication, API handling).

## Project Structure

```
backtesting-platform-frontend/
├── src/
│   ├── app/                 # Main app entry, global styles, layout
│   ├── components/          # UI components (dashboard, charts, analysis, etc.)
│   ├── services/            # API service layer
├── public/                  # Static assets (SVGs, icons)
├── .env.local               # Environment variables
├── package.json             # Project dependencies
├── next.config.mjs          # Next.js configuration
├── postcss.config.mjs       # PostCSS configuration
├── eslint.config.mjs        # ESLint configuration
```

## Environment Variables (.env.local)
Add the following key values to your `.env.local` file for OAuth and NextAuth setup:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_NEXTAUTH_URL=https://backtesting-platform-frontend.vercel.app
NEXTAUTH_SECRET=your-very-strong-random-secret
```

Replace `your-google-client-id`, `your-google-client-secret`, and `your-very-strong-random-secret` with your actual credentials. The `NEXT_PUBLIC_NEXTAUTH_URL` should match your deployed frontend URL.

## Getting Started
1. **Install dependencies**:
	```powershell
	pnpm install
	```
2. **Run the development server**:
	```powershell
	pnpm run dev
	```
3. **Open in browser**:
	Navigate to `http://localhost:3000`

## Deployment
- Deploy to Vercel for production. See `.vercel/project.json` for configuration.

## License
This project is licensed under the MIT License.
