/**
 * MCP Bridge Function for Neo N3
 * 
 * This function serves as a bridge between the chat interface and Neo N3 MCP operations.
 * It allows the AI to perform actual blockchain operations on behalf of the user.
 */

const axios = require('axios');

// Map of available MCP operations
const MCP_OPERATIONS = {
  // Blockchain information
  get_blockchain_info: async (params) => {
    const { network = 'mainnet' } = params;
    // Call blockchain info endpoint
    return await callMcpEndpoint('getBlockchainInfo', { network });
  },
  
  // Account balance
  get_balance: async (params) => {
    const { address, network = 'mainnet' } = params;
    if (!address) throw new Error("Address is required for get_balance operation");
    
    // Call balance endpoint
    return await callMcpEndpoint('getAddressBalance', { address, network });
  },
  
  // Block information
  get_block: async (params) => {
    const { block_height, block_hash, network = 'mainnet' } = params;
    
    if (!block_height && !block_hash) {
      throw new Error("Either block_height or block_hash is required for get_block operation");
    }
    
    // Call get block endpoint
    return await callMcpEndpoint('getBlock', { 
      blockHeight: block_height, 
      blockHash: block_hash,
      network 
    });
  },
  
  // Transaction information
  get_transaction: async (params) => {
    const { tx_hash, network = 'mainnet' } = params;
    if (!tx_hash) throw new Error("Transaction hash is required for get_transaction operation");
    
    // Call transaction endpoint
    return await callMcpEndpoint('getTransaction', { txHash: tx_hash, network });
  },
  
  // Smart contract operations
  call_contract: async (params) => {
    const { contract_hash, method, args = [], network = 'mainnet' } = params;
    
    if (!contract_hash) throw new Error("Contract hash is required for call_contract operation");
    if (!method) throw new Error("Method name is required for call_contract operation");
    
    // Call contract endpoint
    return await callMcpEndpoint('invokeRead', { 
      scriptHash: contract_hash,
      operation: method,
      args,
      network
    });
  }
};

/**
 * Helper function to call the MCP API endpoints
 */
async function callMcpEndpoint(endpoint, params) {
  try {
    // In a production environment, you would replace this with your actual Neo N3 MCP API endpoint
    // For now, we'll route through the API playground function which already exists
    const response = await axios.post('/.netlify/functions/api-playground', {
      endpoint,
      ...params
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error calling MCP endpoint ${endpoint}:`, error);
    throw new Error(`Failed to execute MCP operation: ${error.message}`);
  }
}

exports.handler = async function(event, context) {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }
  
  // Only accept POST requests with JSON body
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed. Please use POST.' })
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    const { operation, params = {} } = data;
    
    // Validate that operation is supported
    if (!operation || !MCP_OPERATIONS[operation]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: `Unsupported operation. Available operations: ${Object.keys(MCP_OPERATIONS).join(', ')}`
        })
      };
    }
    
    // Execute the operation
    const result = await MCP_OPERATIONS[operation](params);
    
    // Return the result
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation,
        result,
        success: true
      })
    };
  } catch (error) {
    console.error('MCP Bridge error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message || 'Failed to execute MCP operation',
        success: false
      })
    };
  }
}; 