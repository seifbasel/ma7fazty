# MA7FAZTY 🪙

A beautiful, modern asset tracker for managing precious metals, currencies, real estate income, and interest-bearing assets — with live prices, portfolio analytics, and 12-month projections.

## Features

✨ **Live Market Prices**
- Real-time gold and silver prices per troy oz in EGP & USD
- USD to EGP exchange rate
- Animated live indicator badge

💰 **Multi-Asset Support**
- Cash (EGP)
- USD holdings
- Gold in grams — supports 18K, 21K, 22K, 24K purity
- Silver in grams
- Rental income (monthly rent × elapsed months)
- Interest-bearing deposits (simple or monthly compound)

📊 **Portfolio Analytics**
- Total portfolio value with top holding breakdown
- Donut pie chart — interactive hover with per-slice EGP value & percentage
- Asset distribution by type with color-coded legend
- 12-month forward projection chart with month-over-month growth strip
- Projection logic per asset type (rent accumulation, compound/simple interest, stable market prices)

🗂️ **Asset Management**
- Add, edit, delete assets
- Per-type forms (dates, rates, purity, principal)
- Confirm dialog before deletion
- Persistent storage via localStorage

🎨 **UI & Design**
- Dark slate theme with per-type gradient cards (amber/gold, violet/rent, rose/interest, etc.)
- Ambient glow blobs and hover scale effects on cards
- Fully responsive — mobile & desktop
- Interactive charts with touch support
- Edit/delete controls revealed on hover

## Project Structure

```
/app
  /page.tsx                    # Root page
  /api
    /prices
      /route.ts                # API endpoint for live prices

/sections
  /AssetTracker.tsx            # Main orchestration component

/components
  /Header.tsx                  # MA7FAZTY branding header
  /LivePrices.tsx              # Gold, silver, USD price cards
  /PortfolioCard.tsx           # Total value + top holding stats
  /AssetDistribution.tsx       # Donut pie chart by asset type
  /PieChart.tsx                # Reusable interactive donut chart
  /MonthlyGrowthChart.tsx      # 12-month forward projection chart
  /AssetForm.tsx               # Add / edit asset form
  /AssetFormModal.tsx          # Edit asset in a modal dialog
  /AssetCard.tsx               # Individual asset card
  /AssetGrid.tsx               # Asset card grid + empty state
  /ConfirmDialog.tsx           # Delete confirmation dialog
  /ui
    /button.tsx
    /input.tsx
    /label.tsx
    /dialog.tsx

/hooks
  /useAssets.ts                # Asset CRUD + localStorage persistence
  /usePrices.ts                # Price polling / fetching

/lib
  /calculations.ts             # Value calculations per asset type
  /assetTypes.ts               # Icons, labels, colors per type
  /utils.ts                    # cn() utility

/types
  /asset.ts                    # Asset & Prices TypeScript types
```

## Asset Types & Calculations

| Type | Value Logic |
|------|-------------|
| **Cash** | Fixed EGP amount |
| **USD** | Amount × current EGP rate |
| **Gold** | Grams × (price/troy oz ÷ 31.1035) × (purity/24) |
| **Silver** | Grams × (price/troy oz ÷ 31.1035) |
| **Rent** | Monthly rent × months elapsed from start date |
| **Interest (simple)** | P × (1 + r × t) |
| **Interest (compound)** | P × (1 + r/12)^months |

All rent and interest assets respect an optional `endDate` — value stops growing once the contract ends.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## API Integration

Live prices are fetched from `/app/api/prices/route.ts`. The app expects this shape:

```typescript
// types/asset.ts
interface Prices {
  gold:   { usd: number; egp: number };
  silver: { usd: number; egp: number };
  usdToEgp: number;
}
```

### Recommended APIs

| Data | Provider |
|------|----------|
| Gold & Silver | [GoldAPI.io](https://www.goldapi.io/) · [Metals-API](https://metals-api.com/) |
| USD → EGP | [ExchangeRate-API](https://www.exchangerate-api.com/) · [Fixer.io](https://fixer.io/) |

### Example route

```typescript
// app/api/prices/route.ts
export async function GET() {
  const [metals, fx] = await Promise.all([
    fetch('https://www.goldapi.io/api/XAU/USD', {
      headers: { 'x-access-token': process.env.GOLD_API_KEY! }
    }).then(r => r.json()),
    fetch('https://api.exchangerate-api.com/v4/latest/USD').then(r => r.json()),
  ]);

  const egpRate = fx.rates.EGP;

  return Response.json({
    gold:    { usd: metals.price,        egp: metals.price * egpRate },
    silver:  { usd: metals.silver_price, egp: metals.silver_price * egpRate },
    usdToEgp: egpRate,
  });
}
```

## Configuration

### Path aliases (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Custom Tailwind classes (`globals.css`)

```css
.card-gradient  /* dark card background with border */
.glow-green     /* emerald glow shadow */
.glow-amber     /* amber glow shadow */
```

## Storage

Assets persist in `localStorage` under the key `"assets"`. To sync across devices:

1. Add a backend (Supabase, Firebase, PlanetScale, etc.)
2. Replace `localStorage` calls in `useAssets.ts` with API calls
3. Add authentication (NextAuth.js, Clerk, etc.)

## Roadmap

- [ ] Cloud sync & user accounts
- [ ] Historical price tracking (store daily snapshots)
- [ ] Export to PDF / CSV
- [ ] Price alerts & push notifications
- [ ] Multi-currency display (EUR, GBP, etc.)
- [ ] Recurring contribution tracking
- [ ] Category / tag system

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | Next.js 15 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Components | Radix UI |
| Charts | Custom SVG |
| Storage | localStorage |

## License

MIT — free to use for personal or commercial projects.