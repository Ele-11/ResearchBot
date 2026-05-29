/**
 * Config Module
 */
export const config = {
  minimax: {
    baseUrl: process.env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1',
    model: process.env.MINIMAX_MODEL || 'MiniMax-M2',
    temperature: parseFloat(process.env.MINIMAX_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.MINIMAX_MAX_TOKENS || '4096', 10),
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    outputDir: process.env.OUTPUT_DIR || './reports',
  },
};