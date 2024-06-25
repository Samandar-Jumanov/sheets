import bot from "../lib/bot"

export const sendNotification = async (  message : string , data : any  ) => {
    bot.on('message', (msg) => {
        const formattedData = JSON.stringify(data, null, 2);
        bot.sendMessage(msg.chat.id, `${message}\n\n${formattedData}`);
      });
};


