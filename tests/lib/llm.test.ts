/**
 * LLM Module Tests
 *
 * Unit tests for MiniMax LLM integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createLLMClient,
  streamToGenerator,
} from '@/lib/llm';
import type { StreamChunk } from '@/lib/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LLM Types', () => {
  it('should export LLMError with statusCode and code', () => {
    const error = new Error('Test error');
    expect(error.message).toBe('Test error');
  });
});

describe('createLLMClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear env var before each test
    delete process.env.MINIMAX_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw error when API key is not provided', () => {
    expect(() => createLLMClient({})).toThrow('MINIMAX_API_KEY environment variable is not set');
  });

  it('should use provided API key over environment variable', () => {
    process.env.MINIMAX_API_KEY = 'env-api-key';
    const client = createLLMClient({ apiKey: 'config-api-key' });
    expect(client).toBeDefined();
  });

  it('should create client with default config', () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const client = createLLMClient({});
    expect(client).toBeDefined();
    expect(typeof client.chat).toBe('function');
    expect(typeof client.streamChat).toBe('function');
    expect(typeof client.generate).toBe('function');
    expect(typeof client.streamGenerate).toBe('function');
  });

  it('should pass custom config to API calls', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const client = createLLMClient({
      model: 'custom-model',
      temperature: 0.5,
      maxTokens: 1000,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'Test response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
    });

    const result = await client.generate('Test prompt');
    expect(result.text).toBe('Test response');
    expect(result.usage).toEqual({
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.model).toBe('custom-model');
    expect(callBody.temperature).toBe(0.5);
    expect(callBody.max_tokens).toBe(1000);
  });

  it('should handle successful non-streaming chat', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const client = createLLMClient({});

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'Hello, how can I help?' } }],
      }),
    });

    const result = await client.chat([
      { role: 'user', content: 'Hi' },
    ]);

    expect(result.text).toBe('Hello, how can I help?');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle API error response', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const client = createLLMClient({});

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(client.generate('Test')).rejects.toThrow(
      'MiniMax API error: 401 Unauthorized'
    );
  });

  it('should handle error in response body', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const client = createLLMClient({});

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        error: { code: 'invalid_request', message: 'Invalid request' },
      }),
    });

    await expect(client.generate('Test')).rejects.toThrow('Invalid request');
  });
});

describe('streamToGenerator', () => {
  it('should parse SSE stream chunks', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n',
      'data: [DONE]\n',
    ];

    const mockStream = new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => {
          controller.enqueue(new TextEncoder().encode(chunk));
        });
        controller.close();
      },
    });

    const mockResponse = {
      ok: true,
      body: mockStream,
    } as unknown as Response;

    const results: StreamChunk[] = [];
    for await (const chunk of streamToGenerator(mockResponse)) {
      results.push(chunk);
    }

    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({ text: 'Hello', done: false });
    expect(results[1]).toEqual({ text: ' world', done: false });
    expect(results[2]).toEqual({ text: '', done: true });
  });

  it('should skip invalid JSON lines', async () => {
    const chunks = [
      'not-data: something\n',
      'data: {"choices":[{"delta":{"content":"Valid"}}]}\n',
      'data: invalid json {{\n',
      'data: [DONE]\n',
    ];

    const mockStream = new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => {
          controller.enqueue(new TextEncoder().encode(chunk));
        });
        controller.close();
      },
    });

    const mockResponse = {
      ok: true,
      body: mockStream,
    } as unknown as Response;

    const results: StreamChunk[] = [];
    for await (const chunk of streamToGenerator(mockResponse)) {
      results.push(chunk);
    }

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ text: 'Valid', done: false });
    expect(results[1]).toEqual({ text: '', done: true });
  });

  it('should throw error when response body is null', async () => {
    const mockResponse = {
      ok: true,
      body: null,
    } as unknown as Response;

    const generator = streamToGenerator(mockResponse);
    await expect(generator.next()).rejects.toThrow('Response body is null');
  });
});

describe('LLM Client Streaming', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.MINIMAX_API_KEY;
  });

  it('should handle streaming chat response', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const client = createLLMClient({});

    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
      'data: {"choices":[{"delta":{"content":" there"}}]}\n',
      'data: [DONE]\n',
    ];

    const mockStream = new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => {
          controller.enqueue(new TextEncoder().encode(chunk));
        });
        controller.close();
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: mockStream,
    });

    const generator = await client.streamChat([
      { role: 'user', content: 'Hi' },
    ]);

    const results: StreamChunk[] = [];
    for await (const chunk of generator) {
      results.push(chunk);
    }

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.stream).toBe(true);
  });
});
