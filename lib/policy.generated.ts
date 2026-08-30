/* 자동 생성. scripts/refresh-policy.mjs 가 법제처·금융위 규정에서 다시 씁니다. */
export const POLICY_FETCHED_AT = "2026-08-30"

export const POLICY_SOURCES = {
  "income": {
    "query": "소득세법",
    "id": "001565",
    "name": "소득세법",
    "enforced": "2026-07-01",
    "promulgated": "2025-12-23",
    "revision": "일부개정"
  },
  "gift": {
    "query": "상속세 및 증여세법",
    "id": "001561",
    "name": "상속세 및 증여세법",
    "enforced": "2026-01-02",
    "promulgated": "2025-10-01",
    "revision": "타법개정"
  },
  "corp": {
    "query": "법인세법",
    "id": "001563",
    "name": "법인세법",
    "enforced": "2026-07-01",
    "promulgated": "2025-12-23",
    "revision": "일부개정"
  },
  "local": {
    "query": "지방세법",
    "id": "001649",
    "name": "지방세법",
    "enforced": "2026-07-01",
    "promulgated": "2025-12-31",
    "revision": "일부개정"
  },
  "holding": {
    "query": "종합부동산세법",
    "id": "009873",
    "name": "종합부동산세법",
    "enforced": "2026-01-01",
    "promulgated": "2025-12-23",
    "revision": "일부개정"
  },
  "brokerage": {
    "query": "공인중개사법 시행규칙",
    "id": "007292",
    "name": "공인중개사법 시행규칙",
    "enforced": "2026-08-28",
    "promulgated": "2026-08-11",
    "revision": "일부개정"
  },
  "firstHome": {
    "query": "지방세특례제한법",
    "id": "011178",
    "name": "지방세특례제한법",
    "enforced": "2026-06-02",
    "promulgated": "2026-06-02",
    "revision": "타법개정"
  },
  "stamp": {
    "query": "인지세법",
    "id": "001568",
    "name": "인지세법",
    "enforced": "2026-01-02",
    "promulgated": "2025-10-01",
    "revision": "타법개정"
  },
  "rural": {
    "query": "농어촌특별세법",
    "id": "001569",
    "name": "농어촌특별세법",
    "enforced": "2026-05-12",
    "promulgated": "2026-05-12",
    "revision": "일부개정"
  },
  "vat": {
    "query": "부가가치세법",
    "id": "001571",
    "name": "부가가치세법",
    "enforced": "2026-01-02",
    "promulgated": "2025-10-01",
    "revision": "타법개정"
  },
  "holdingDecree": {
    "query": "종합부동산세법 시행령",
    "id": "009968",
    "name": "종합부동산세법 시행령",
    "enforced": "2026-02-27",
    "promulgated": "2026-02-27",
    "revision": "일부개정"
  },
  "banking": {
    "query": "은행업감독규정",
    "id": "2100000276094",
    "name": "은행업감독규정",
    "enforced": "2026-04-01",
    "promulgated": "2026-03-18",
    "revision": "일부개정"
  }
} as const

export const INCOME_BRACKETS = [
  { upTo: 14000000, rate: 0.06, deduction: 0 },
  { upTo: 50000000, rate: 0.15, deduction: 1260000 },
  { upTo: 88000000, rate: 0.24, deduction: 5760000 },
  { upTo: 150000000, rate: 0.35, deduction: 15440000 },
  { upTo: 300000000, rate: 0.38, deduction: 19940000 },
  { upTo: 500000000, rate: 0.4, deduction: 25940000 },
  { upTo: 1000000000, rate: 0.42, deduction: 35940000 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.45, deduction: 65940000 },
] as const

export const GIFT_BRACKETS = [
  { upTo: 100000000, rate: 0.1, deduction: 0 },
  { upTo: 500000000, rate: 0.2, deduction: 10000000 },
  { upTo: 1000000000, rate: 0.3, deduction: 60000000 },
  { upTo: 3000000000, rate: 0.4, deduction: 160000000 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.5, deduction: 460000000 },
] as const

export const CORP_BRACKETS = [
  { upTo: 200000000, rate: 0.1, deduction: 0 },
  { upTo: 20000000000, rate: 0.2, deduction: 20000000 },
  { upTo: 300000000000, rate: 0.22, deduction: 420000000 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.25, deduction: 9420000000 },
] as const

