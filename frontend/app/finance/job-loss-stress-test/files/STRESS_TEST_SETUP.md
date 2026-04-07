# Job Loss Stress Test — React Conversion

## 📋 Overview

Complete conversion of Streamlit stress analytics to React/Next.js with API integration:

- **Original**: Streamlit dashboard with authentication and complex projections
- **Converted**: Modern React component with 3 interactive scenarios
- **Data**: Fetched from Neon PostgreSQL via API routes
- **Architecture**: Full-stack TypeScript with Recharts visualizations

## 📁 Files Provided

### 1. **stress-test-route.ts** → `app/api/stress-test/route.ts`
- GET endpoint for 3 scenarios
- Query parameter `type`: `stress_insight`, `twin_a`, or `twin_comparison`
- Returns financial projections and metrics

### 2. **job-loss-page.tsx** → `app/job-loss/page.tsx`
- Main layout with navigation tabs
- 3 page routing
- Tab switching logic

### 3. **stress-insight.tsx** → `app/job-loss/stress-insight.tsx`
- Current financial position
- Stress score calculation
- Job loss impact metrics
- Recommendations

### 4. **twin-a.tsx** → `app/job-loss/twin-a.tsx`
- Twin A scenario projection
- Liabilities reducing over time
- Net asset depletion chart
- Detailed data table

### 5. **twin-comparison.tsx** → `app/job-loss/twin-comparison.tsx`
- Side-by-side comparison
- Twin A vs Twin B scenario
- Impact visualization
- Action plan recommendations

## 🗄️ Database Schema

Your tables must have this structure:

```sql
-- User's current financial snapshot
CREATE TABLE ft.user_financial_snapshot (
  id SERIAL PRIMARY KEY,
  net_worth NUMERIC,
  total_assets NUMERIC,
  total_liabilities NUMERIC,
  monthly_expense NUMERIC,
  stress_score NUMERIC,  -- 0 to 1 (0.8+ critical, 0.4-0.6 moderate, <0.4 low)
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Twin A: Current scenario with liability reduction
CREATE TABLE ft.job_loss_projection_twin_a (
  id SERIAL PRIMARY KEY,
  projection_date DATE,
  net_asset NUMERIC,
  monthly_expense NUMERIC,
  liabilities_remaining NUMERIC,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Twin B: Zero liabilities scenario
CREATE TABLE ft.job_loss_projection_twin_b (
  id SERIAL PRIMARY KEY,
  projection_date DATE,
  net_asset NUMERIC,
  monthly_expense NUMERIC,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO ft.user_financial_snapshot (net_worth, total_assets, total_liabilities, monthly_expense, stress_score)
VALUES (3000000, 5000000, 2000000, 100000, 0.65);

INSERT INTO ft.job_loss_projection_twin_a (projection_date, net_asset, monthly_expense, liabilities_remaining)
VALUES 
('2024-01-01', 3000000, 100000, 2000000),
('2025-01-01', 2800000, 100000, 1750000),
('2026-01-01', 2550000, 100000, 1500000);

INSERT INTO ft.job_loss_projection_twin_b (projection_date, net_asset, monthly_expense)
VALUES 
('2024-01-01', 5000000, 100000),
('2025-01-01', 4800000, 100000),
('2026-01-01', 4550000, 100000);
```

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install recharts pg
```

### Step 2: Copy Files

```bash
# API Route
mkdir -p app/api/stress-test
cp stress-test-route.ts app/api/stress-test/route.ts

# Job Loss Pages
mkdir -p app/job-loss
cp job-loss-page.tsx app/job-loss/page.tsx
cp stress-insight.tsx app/job-loss/stress-insight.tsx
cp twin-a.tsx app/job-loss/twin-a.tsx
cp twin-comparison.tsx app/job-loss/twin-comparison.tsx
```

### Step 3: Environment Variables
```bash
# .env.local
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname
```

### Step 4: Test
```bash
npm run dev
# Visit http://localhost:3000/job-loss
```

## 📊 Scenarios Explained

### 🧠 Stress Insight
**Current Position Assessment**

Shows your financial health with:
- Starting position (assets, liabilities, net worth, expenses)
- Survival duration if you lose job today
- Stress score (0-1 scale with risk levels)
- Personalized recommendations

**Stress Score Levels:**
- **🚨 0.8-1.0**: Critical — immediate action needed
- **⚠️ 0.6-0.8**: High risk — limited runway
- **📊 0.4-0.6**: Moderate — some buffer available
- **✅ 0.0-0.4**: Low risk — strong position

### 📈 Twin A Projection
**Current Scenario**

Assumes:
- You lose your job immediately
- Assets deplete monthly
- Liabilities reduce gradually (e.g., debt paydown)
- No income until assets hit zero

Shows:
- Year-by-year net asset depletion
- Liabilities remaining each year
- Monthly expenses
- Interactive chart and data table

### ⚖️ Twin Comparison
**Impact of Liabilities**

Compares two scenarios:

**Twin A (Current):**
- Your actual net worth
- With existing liabilities
- Limited survival runway

**Twin B (No Debt):**
- Same net worth + liabilities
- Zero liabilities
- Extended survival runway

**Key Insight:** The gap shows how much longer you'd survive without debt.

## 🎨 Design System

| Element | Color | Usage |
|---------|-------|-------|
| Primary | #2563EB | Headers, primary actions |
| Amber | #F59E0B | Twin A, current scenario |
| Green | #10B981 | Twin B, improved scenario |
| Red/Negative | #EF4444 | Risk, liabilities |
| Background | #F0F4FF | Page background |
| Cards | #FFFFFF | Content containers |

## 📈 Calculations

```typescript
// Survival Duration
survivalMonths = netWorth / monthlyExpense

