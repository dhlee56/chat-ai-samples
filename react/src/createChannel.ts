
const createChannel = async (client: any, channelName: string) => {
  try {
    //const client = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY)

    const channel = client.channel('messaging', channelName, {
      name: channelName,
      members: [client.user.id],
      image: 'https://getstream.io/random_png/?id=channel-image&name=Channel+Image',
    });

    await channel.create();
    console.log(`Channel created: ${channel.id}`);
    return channel;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
}   

export default createChannel;