export const GIFT_DEDUCTIONS = {
  spouse: 600000000,
  ascendant: 50000000,
  descendant: 50000000,
  other: 10000000,
} as const

export const VAT_RATE = 0.1

export const BROKERAGE_SALE = [
  { max: 50000000, rate: 0.006, cap: 250000 },
  { max: 200000000, rate: 0.005, cap: 800000 },
  { max: 900000000, rate: 0.004, cap: null },
  { max: 1200000000, rate: 0.005, cap: null },
  { max: 1500000000, rate: 0.006, cap: null },
  { max: Number.POSITIVE_INFINITY, rate: 0.007, cap: null },
] as const

export const BROKERAGE_LEASE = [
  { max: 50000000, rate: 0.005, cap: 200000 },
  { max: 100000000, rate: 0.004, cap: 300000 },
  { max: 600000000, rate: 0.003, cap: null },
  { max: 1200000000, rate: 0.004, cap: null },
  { max: 1500000000, rate: 0.005, cap: null },
  { max: Number.POSITIVE_INFINITY, rate: 0.006, cap: null },
] as const

export const BROKERAGE = {
  officetelSale: 0.005,
  officetelLease: 0.004,
  other: 0.009,
  monthlyHighMultiple: 100,
  monthlyLowMultiple: 70,
  monthlyLowThreshold: 50000000,
} as const

export const STAMP = {
  housingExempt: 100000000,
  bands: [
  { upTo: 30000000, duty: 20000 },
  { upTo: 50000000, duty: 40000 },
  { upTo: 100000000, duty: 70000 },
  { upTo: 1000000000, duty: 150000 },
  { upTo: Number.POSITIVE_INFINITY, duty: 350000 },
  ],
} as const

export const ACQUISITION = {
  "housingLow": 0.01,
  "housingHigh": 0.03,
  "housingMidFrom": 600000000,
  "housingMidTo": 900000000,
  "standardNonFarm": 0.04,
  "heavyBase": 0.02,
  "heavy2": 0.08,
  "heavy3": 0.12,
  "firstHomeLimit": 1200000000,
  "firstHomeRelief": 2000000,
  "shrinkingRelief": 3000000,
  "educationShare": 0.1,
  "educationHeavyFixed": 0.004,
  "ruralNormal": 0.002,
  "ruralHeavy2": 0.006,
  "ruralHeavy3": 0.01
} as const

export const CAPITAL_GAINS = {
  "houseExempt": 1200000000,
  "basicDeduction": 2500000,
  "under1y": 0.7,
  "under2y": 0.6,
  "surcharge2": 0.2,
  "surcharge3": 0.3,
  "localIncome": 0.1,
  "specialStart": 0.06,
  "specialStep": 0.02,
  "specialMax": 0.3,
  "specialOneHousePerYear": 0.08,
  "specialOneHouseMax": 0.8
} as const

export const INHERITANCE = {
  "lump": 500000000,
  "spouseMin": 500000000
} as const

export const HOLDING = {
  fairMarket: 0.6,
  oneHouseDeduction: 1200000000,
  otherDeduction: 900000000,
  cityRate: 0.0014,
  educationShare: 0.2,
  ruralShare: 0.2,
  jongbuOne: 0.005,
  jongbuTwo: 0.008,
  jongbuThree: 0.012,
  propertyOneHouse: [
  { cap: 60000000, rate: 0.0005 },
  { cap: 150000000, rate: 0.001 },
  { cap: 300000000, rate: 0.002 },
  { cap: Number.POSITIVE_INFINITY, rate: 0.0035 },
  ],
  propertyOther: [
  { cap: 60000000, rate: 0.001 },
  { cap: 150000000, rate: 0.0015 },
  { cap: 300000000, rate: 0.0025 },
  { cap: Number.POSITIVE_INFINITY, rate: 0.004 },
  ],
} as const

export const LICENSE = {
  "inherit": 0.008,
  "gift": 0.015,
  "educationShare": 0.2
} as const

export const CORP_EXTRA_LAND = 0.1

export const LTV_POLICY = {
  unregulated: 0.7,
  regulated: 0.5,
  firstTime: 0.8,
  firstTimeCap: 600000000,
  extraBanned: true,
} as const

export const DSR_POLICY = {
  "bank": 0.4,
  "nonbank": 0.5
} as const
