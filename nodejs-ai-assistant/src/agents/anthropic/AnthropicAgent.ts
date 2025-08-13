import Anthropic from '@anthropic-ai/sdk';
import { AnthropicResponseHandler } from './AnthropicResponseHandler';
import type { MessageParam } from '@anthropic-ai/sdk/src/resources/messages';
import type { Channel, DefaultGenerics, Event, StreamChat } from 'stream-chat';
import type { AIAgent } from '../types';

export class AnthropicAgent implements AIAgent {
  private anthropic?: Anthropic;
  private handlers: AnthropicResponseHandler[] = [];
  private lastInteractionTs = Date.now();

  constructor(
    readonly chatClient: StreamChat,
    readonly channel: Channel,
  ) {}

  dispose = async () => {
    this.chatClient.off('message.new', this.handleMessage);
    await this.chatClient.disconnectUser();

    this.handlers.forEach((handler) => handler.dispose());
    this.handlers = [];
  };

  getLastInteraction = (): number => this.lastInteractionTs;

  init = async () => {
    const apiKey = process.env.ANTHROPIC_API_KEY as string | undefined;
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }
    this.anthropic = new Anthropic({ apiKey });

    this.chatClient.on('message.new', this.handleMessage);
    console.log('Anthropic Agent initialized');
  };

  private handleMessage = async (e: Event<DefaultGenerics>) => {
    console.log('Handling new message event:', e.type);
    if (!this.anthropic) {
      console.error('Anthropic SDK is not initialized');
      return;
    }

    if (!e.message || e.message.ai_generated) {
      console.log('Skip handling ai generated message');
      return;
    }

    const message = e.message.text;
    if (!message) return;
    console.log('Received message:', message);

    this.lastInteractionTs = Date.now();

    const messages = this.channel.state.messages
      .slice(-5)
      .filter((msg) => msg.text && msg.text.trim() !== '')
      .map<MessageParam>((message) => ({
        role: message.user?.id.startsWith('ai-bot') ? 'assistant' : 'user',
        content: message.text || '',
      }));

      console.log('# of Messages to send to Anthropic:', messages.length);

    if (e.message.parent_id !== undefined) {
      console.log('Message is a reply, adding parent message');
      messages.push({
        role: 'user',
        content: message,
      });
    }

    const anthropicStream = await this.anthropic.messages.create({
      max_tokens: 1024,
      messages,
      model: 'claude-3-5-sonnet-20241022',
      stream: true,
    });

    if (!anthropicStream) {
      console.error('Failed to create Anthropic message stream');
      return;
    }
    console.log('Anthropic message stream created:', anthropicStream);
    const { message: channelMessage } = await this.channel.sendMessage({
      text: '',
      ai_generated: true,
    });

    console.log('Channel message sent:', channelMessage);
    
    try {
      await this.channel.sendEvent({
        type: 'ai_indicator.update',
        ai_state: 'AI_STATE_THINKING',
        message_id: channelMessage.id,
      });
    } catch (error) {
      console.error('Failed to send ai indicator update', error);
    }

    await new Promise((resolve) => setTimeout(resolve, 750));

    const handler = new AnthropicResponseHandler(
      anthropicStream,
      this.chatClient,
      this.channel,
      channelMessage,
    );
    handler.run();
    this.handlers.push(handler);
  };
}
