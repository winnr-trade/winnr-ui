export const MOCK_CATEGORIES = [
  { name: "Crypto", active: true },
  { name: "Geopolitics", active: false },
  { name: "Stocks", active: false },
  { name: "AI & Tech", active: false },
  { name: "Sports", active: false },
  { name: "Global News", active: false },
  { name: "Entertainment", active: false },
];

export const MOCK_TRENDING = [
  {
    id: "eth-5k",
    title: "Will Ethereum reach $5,000 by the end of Q3...",
    category: "Crypto",
    chance: "12%",
    volume: "$842k",
    iconName: "activity",
  },
  {
    id: "us-election",
    title: "2024 US Presidential Election: Democrat...",
    category: "Geopolitics",
    chance: "48%",
    volume: "$12.1M",
    iconName: "landmark",
  },
  {
    id: "gpt-5",
    title: "OpenAI to release GPT-5 before December 2024?",
    category: "AI",
    chance: "74%",
    volume: "$1.2M",
    iconName: "rocket",
  },
];

export const MOCK_NEWEST = [
  {
    id: "fomc-cut",
    title: "Fed to cut interest rates in the next FOMC meeting?",
    tags: ["Stocks", "Added 2h ago"],
    metricLabel: "Current Chance",
    metricValue: "32%",
    metricColor: "text-primary",
    iconName: "check",
  },
  {
    id: "nba-champ",
    title: "Who will win the 2024 NBA Championship?",
    tags: ["Sports", "Added 5h ago"],
    metricLabel: "Pool Size",
    metricValue: "$240k",
    metricColor: "text-primary",
    iconName: "trophy",
  },
];

export const MOCK_CLOSING = [
  {
    id: "btc-70k",
    tag: "URGENT",
    time: "2h 14m left",
    title: "Bitcoin to close above $70k today?",
    progress: 85,
    tagColor: "text-red-400",
  },
  {
    id: "superbowl",
    tag: "ENDING TODAY",
    time: "8h 45m left",
    title: "Super Bowl viewership record broken?",
    progress: 25,
    tagColor: "text-orange-400",
  },
  {
    id: "apple-vr",
    tag: "LAST CHANCE",
    time: "12h 02m left",
    title: "Apple's VR headset shipment numbers?",
    progress: 60,
    tagColor: "text-red-300",
  },
];

export const MOCK_MARKET_STATS = {
  traders24h: "12,402",
  totalTvl: "$45.8M",
  activeMarkets: "1,894",
};

export const MOCK_FEATURED_MARKET = {
  id: "spacex-moon",
  tag: "FEATURED MARKET",
  volume: "~$2.4M Volume",
  titlePrefix: "Will SpaceX achieve a ",
  titleHighlight: "Moon Landing",
  titleSuffix: " before Jan 2026?",
  probability: "68%",
  endsIn: "14d : 22h",
  yesPrice: "68¢",
  noPrice: "32¢",
  currentOdds: "1.47x",
};

// biome-ignore lint/suspicious/noExplicitAny: MOCK_DB allows arbitrary values for simplicity
export const MOCK_DB: Record<string, any> = {
  "spacex-moon": {
    category: "Space",
    subcategory: "EXPLORATION",
    titlePrefix: "Will SpaceX achieve a ",
    titleHighlight: "Moon Landing",
    titleSuffix: " before Jan 2026?",
    probability: "68%",
    volume: "$2.48M",
    liquidity: "$842.1K",
    expiration: "Jan 1, 2026",
    yesPrice: "68.4¢",
    noPrice: "31.6¢",
  },
  "eth-5k": {
    category: "Crypto",
    subcategory: "PRICES",
    titlePrefix: "Will Ethereum reach ",
    titleHighlight: "$5,000",
    titleSuffix: " by the end of Q3?",
    probability: "12%",
    volume: "$842K",
    liquidity: "$210K",
    expiration: "Sep 30",
    yesPrice: "12.0¢",
    noPrice: "88.0¢",
  },
  "gpt-5": {
    category: "Tech & AI",
    subcategory: "LLM BENCHMARKS",
    titlePrefix: "Will ",
    titleHighlight: "GPT-5",
    titleSuffix: " be released before December 31, 2024?",
    probability: "74%",
    volume: "$1.2M",
    liquidity: "$450K",
    expiration: "Dec 31, 2024",
    yesPrice: "74.0¢",
    noPrice: "26.0¢",
  },
  "us-election": {
    category: "Geopolitics",
    subcategory: "US POLITICS",
    titlePrefix: "2024 US Presidential Election: ",
    titleHighlight: "Democrat Win?",
    titleSuffix: "",
    probability: "48%",
    volume: "$12.1M",
    liquidity: "$4.1M",
    expiration: "Nov 5, 2024",
    yesPrice: "48.0¢",
    noPrice: "52.0¢",
  },
};

export const MOCK_VAULT_DATA = {
  stats: {
    netWorth: "$42,905.12",
    change24h: "+12.4%",
  },
  activePositions: [
    {
      id: "btc-100k",
      title: "BTC to $100k by EOY",
      prediction: "YES",
      pnl: "+$1,240",
      pnlColor: "text-primary",
      likelihood: 68,
      progressColor: "bg-primary",
    },
    {
      id: "gpt-5",
      title: "OpenAI GPT-5 Release Q3",
      prediction: "YES",
      pnl: "-$450",
      pnlColor: "text-white",
      likelihood: 32,
      progressColor: "bg-surface-container-high",
    },
    {
      id: "eth-btc-flip",
      title: "ETH/BTC Flip in 2024",
      prediction: "NO",
      pnl: "+$3,100",
      pnlColor: "text-primary",
      likelihood: 84,
      progressColor: "bg-emerald-500",
    },
  ],
  achievements: [
    {
      id: "ach1",
      title: "Streak Master",
      subtitle: "12 Day Run",
      icon: "zap",
      active: true,
    },
    {
      id: "ach2",
      title: "Giant Slayer",
      subtitle: "3 Whale Wins",
      icon: "sword",
      active: false,
    },
    {
      id: "ach3",
      title: "Diversified",
      subtitle: "8/10 Markets",
      icon: "layout-grid",
      active: false,
    },
    {
      id: "ach4",
      title: "Nocturnal",
      subtitle: "Night Trader",
      icon: "moon",
      active: false,
    },
  ],
  settled: [
    {
      id: "super-bowl-lviii",
      title: "Super Bowl LVIII",
      date: "12 Feb",
      pnl: "+$840",
    },
    {
      id: "uk-rate-cut-q1",
      title: "UK Rate Cut Q1",
      date: "04 Mar",
      pnl: "+$1,120",
    },
  ],
  performanceCurve: [
    { id: "b1", h: 1 },
    { id: "b2", h: 2 },
    { id: "b3", h: 3 },
    { id: "b4", h: 4 },
    { id: "b5", h: 3 },
    { id: "b6", h: 2 },
    { id: "b7", h: 4 },
    { id: "b8", h: 3 },
    { id: "b9", h: 2 },
    { id: "b10", h: 5 },
    { id: "b11", h: 4 },
    { id: "b12", h: 6 },
  ],
};
