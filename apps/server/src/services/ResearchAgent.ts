/**
 * Research Agent Service
 * 
 * Agent that uses tools (BingSearch) to research topics before generating reports.
 */
import { createSearchTool } from '@researchbot/langchain-tools';
import { config } from '../config';

interface ResearchResult {
  searchResults: string;
  report: string;
}

/**
 * Research Agent
 * 
 * Uses BingSearchTool to gather information, then generates report.
 */
export class ResearchAgent {
  private searchTool = createSearchTool();

  constructor() {
    // Tool is ready
  }

  /**
   * Run research with tool use
   * 1. Search for relevant information
   * 2. Generate report based on search results
   */
  async *research(topic: string): AsyncGenerator<string, void, unknown> {
    // Step 1: Search for relevant information
    yield '🔍 正在搜索相关信息...';
    let searchResults = '';
    
    try {
      const rawResults = await this.searchTool.invoke(topic);
      searchResults = rawResults;
      yield `✅ 搜索完成，找到相关内容\n\n`;
    } catch (error) {
      console.error('Search error:', error);
      searchResults = '搜索失败，将直接生成报告';
    }

    // Step 2: Generate report based on search results
    yield '📝 正在生成研究报告...\n\n';

    // Build prompt with search context
    const prompt = this.buildResearchPrompt(topic, searchResults);
    
    // Stream the LLM response
    const miniMax = this.createMiniMaxClient();
    
    try {
      for await (const chunk of miniMax.streamChat(prompt)) {
        yield chunk;
      }
    } catch (error) {
      console.error('LLM error:', error);
      throw error;
    }
  }

  /**
   * Build research prompt with search context
   */
  private buildResearchPrompt(topic: string, searchResults: string): Array<{ role: string; content: string }> {
    const systemPrompt = `你是一个专业的AI研究助手。请根据用户的研究主题和搜索到的相关信息，生成一份详细的中文研究报告。

报告格式要求：
- 标题
- 摘要（简要概述）
- 主要发现（分点详细说明）
- 结论（总结和展望）

注意：如果搜索到了相关网页信息，请结合这些信息来生成报告，引用相关的URL来源。`;

    const userContent = `研究主题：${topic}

${searchResults !== '搜索失败，将直接生成报告' ? `搜索到的相关信息：
${searchResults}` : ''}

请基于以上信息，生成一份详细的研究报告。`;

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ];
  }

  /**
   * Create MiniMax client for streaming
   */
  private createMiniMaxClient() {
    const MINIMAX_BASE_URL = config.minimax.baseUrl;
    const DEFAULT_MODEL = config.minimax.model;
    const apiKey = process.env.MINIMAX_API_KEY;

    if (!apiKey) {
      throw new Error('MINIMAX_API_KEY environment variable is not set');
    }

    async function* streamChat(messages: Array<{ role: string; content: string }>): AsyncGenerator<string> {
      const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages,
          temperature: config.minimax.temperature || 0.7,
          max_tokens: config.minimax.maxTokens || 4096,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`MiniMax API error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content || '';
            if (text) yield text;
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    return { streamChat };
  }
}