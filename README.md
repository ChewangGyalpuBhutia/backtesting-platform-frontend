
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
