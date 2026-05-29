/**
 * Report Service
 */
import fs from 'path';

interface ReportOptions {
  outputDir: string;
}

/**
 * Service for saving research reports
 */
export class ReportService {
  private outputDir: string;

  constructor(options: ReportOptions) {
    this.outputDir = options.outputDir;
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate filename from topic
   */
  private generateFilename(topic: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
    const cleanTopic = topic.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').slice(0, 30);
    return `${timestamp}_${cleanTopic}.md`;
  }

  /**
   * Save report to file
   */
  saveReport(topic: string, content: string): string {
    const filename = this.generateFilename(topic);
    const filepath = fs.join(this.outputDir, filename);
    
    const reportWithTitle = `# 研究报告：${topic}\n\n---\n\n${content}`;
    
    fs.writeFileSync(filepath, reportWithTitle, 'utf-8');
    console.log(`📄 Report saved: ${filepath}`);
    
    return filepath;
  }
}