# Asset Vault 🪙

A beautiful, modern asset tracker for managing precious metals (gold, silver) and currencies (USD, EGP cash) with live price updates.

## Features

✨ **Live Market Prices**
- Real-time gold and silver prices per ounce in EGP
- USD to EGP exchange rate
- Percentage change indicators

💰 **Multi-Asset Support**
- Track cash in EGP
- Track USD holdings
- Track gold in grams (auto-converts to oz)
- Track silver in grams (auto-converts to oz)

📊 **Portfolio Management**
- Total portfolio value in EGP
- Individual asset cards with current values
- Edit and delete functionality
- Persistent storage using localStorage

🎨 **Modern UI**
- Dark theme with gradient cards
- Responsive design (mobile + desktop)
- Smooth animations and hover effects
- Clean, professional interface

## Project Structure

```
/app
  /page.tsx                 # Main page component
  /api
    /prices
      /route.ts            # API endpoint for live prices

/components
  /Header.tsx              # App header with title
  /LivePrices.tsx          # Live price display cards
  /PortfolioCard.tsx       # Total portfolio value card
  /AssetForm.tsx           # Form for adding/editing assets
  /AssetCard.tsx           # Individual asset display card
  /AssetGrid.tsx           # Grid layout for asset cards
  /ui
    /button.tsx            # Button component
    /input.tsx             # Input component
    /label.tsx             # Label component

/sections
  /AssetTracker.tsx        # Main tracker component

/hooks
  /useAssets.ts            # Asset state management
  /usePrices.ts            # Price fetching logic

/lib
  /calculations.ts         # Asset value calculations
  /utils.ts                # Utility functions (cn)

/types
  /asset.ts                # TypeScript type definitions

/styles
  /globals.css             # Global styles and card gradients
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

## API Integration

The app currently uses mock data in `/app/api/prices/route.ts`. To integrate real live prices:

### Recommended APIs:

1. **Gold/Silver Prices:**
   - [Metals API](https://metals-api.com/) - Free tier available
   - [GoldAPI](https://www.goldapi.io/) - Real-time precious metals
   
2. **Currency Exchange:**
   - [ExchangeRate-API](https://www.exchangerate-api.com/) - Free USD to EGP
   - [Fixer.io](https://fixer.io/) - Currency conversion

### Example Integration:

```typescript
// In /app/api/prices/route.ts
const goldResponse = await fetch('https://metals-api.com/api/latest?access_key=YOUR_KEY');
const goldData = await goldResponse.json();

const exchangeResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
const exchangeData = await exchangeResponse.json();

const prices = {
  gold: {
    usd: goldData.rates.XAU,
    egp: goldData.rates.XAU * exchangeData.rates.EGP,
    change: calculateChange(goldData),
  },
  // ... similar for silver and USD
};
```

## Configuration

### Path Aliases (tsconfig.json)
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"],
      "@/sections/*": ["./sections/*"]
    }
  }
}
```

### Tailwind Config
The app uses custom gradient styles defined in `globals.css`:
- `.card-gradient` - Card background with border
- `.glow-green` - Green glow effect
- `.glow-amber` - Amber glow effect

## Storage

Assets are stored in browser localStorage with the key `"assets"`. Data persists across sessions but is specific to each browser/device.

To implement cloud sync, you could:
1. Add a backend API (Supabase, Firebase, etc.)
2. Replace localStorage with API calls in `useAssets.ts`
3. Add user authentication

## Future Enhancements

- [ ] User authentication
- [ ] Cloud storage/sync across devices
- [ ] Historical price charts
- [ ] Export portfolio to PDF/CSV
- [ ] Multi-currency support
- [ ] Price alerts and notifications
- [ ] Category/tag system for assets
- [ ] Recurring asset tracking (monthly contributions)

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Radix UI** - Accessible components
- **Class Variance Authority** - Component variants

## License

MIT License - feel free to use for personal or commercial projects!