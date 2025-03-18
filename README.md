# Neo N3 MCP Server

<p align="center">
  <img src="logo/logo.png" alt="Neo N3 Logo" width="100"/>
</p>

An MCP server that provides seamless integration with the Neo N3 blockchain, allowing Claude to interact with blockchain data, manage wallets, transfer assets, and invoke smart contracts.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16-green.svg)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://www.docker.com/)
[![NPM](https://img.shields.io/badge/npm-package-red.svg)](https://www.npmjs.com/package/@r3e/neo-n3-mcp)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/R3E-Network/neo-n3-mcp/actions)
[![Test Status](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/R3E-Network/neo-n3-mcp/actions)

## 📚 Documentation

- [API Reference](API.md) - Detailed API documentation for all tools and resources
- [Deployment Guide](DEPLOYMENT.md) - Comprehensive deployment options and configuration
- [Testing Guide](TESTING.md) - Testing approach and instructions for verifying functionality
- [Architecture](ARCHITECTURE.md) - Detailed system architecture and design decisions
- [Network Architecture](NETWORKS.md) - Dual-network support and configuration details

## 🚀 Features

- **Dual Network Support**: Interact with both Neo N3 mainnet and testnet networks in a single server
- **Blockchain Information**: Query blockchain height, validators, and network status
- **Block & Transaction Data**: Get detailed information about blocks and transactions
- **Account Management**: Check balances, create and import wallets securely
- **Asset Operations**: Transfer NEO, GAS, and other tokens between addresses
- **Smart Contract Interaction**: Deploy and invoke smart contracts on the Neo N3 blockchain
- **Security Focused**: Input validation, secure wallet storage, and protection of private keys
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **One-Click Installation**: Simple setup process for Claude integration

## Configuration with MCP

You can easily add the Neo N3 MCP server to your Claude MCP configuration in different ways:

### Using NPM (Recommended for Quick Start)

Add this to your `claude_desktop_config.json` or MCP settings:

```json
{
  "mcpServers": {
    "neo-n3": {
      "command": "npx",
      "args": [
        "-y",
        "@r3e/neo-n3-mcp"
      ]
    }
  }
}
```

This will automatically download and run the Neo N3 MCP server without any local installation.

### Using Docker

Add this to your `claude_desktop_config.json` or MCP settings:

```json
{
  "mcpServers": {
    "neo-n3": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "r3e/neo-n3-mcp"
      ]
    }
  }
}
```

To build the Docker image locally:

```bash
docker build -t r3e/neo-n3-mcp .
```

## Installation

### Using Docker (recommended)

```bash
# Clone the repository
git clone https://github.com/R3E-Network/neo-n3-mcp.git
cd neo-n3-mcp

# Start the server with Docker Compose
docker-compose up -d
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/R3E-Network/neo-n3-mcp.git
cd neo-n3-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Adding to MCP Settings

To add the Neo N3 MCP server to your MCP settings, you can use the provided script:

```bash
# Build the project first
npm run build

# Add to MCP settings
npm run add-to-mcp
```

This will automatically add the Neo N3 MCP server to your Claude MCP settings file, making it available for use with Claude.

## Configuration

The server can be configured using environment variables:

- `NEO_RPC_URL`: Default URL of the Neo N3 RPC node (default: http://localhost:10332)
- `NEO_MAINNET_RPC_URL`: URL of the Neo N3 mainnet RPC node (default: same as NEO_RPC_URL or http://seed1.neo.org:10332)
- `NEO_TESTNET_RPC_URL`: URL of the Neo N3 testnet RPC node (default: https://testnet1.neo.coz.io:443)
- `NEO_NETWORK`: Default network type: 'mainnet' or 'testnet' (default: mainnet)
- `WALLET_PATH`: Path to the wallet files (default: ./wallets)
- `LOG_LEVEL`: Log level: 'debug', 'info', 'warn', 'error' (default: info)
- `LOG_CONSOLE`: Whether to log to console (default: true)
- `LOG_FILE`: Whether to log to file (default: false)
- `LOG_FILE_PATH`: Path to log file (default: ./logs/neo-n3-mcp.log)
- `MAX_REQUESTS_PER_MINUTE`: Maximum number of requests per minute (default: 60)
- `REQUIRE_CONFIRMATION`: Whether to require confirmation for sensitive operations (default: true)

## Usage

### Tools

All tools now support an optional `network` parameter to specify which network to use ('mainnet' or 'testnet').

#### get_blockchain_info

Get general information about the Neo N3 blockchain.

```json
{
  "name": "get_blockchain_info",
  "arguments": {
    "network": "testnet"
  }
}
```

#### get_block

Get block details by height or hash.

```json
{
  "name": "get_block",
  "arguments": {
    "hashOrHeight": 12345,
    "network": "mainnet"
  }
}
```

#### get_transaction

Get transaction details by hash.

```json
{
  "name": "get_transaction",
  "arguments": {
    "txid": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "network": "testnet"
  }
}
```

#### get_balance

Get account balance for a specific address.

```json
{
  "name": "get_balance",
  "arguments": {
    "address": "NXV7ZhHiyM1aHXwvUNBLNAkCwZ6wgeKyMZ",
    "network": "mainnet"
  }
}
```

#### transfer_assets

Transfer assets between addresses.

```json
{
  "name": "transfer_assets",
  "arguments": {
    "fromWIF": "KwDZGCUXYAB1cUNmZKQ5RFUBAYPjwXvpavQQHvpeH1qM5pJ3zurn",
    "toAddress": "NXV7ZhHiyM1aHXwvUNBLNAkCwZ6wgeKyMZ",
    "asset": "NEO",
    "amount": "1",
    "confirm": true,
    "network": "testnet"
  }
}
```

#### invoke_contract

Invoke a smart contract method.

```json
{
  "name": "invoke_contract",
  "arguments": {
    "fromWIF": "KwDZGCUXYAB1cUNmZKQ5RFUBAYPjwXvpavQQHvpeH1qM5pJ3zurn",
    "scriptHash": "0x8c23f196d8a1bfd103a9dcb1f9ccf0c611377d3b",
    "operation": "transfer",
    "args": [
      {
        "type": "Hash160",
        "value": "NXV7ZhHiyM1aHXwvUNBLNAkCwZ6wgeKyMZ"
      },
      {
        "type": "Hash160",
        "value": "NXV7ZhHiyM1aHXwvUNBLNAkCwZ6wgeKyMZ"
      },
      {
        "type": "Integer",
        "value": "1"
      },
      {
        "type": "Any",
        "value": null
      }
    ],
    "confirm": true,
    "network": "testnet"
  }
}
```

#### create_wallet

Create a new wallet.

```json
{
  "name": "create_wallet",
  "arguments": {
    "password": "your-secure-password",
    "network": "mainnet"
  }
}
```

#### import_wallet

Import an existing wallet from WIF or encrypted key.

```json
{
  "name": "import_wallet",
  "arguments": {
    "key": "KwDZGCUXYAB1cUNmZKQ5RFUBAYPjwXvpavQQHvpeH1qM5pJ3zurn",
    "password": "your-secure-password",
    "network": "testnet"
  }
}
```

### Resources

#### Neo N3 Network Status

Default network (based on configuration):
```
neo://network/status
```

Specific networks:
```
neo://mainnet/status
neo://testnet/status
```

#### Neo N3 Block by Height

Default network:
```
neo://block/{height}
```

Specific networks:
```
neo://mainnet/block/{height}
neo://testnet/block/{height}
```

#### Neo N3 Address Balance

Default network:
```
neo://address/{address}/balance
```

Specific networks:
```
neo://mainnet/address/{address}/balance
neo://testnet/address/{address}/balance
```

## Testing

The Neo N3 MCP server includes comprehensive tests to ensure its functionality. There are two primary ways to run tests:

### Using Jest (TypeScript Tests)

Jest tests provide comprehensive testing with proper mocking:

```bash
# Install dependencies first
npm install

# Run Jest tests
npm test
```

The test suite includes tests for:
- Blockchain information retrieval
- Block and transaction data access
- Account balance queries
- Wallet creation and import
- Asset transfers
- Smart contract invocation

### Using Simple Test Runner (JavaScript)

A simplified JavaScript test runner is also available for quick testing:

```bash
# Run the simplified test
node tests/simple-test.js
```

This test covers the core API functionality without requiring TypeScript compilation.

## Development and Contributing

### Publishing

To publish the package to NPM and/or Docker registries:

```bash
# Publish to NPM
npm run publish:npm

# Build and publish Docker image
npm run publish:docker

# Publish to both
npm run publish:all
```

### Development Setup

For development, use:

```bash
# Build with TypeScript watching
npm run dev
```

## Security Considerations

- Private keys are never exposed in responses
- Sensitive operations (transfers, contract invocations) require explicit confirmation
- Input validation is performed for all parameters
- Error messages are designed to be informative without exposing sensitive information

## Technical Details

### Service Architecture

The Neo N3 MCP server is structured around several key components:

1. **MCP Interface**: Implemented in `src/index.ts` - Handles MCP protocol communication
2. **Neo Service**: Implemented in `src/services/neo-service.ts` - Core Neo N3 blockchain interactions
3. **Validation**: Implemented in `src/utils/validation.ts` - Parameter validation
4. **Error Handling**: Implemented in `src/utils/error-handler.ts` - Standardized error responses

### Error Handling

Errors are standardized through the `handleError` function which:
- Converts Neo N3 specific errors to user-friendly messages
- Masks sensitive information
- Provides clear actionable information to users

### Networking

The server automatically handles network retries and errors when connecting to the Neo N3 blockchain network. Connection parameters like timeouts and retry attempts can be configured through environment variables.

## Project Structure

The project is organized as follows:

```
neo-n3-mcp/
├── src/
│   ├── services/
│   │   └── neo-service.ts       # Core Neo N3 blockchain interaction
│   ├── utils/
│   │   ├── validation.ts        # Input validation
│   │   └── error-handler.ts     # Error handling and responses
│   ├── config.ts                # Configuration settings
│   └── index.ts                 # MCP server and tool definitions
├── tests/
│   ├── neo-service.test.ts      # Jest tests for NeoService
│   └── simple-test.js           # Simple JavaScript test runner
├── scripts/
│   ├── add-to-mcp-settings.js   # Script to add to MCP settings
│   ├── publish-npm.js           # Script to publish to NPM
│   └── publish-docker.sh        # Script to build and publish Docker image
├── wallets/                     # Wallet storage directory
├── dist/                        # Compiled TypeScript output
├── docker-compose.yml           # Docker Compose configuration
├── Dockerfile                   # Docker container definition
├── package.json                 # Node.js package definition
└── tsconfig.json                # TypeScript configuration
```

## Acknowledgments

This project would not be possible without the following:

- [**@cityofzion/neon-js**](https://github.com/CityOfZion/neon-js) - The official JavaScript SDK for Neo N3 blockchain, providing the core functionality for interacting with the Neo N3 network. Special thanks to the City of Zion team for their ongoing development and maintenance of this essential library.
- [**MCP Protocol**](https://github.com/modelcontextprotocol) - For providing the standardized protocol for AI systems to interact with external tools and resources.

## License

This MCP server is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
