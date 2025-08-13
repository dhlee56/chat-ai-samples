import type {
  User,
  ChannelSort,
  ChannelFilters,
  ChannelOptions,
} from 'stream-chat';
import {
  useCreateChatClient,
  Chat,
  Channel,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
  AIStateIndicator,
  ChannelHeader,
  Message,
  defaultRenderMessages,
  MessageRenderer
} from 'stream-chat-react';
import styled from 'styled-components';

import 'stream-chat-react/dist/css/v2/index.css';
import MyChannelHeader from './MyChannelHeader';
import MyAIStateIndicator from './MyAIStateIndicator';
import type { Message as StreamMessage } from 'stream-chat';

// your Stream app information
const apiKey = import.meta.env.VITE_STREAM_API_KEY;
const userToken = import.meta.env.VITE_STREAM_TOKEN;
const userId = import.meta.env.VITE_STREAM_USER_ID || 'AIStreamUser1';
const userName = import.meta.env.VITE_STREAM_USER_NAME || 'Dong Lee';

if (!apiKey || !userToken) {
  throw new Error('Missing API key or user token');
}

const user: User = {
  id: userId,
  name: userName,
  image:
    'https://vignette.wikia.nocookie.net/starwars/images/6/6f/Anakin_Skywalker_RotS.png',
};

const sort: ChannelSort = { last_message_at: -1 };
const filters: ChannelFilters = {
  type: 'messaging',
  members: { $in: [userId] },
};
const options: ChannelOptions = {
  limit: 10,
};

const App = () => {
  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: userToken,
    userData: user,
  });

  if (!client) return <div>Setting up client & connection...</div>;

const CustomMessage = ({ message }: { message: StreamMessage }) => {
  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      padding: '10px',
      margin: '5px 0',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div>{message.user?.name}</div>
        <div style={{
          backgroundColor: '#f1f1f1',
          padding: '10px',
          borderRadius: '8px',
          width: '100%',
        }}>
          {message.text}
        </div>
      </div>
    </div>
  );
};
  const customRenderMessages: MessageRenderer = (options) => {
    const elements = defaultRenderMessages(options);
    elements.push(<li key="caught-up">You're all caught up!</li>);
    return elements;
  };
  const ResponsiveMessageList = styled(MessageList)`
    .str-chat__message-list {
      max-width: 100% !important;
      padding: 0 20px;
    }

    .str-chat__message-text {
      max-width: 100% !important;
      
      @media (min-width: 768px) {
        max-width: 70% !important;
      }

      @media (min-width: 1024px) {
        max-width: 80% !important;
      }

      @media (min-width: 1440px) {
        max-width: 90% !important;
      }
    }
  `;
// Use a valid theme string for the Chat component
const theme = 'messaging light';
const channelName = 'ai-chat-channel-again';
return (
  <Chat client={client}>
      <ChannelList filters={filters} sort={sort} options={options} />
      <Channel>
        <Window>
          <MyChannelHeader channelName={channelName}/>
          <ResponsiveMessageList/>   
          {/* <ChannelHeader /> */}
          <MyAIStateIndicator />
          <MessageInput/>
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
};

export default App;
