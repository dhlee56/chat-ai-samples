import { StreamChat, Channel, User } from 'stream-chat';

export interface ChannelData {
  name: string;
  description: string;
  type: 'messaging' | 'team' | 'gaming';
  members: string[];
}

export interface CreateChannelProps {
  onClose: () => void;
  onSuccess?: (channel: Channel) => void;
}