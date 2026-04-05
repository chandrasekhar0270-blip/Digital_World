-- ============================================================
-- FINANCIAL TWIN — PostgreSQL Schema
-- Converted from Snowflake by Chandrasekhar S
-- Run this entire script in pgAdmin Query Tool
-- Database: financial_twin
-- ============================================================

-- STEP 0: Enable UUID generation (run once per database)
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- DROP TABLES (safe re-run — drops in reverse dependency order)
-- ============================================================
DROP TABLE IF EXISTS dead_letter       CASCADE;
DROP TABLE IF EXISTS batch_job_log     CASCADE;
DROP TABLE IF EXISTS stress_logs       CASCADE;
DROP TABLE IF EXISTS users             CASCADE;
DROP TABLE IF EXISTS stress_score      CASCADE;
DROP TABLE IF EXISTS stg_market_data   CASCADE;
DROP TABLE IF EXISTS net_worth_summary CASCADE;
DROP TABLE IF EXISTS income_flow       CASCADE;
DROP TABLE IF EXISTS expense_claim     CASCADE;
DROP TABLE IF EXISTS cost_of_investment CASCADE;
DROP TABLE IF EXISTS burndown_results  CASCADE;
DROP TABLE IF EXISTS assets_liabilities CASCADE;


-- ============================================================
-- TABLE 1: ASSETS_LIABILITIES
-- Purpose : Individual asset and liability line items entered
--           by the user (e.g. property, loans, gold, stocks).
--           Feeds into NET_WORTH_SUMMARY via aggregation.
-- Snowflake changes:
--   NUMBER(38,0) → BIGINT
--   VARCHAR      → TEXT
-- ============================================================
CREATE TABLE assets_liabilities (
    id          SERIAL          PRIMARY KEY,
    description TEXT,                       -- e.g. "Home Loan", "Mutual Fund"
    category    TEXT,                       -- "Asset" or "Liability"
    quantity    TEXT,                       -- number of units held
    payable     TEXT,                       -- outstanding payable amount
    value       BIGINT,                     -- current market/book value in INR
    units       TEXT,                       -- "shares", "grams", "sqft" etc.
    interest    NUMERIC(5,2)                -- interest rate % e.g. 8.50
);

COMMENT ON TABLE assets_liabilities IS
  'Individual asset and liability items. Aggregated into net_worth_summary.';


