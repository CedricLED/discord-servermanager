exports.run = (Bot, message, args) => {

  //Check for Admin Perms
  if (message.member.hasPermission("ADMINISTRATOR")) {

    //Look if the User made something wrong and if he did return an error!
    if (!args[0] || !args[1] || !args[2])
      return message.channel.send('You forgot some paramters!Look at the help!').then(msg => msg.delete(5000));


    let time = args[2];

    message.mentions.channels.first(1)[0].overwritePermissions(message.guild.id, {
      SEND_MESSAGES: false
    }).then(() => {
      Bot.sql.get(`SELECT * FROM logchannel`).then(row => {
        //If the Channel is found (not undefined) Message will be sent!
        if (typeof row !== 'undefined') {
          let popped = args.pop();
          message.guild.channels.get(`${row.logChannel}`).send("", {
            embed: {
              'title': `Channel locked down`,
              "description": `**Reason:** ${args.slice(1).join(" ")}\n**Moderator:** ${message.author}\n**Time:** ${time}\n**Channel:** ${message.mentions.channels.first(1)[0]}`,
              "timestamp": new Date()
            }
          });
        }
      });
      message.mentions.channels.first(1)[0].send("", {
        embed: {
          'title': `Channel locked down for ${time} Seconds!`
        }
      }).then(() => {
        setTimeout(() => {
          message.mentions.channels.first(1)[0].overwritePermissions(message.guild.id, {
            SEND_MESSAGES: null
          }).then(message.channel.send('Lockdown lifted.')).catch(console.error);

          Bot.sql.get("SELECT * FROM mute").then(row => {
            message.mentions.channels.first(1)[0].overwritePermissions(row.muteId, {
              SEND_MESSAGES: false
            });
          });

        }, time * 1000);


      }).catch(error => {
        console.log(error);
      });
    }).catch(error => {
      console.log(error);
    });
  }


};
