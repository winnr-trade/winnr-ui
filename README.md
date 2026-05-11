# Winnr UI

User interface for the [winnr.trade](https://winnr.trade) web application (Live at [try.winnr.trade](https://try.winnr.trade)).

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

### Configuration

Create a `.env.local` file based on `.env.example`:

```bash
NEXT_PUBLIC_ROLLUP_ENDPOINT=
NEXT_PUBLIC_INDEXER_API_BASE_URL=
NEXT_PUBLIC_TEST_USER_PRIVATE_KEY=...
USDC_MINTER_PRIVATE_KEY=  # Only needed for local faucet functionality
```

### Development

Run the development server:

```bash
bun dev
```

### Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
bun lint    # Check for linting issues
bun format  # Format the entire codebase
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
