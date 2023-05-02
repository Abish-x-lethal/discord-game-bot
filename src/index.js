require("dotenv").config();
const { Client, IntentsBitField,Collection } = require("discord.js");
const Jumble = require("jumble-words");
const { finished } = require("stream");
const { setTimeout } = require("timers/promises");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],
});
let count = 0;
let map = new Collection();
let point = new Collection();

const jumbleWords = new Jumble();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
  // if(msg.content===""){
  //   msg.reply("");
  // }

  if (msg.author.bot) return;
  if (msg.content === ".jumble") {
    if (map.has(msg.channelId))
     return msg.reply("**Game is already running in this channel you dumb fuck**");
 else
    map.set(msg.channelId,"jumble");
    msg.channel
      .send("**Game starting (Total of ten rounds)...**")
      .then(async (newMsg) => {
        await setTimeout(2000);
        await newMsg.edit("**Loading jumble words ...**");

        const data = jumbleWords.generate(12);
        console.log(data);

        let interval = setInterval(
          function (dat) {
            count += 1;

            if (count === 11) {
              map.delete(msg.channelId);
              clearInterval(interval);
              console.log(map);
              const users = point.map((p,u)=>{
                const user = client.users.resolve(u);
                return (`${user.username} : ${p}`);


              })
              point.clear();
              return msg.channel.send(`**Timeout! Game over**\n${users.join('\n')}`);
            }
            const { jumble, word } = dat[count];

            msg.channel.send(`**Your word is : ${jumble} **`);

            console.log(word);

            const filter = (m) => m.channel === msg.channel;
            const collector = msg.channel.createMessageCollector({
              filter,
              time: 11000,
            });
            

            collector.on("collect", (m) => {
              if(m.author.bot){
                return ;
              }else{
                console.log(`Collected ${m.content} by ${m.author.username}`);
              }
             
              // console.log(m.author.username);
              if (m.content === word) {
                const oldPoint = point.get(m.author.id) || 0;
                point.set(m.author.id, oldPoint + 1);
                
                msg.channel.send(`**${m.author.username} Guessed Correctly!. Good job sucker**`);
                collector.stop("Finished");
              }
            });
            collector.on("end", (m_, reason) => {
              if (reason === "Finished") {
                return;
              }
              if(count!=10){
              msg.channel.send("**Timeout! Loading next words...**");
              }
            });
          },
          13000,
          data,
          
        );
      });
  }
});

client.login(process.env.CLIENT_TOKEN);
  
      
              