-- ============================================================
-- TABLE 2: BURNDOWN_RESULTS
-- Purpose : Pre-computed month-by-month burndown projections
--           for Twin A (with liabilities) and Twin B (zero debt).
--           Written by compute function; read by React dashboard.
-- Snowflake changes:
--   UUID_STRING()  → gen_random_uuid()::TEXT
--   NUMBER(38,0)   → BIGINT
--   FLOAT          → DOUBLE PRECISION
--   TIMESTAMP_NTZ  → TIMESTAMP
-- ============================================================
CREATE TABLE burndown_results (
    id              SERIAL          PRIMARY KEY,
    run_id          TEXT            DEFAULT gen_random_uuid()::TEXT,
    user_id         TEXT,                       -- user identifier
    scenario        TEXT,                       -- "TWIN_A" or "TWIN_B"
    projection_date DATE,                       -- month-end date for this row
    month_number    BIGINT,                     -- months elapsed from today (0 = now)
    year_number     BIGINT,                     -- year index (0 = current year)
    net_asset       DOUBLE PRECISION,           -- remaining net asset at this month
    monthly_expense DOUBLE PRECISION,           -- inflation-adjusted monthly expense
    annual_expense  DOUBLE PRECISION,           -- monthly_expense x 12
    inflation_rate  DOUBLE PRECISION,           -- inflation rate applied (0.04 = 4%)
    months_to_zero  BIGINT,                     -- total months until net asset = 0
    computed_at     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE burndown_results IS
  'Month-by-month Twin A/B burndown projections. Written by compute.py, read by FastAPI.';


-- ============================================================
-- TABLE 3: COST_OF_INVESTMENT
-- Purpose : Original cost basis of investments.
--           Used to compute unrealised gain/loss vs current value.
-- Snowflake changes:
--   AMOUNT VARCHAR → AMOUNT NUMERIC(18,2)  *** BUG FIX ***
--   VARCHAR        → TEXT
-- ============================================================
CREATE TABLE cost_of_investment (
    id          SERIAL          PRIMARY KEY,
    category    TEXT,                       -- "Equity", "Real Estate", "Gold"
    particulars TEXT,                       -- specific investment name
    amount      NUMERIC(18,2)               -- FIXED: was VARCHAR in Snowflake
);

COMMENT ON TABLE cost_of_investment IS
  'Original investment cost basis. AMOUNT fixed from VARCHAR to NUMERIC(18,2).';


-- ============================================================
-- TABLE 4: EXPENSE_CLAIM
-- Purpose : Monthly expense submissions.
--           SUM(value) drives monthly_expense for burndown.
-- Snowflake changes:
--   FLOAT        → DOUBLE PRECISION
--   VARCHAR(100) → VARCHAR(100) (unchanged)
-- ============================================================
CREATE TABLE expense_claim (
    id          SERIAL          PRIMARY KEY,
    claim_date  DATE,                       -- date expense was recorded
    category    VARCHAR(100),               -- "Rent", "Food", "EMI" etc.
    value       DOUBLE PRECISION            -- expense amount in INR
);

COMMENT ON TABLE expense_claim IS
  'Monthly expense entries. SUM(value) feeds burndown and stress score compute.';


-- ============================================================
-- TABLE 5: INCOME_FLOW
-- Purpose : Income sources with nature, type, and weight.
--           Used for income diversification scoring.
-- Snowflake changes:
--   AMOUNT VARCHAR → NUMERIC(18,2)  *** BUG FIX ***
--   WEIGHT VARCHAR → NUMERIC(5,2)   *** BUG FIX ***
--   VARCHAR        → TEXT
-- ============================================================
CREATE TABLE income_flow (
    id       SERIAL          PRIMARY KEY,
    item     TEXT,                       -- "Salary", "Rental Income" etc.
    nature   TEXT,                       -- "Active" or "Passive"
    category TEXT,                       -- "Employment", "Investment" etc.
    type     TEXT,                       -- "Fixed" or "Variable"
    amount   NUMERIC(18,2),              -- FIXED: was VARCHAR e.g. "1,00,000"
    weight   NUMERIC(5,2)                -- FIXED: was VARCHAR e.g. "60%" → 60.00
);

COMMENT ON TABLE income_flow IS
  'Income sources. AMOUNT and WEIGHT fixed from VARCHAR to proper numeric types.';


-- ============================================================
-- TABLE 6: NET_WORTH_SUMMARY
-- Purpose : Aggregated snapshot of financial position.
--           Rows: "Assets", "Liabilities", "Net Worth".
-- Snowflake changes:
--   NUMBER(18,2)  → NUMERIC(18,2)
--   TIMESTAMP_NTZ → TIMESTAMP
--   VARCHAR(50)   → VARCHAR(50) (unchanged)
-- ============================================================
CREATE TABLE net_worth_summary (
    id               SERIAL          PRIMARY KEY,
    category         VARCHAR(50),            -- "Assets", "Liabilities", "Net Worth"
    amount           NUMERIC(18,2),          -- raw value in INR
    formatted_amount VARCHAR(50),            -- display string e.g. "Rs.2.48 Cr"
    calculated_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE net_worth_summary IS
  'Aggregated net worth snapshot. Populated by compute.py after each recalculation.';


-- ============================================================
-- TABLE 7: STG_MARKET_DATA
-- Purpose : Staging table for external market parameters
--           e.g. inflation rate, NIFTY50 level.
-- Snowflake changes:
--   NUMBER(38,0) → BIGINT
--   FLOAT        → DOUBLE PRECISION
--   VARCHAR      → TEXT
-- ============================================================
CREATE TABLE stg_market_data (
    id           SERIAL          PRIMARY KEY,
    parameter    TEXT,                       -- "INFLATION_RATE", "NIFTY50" etc.
    value        DOUBLE PRECISION,           -- current value of the parameter
    last_updated BIGINT                      -- unix timestamp of last update
);

COMMENT ON TABLE stg_market_data IS
  'Market parameters staging table. Inflation rate read by burndown compute.';


-- ============================================================
-- TABLE 8: STRESS_SCORE
-- Purpose : Computed financial stress scores over time.
--           Latest row drives the Stress Insight dashboard.
-- Snowflake changes:
--   FLOAT        → DOUBLE PRECISION
--   VARCHAR(20)  → VARCHAR(20) (unchanged)
-- ============================================================
CREATE TABLE stress_score (
    id                      SERIAL          PRIMARY KEY,
    score_date              DATE,
    stress_score            DOUBLE PRECISION,   -- 0-100, higher = more stressed
    sustainability          DOUBLE PRECISION,   -- 0-100, higher = more sustainable
    stress_band             VARCHAR(20),        -- "Low","Moderate","High","Critical"
    total_monthly_expenses  DOUBLE PRECISION,
    financial_runway_months DOUBLE PRECISION,   -- months net asset can sustain expenses
    liability_to_asset_pct  DOUBLE PRECISION    -- liabilities as % of total assets
);

COMMENT ON TABLE stress_score IS
  'Financial stress scores over time. Recomputed when net worth or expenses change.';


-- ============================================================
-- TABLE 9: USERS  *** NEW — replaces hardcoded dict in app.py ***
-- Purpose : Application user accounts with role-based access.
--           Replaces hardcoded Admin/Employee dict.
-- ============================================================
CREATE TABLE users (
    id            SERIAL          PRIMARY KEY,
    username      TEXT            UNIQUE NOT NULL,
    password_hash TEXT            NOT NULL,       -- bcrypt hash, never plaintext
    role          TEXT            DEFAULT 'employee', -- "admin" or "employee"
    department    TEXT,
    emp_id        TEXT            UNIQUE,
    email         TEXT,
    created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS
  'Application users. Replaces hardcoded credentials in app.py. Passwords are bcrypt hashed.';


-- ============================================================
-- TABLE 11: BATCH_JOB_LOG  *** NEW — operations monitoring ***
-- Purpose : Tracks compute job runs (burndown, stress score,
--           net assets). Used by Admin batch job monitor view.
-- ============================================================
CREATE TABLE batch_job_log (
    id           SERIAL          PRIMARY KEY,
    job_name     TEXT,                       -- "burndown_compute", "stress_compute" etc.
    status       TEXT,                       -- "SUCCESS", "FAILED", "RUNNING"
    started_at   TIMESTAMP,
    completed_at TIMESTAMP,
    rows_written INTEGER,                    -- number of rows written to target table
    error_msg    TEXT                        -- populated on FAILED status
);

COMMENT ON TABLE batch_job_log IS
  'Compute job run history. Read by Admin dashboard job monitor view.';


-- ============================================================
-- TABLE 12: DEAD_LETTER  *** NEW — failed record tracking ***
-- Purpose : Captures records that failed processing.
--           Used by Admin dead letter view for investigation.
-- ============================================================
CREATE TABLE dead_letter (
    id         SERIAL          PRIMARY KEY,
    source     TEXT,                       -- which job/table the record came from
    record     TEXT,                       -- the raw record that failed (JSON string)
    error_msg  TEXT,                       -- what went wrong
    created_at TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE dead_letter IS
  'Failed record store. Admin can inspect and reprocess or discard.';


-- ============================================================
-- SEED DATA: Default market parameters
-- ============================================================
INSERT INTO stg_market_data (parameter, value, last_updated)
VALUES
    ('INFLATION_RATE', 0.04,     EXTRACT(EPOCH FROM NOW())::BIGINT),
    ('NIFTY50',        22000.0,  EXTRACT(EPOCH FROM NOW())::BIGINT),
    ('REPO_RATE',      0.065,    EXTRACT(EPOCH FROM NOW())::BIGINT)
ON CONFLICT DO NOTHING;


-- ============================================================
-- VERIFICATION: Run this after the script to confirm all tables
-- ============================================================
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c
     WHERE c.table_name = t.table_name
     AND c.table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;


ALTER TABLE stg_market_data 
ADD CONSTRAINT stg_market_data_date_param_unique UNIQUE (last_updated, parameter);

-- ============================================================
-- End of FINANCIAL TWIN 
-- ============================================================

===============================================================================================================================

-- ============================================================
-- Fitness Schema Begin
-- ============================================================

-- =========================================
-- 1. Create Schema
-- =========================================
CREATE SCHEMA IF NOT EXISTS fitness;

-- =========================================
-- 2. Enable UUID extension (for auto UUIDs)
-- =========================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- 3. Users Table
-- =========================================
CREATE TABLE fitness.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- 4. Runs Table
-- =========================================
CREATE TABLE fitness.runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL,
    
    distance_km DECIMAL(6,2) NOT NULL CHECK (distance_km > 0),
    duration_sec INTEGER NOT NULL CHECK (duration_sec > 0),

    -- Generated Columns
    speed_kmh DECIMAL(5,2) GENERATED ALWAYS AS 
        (distance_km / (duration_sec / 3600.0)) STORED,

    pace_min_km DECIMAL(5,2) GENERATED ALWAYS AS 
        ((duration_sec / 60.0) / distance_km) STORED,

    run_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Foreign Key
    CONSTRAINT fk_runs_user
        FOREIGN KEY (user_id)
        REFERENCES fitness.users(id)
        ON DELETE CASCADE
);

-- =========================================
-- 5. Goals ENUM Type
-- =========================================
CREATE TYPE fitness.goal_type AS ENUM (
    'weekly_km',
    'pace',
    'streak'
);

-- =========================================
-- 6. Goals Table
-- =========================================
CREATE TABLE fitness.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL,
    
    target_type fitness.goal_type NOT NULL,
    target_value DECIMAL(8,2) NOT NULL CHECK (target_value > 0),
    
    deadline DATE NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Foreign Key
    CONSTRAINT fk_goals_user
        FOREIGN KEY (user_id)
        REFERENCES fitness.users(id)
        ON DELETE CASCADE
);

-- =========================================
-- 7. Indexes (Recommended for performance)
-- =========================================
CREATE INDEX idx_runs_user_id ON fitness.runs(user_id);
CREATE INDEX idx_runs_date ON fitness.runs(run_date);
CREATE INDEX idx_goals_user_id ON fitness.goals(user_id);


-- ============================================================
-- End of Fitness Schema 
-- ============================================================
===============================================================================================================================

-- ============================================
-- Mgmt SCHEMA
-- ============================================
CREATE SCHEMA IF NOT EXISTS mgmt;

-- ============================================
-- TABLE: task_log
-- ============================================
CREATE TABLE IF NOT EXISTS mgmt.task_log (
    id INTEGER DEFAULT 1,
    name TEXT DEFAULT 'Chandru',
    item TEXT,
    date DATE,
    start_time TIME,
    end_time TIME,
    duration INTERVAL,

    CONSTRAINT task_log_pkey PRIMARY KEY (item, date, start_time)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_task_log_unique
ON mgmt.task_log (item, date, start_time);

-- ============================================
-- TABLE: sprint_tickets
-- ============================================
CREATE TABLE IF NOT EXISTS mgmt.sprint_tickets (
    id SERIAL PRIMARY KEY,
    ticket_id TEXT,
    sprint TEXT,
    description TEXT,
    summary TEXT,
    status TEXT,

    CONSTRAINT sprint_tickets_ticket_sprint_unique 
    UNIQUE (ticket_id, sprint)
);

-- ============================================
-- TABLE: sprint_review
-- ============================================
CREATE TABLE IF NOT EXISTS mgmt.sprint_review (
    name TEXT DEFAULT 'Chandru',
    user_id INTEGER DEFAULT 1,
    what_went_well TEXT,
    what_didnt_go_well TEXT,
    change_to_adapt TEXT,
    plan_of_action TEXT,
    sprint TEXT,
    team TEXT
);

-- (Optional but recommended primary key)
ALTER TABLE mgmt.sprint_review
ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY;

-- ============================================
-- TABLE: scrum_master_review
-- ============================================
CREATE TABLE IF NOT EXISTS mgmt.scrum_master_review (
    id SERIAL PRIMARY KEY,
    sm_name TEXT DEFAULT 'Chandru',
    sm_id INTEGER DEFAULT 1,
    sm_task TEXT NOT NULL,
    completed_or_not BOOLEAN DEFAULT FALSE
);

-- ============================================
-- TABLE: todays_task
-- ============================================
CREATE TABLE IF NOT EXISTS mgmt.todays_task (
    id SERIAL PRIMARY KEY,
    name TEXT DEFAULT 'Chandru',
    user_id INTEGER DEFAULT 1,
    item TEXT NOT NULL,
    comments TEXT,
    completed_or_not BOOLEAN,
    date DATE
);

-- ============================================
-- INDEXES (Optional Improvements)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sprint_tickets_sprint
ON mgmt.sprint_tickets (sprint);

CREATE INDEX IF NOT EXISTS idx_todays_task_user_date
ON mgmt.todays_task (user_id, date);

CREATE INDEX IF NOT EXISTS idx_task_log_date
ON mgmt.task_log (date);

-- ============================================================
-- End of Mgmt Schema 
-- ============================================================