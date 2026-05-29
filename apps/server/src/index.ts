/**
 * Server Entry Point
 */
import 'dotenv/config';
import { createServer } from './app';

const PORT = parseInt(process.env.PORT || '3001', 10);
const OUTPUT_DIR = process.env.OUTPUT_DIR || './reports';

const server = createServer({ port: PORT, outputDir: OUTPUT_DIR });

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Research API: http://localhost:${PORT}/api/research`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Reports saved to: ${OUTPUT_DIR}`);
  
  if (!process.env.MINIMAX_API_KEY) {
    console.log('⚠️  Warning: MINIMAX_API_KEY not set in environment');
  } else {
    console.log('✅ MiniMax API key loaded');
  }
});