// Stress Score (0 to 1)
// Based on months-of-expense ratio:
// < 3 months = 0.8 (critical)
// 3-6 months = 0.6 (high)
// 6-12 months = 0.4 (moderate)
// > 12 months = 0.2 (low)

// Twin Scenarios
// Twin A: Current position with liability reduction
// Twin B: Same position but zero liabilities

// Advantage = TwinB_SurvivalMonths - TwinA_SurvivalMonths
```

## 🔌 API Endpoints

### GET /api/stress-test?type=stress_insight

Returns current snapshot:
```json
{
  "type": "stress_insight",
  "data": {
    "net_worth": 3000000,
    "total_assets": 5000000,
    "total_liabilities": 2000000,
    "monthly_expense": 100000,
    "survival_months": 30,
    "stress_score": 0.65,
    "last_updated": "2024-01-15T10:00:00Z"
  }
}
```

### GET /api/stress-test?type=twin_a

Returns Twin A projection:
```json
{
  "type": "twin_a",
  "data": [
    {
      "projection_date": "2024-01-01",
      "net_asset": 3000000,
      "monthly_expense": 100000,
      "liabilities_remaining": 2000000,
      "year": 2024
    },
    ...
  ]
}
```

### GET /api/stress-test?type=twin_comparison

Returns both scenarios for comparison.

## 🛠️ Customization

### Change Annual Liability Reduction
In your SQL:
```sql
-- Update your projection logic
-- Default: reduce liabilities by X% per year
UPDATE ft.job_loss_projection_twin_a
SET liabilities_remaining = liabilities_remaining * 0.9;
```

### Modify Stress Score Thresholds
In `stress-insight.tsx`:
```typescript
const getColor = (s: number) => {
  if (s >= 0.8) return COLORS.NEGATIVE;    // Critical
  if (s >= 0.6) return COLORS.AMBER;       // High
  if (s >= 0.4) return COLORS.BLUE_LT;     // Moderate
  return COLORS.POSITIVE;                   // Low
};
```

### Adjust Chart Heights
```typescript
<ResponsiveContainer width="100%" height={400}>  {/* Change 400 */}
```

## 📱 Responsive Design

- 3-column nav on desktop
- Adjusts to 2-1 columns on tablet/mobile
- Charts responsive height
- Touch-friendly buttons

## 📚 Database Queries

Calculate stress score dynamically:
```sql
SELECT 
  id,
  net_worth,
  monthly_expense,
  CASE 
    WHEN (net_worth / monthly_expense) < 3 THEN 0.8
    WHEN (net_worth / monthly_expense) < 6 THEN 0.6
    WHEN (net_worth / monthly_expense) < 12 THEN 0.4
    ELSE 0.2
  END as stress_score
FROM ft.user_financial_snapshot;
```

Generate projections:
```sql
-- Generate monthly projections for Twin A
WITH RECURSIVE months AS (
  SELECT 0 as month
  UNION ALL
  SELECT month + 1 FROM months WHERE month < 120
)
SELECT
  DATE_ADD(NOW(), INTERVAL months.month MONTH) as projection_date,
  net_worth - (monthly_expense * months.month) as net_asset,
  monthly_expense,
  GREATEST(total_liabilities - (monthly_liability_paydown * months.month), 0) as liabilities_remaining
FROM ft.user_financial_snapshot
CROSS JOIN months;
```

## 🧪 Testing

Test with sample data:
```typescript
const mockSnapshot = {
  net_worth: 3000000,
  total_assets: 5000000,
  total_liabilities: 2000000,
  monthly_expense: 100000,
  survival_months: 30,
  stress_score: 0.65
};
```

## 🐛 Troubleshooting

**Issue**: "Failed to fetch stress test data"
- Check DATABASE_URL
- Verify tables exist
- Check data is populated

**Issue**: Charts not rendering
- Install Recharts: `npm install recharts`
- Check browser console

**Issue**: Missing projections**
- Ensure projection tables have data
- Check date ranges are correct

## 🚀 Deployment Checklist

- [ ] DATABASE_URL set in production
- [ ] All 3 tables created and populated
- [ ] API route deployed
- [ ] All 4 component files in correct location
- [ ] Responsive design tested on mobile
- [ ] Charts render correctly
- [ ] No console errors
- [ ] Loading states appear briefly

## 📈 Next Steps

1. **Add editing**: Let users update financial data
2. **Add export**: Generate PDF reports
3. **Add scenarios**: What-if analysis tools
4. **Add history**: Track stress score over time
5. **Add alerts**: Notify when stress hits threshold

## ✨ Success Criteria

When complete:
- ✅ 3 tabs load with correct data
- ✅ Charts render with proper formatting
- ✅ Stress score displays correctly
- ✅ Comparisons show clear advantage of Twin B
- ✅ Responsive on mobile
- ✅ No console errors
- ✅ Real data from database

---

This is a financial wellness tool. Use it to understand your job loss resilience and make informed decisions about debt and savings. 🧠💰

Questions? Check the API responses or database schema first!
