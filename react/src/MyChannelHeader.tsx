import { useChannelStateContext, useChatContext } from 'stream-chat-react';
import { useWatchers } from './useWatchers';
import createChannel from './createChannel';

export default function MyChannelHeader({ channelName }: { channelName: string }) {
  const { channel } = useChannelStateContext();
  const { watchers } = useWatchers({ channel });
  const { client } = useChatContext()
  const aiInChannel =
    (watchers ?? []).filter((watcher) => watcher.includes('ai-bot')).length > 0;
  return (
    <div className='my-channel-header'>
      <h2>{channel?.data?.name ?? 'Chat with an AI'}</h2>

      <button onClick={addOrRemoveAgent}>
        {aiInChannel ? 'Remove AI' : 'Add AI'}
      </button>
      <button onClick = {() => createChannel(client, channelName)}>
        Create Channel
      </button>
    </div>
  );

  async function addOrRemoveAgent() {
    if (!channel) return;
    const endpoint = aiInChannel ? 'stop-ai-agent' : 'start-ai-agent';
    await fetch(`http://127.0.0.1:3000/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: channel.id }),
    });
  }
}
