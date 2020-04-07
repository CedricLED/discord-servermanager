exports.run = (Bot, message, args) => {
  //Get the muted Role
  if (message.member.hasPermission("ADMINISTRATOR")) {

    if (!args[0] || !args[1] || !args[2]) {
      return message.channel.send("You forgot to mention someone or giving reason/time").then(msg => msg.delete(6000));
    }
    let popped = args.pop();
    let toMute = message.guild.members.get(message.mentions.users.first(1)[0].id);

    Bot.sql.get("SELECT * FROM mute").then(row => {
      if (typeof row === 'undefined')
        return message.channel.send("Error muted Role not found?Did you deleted it?").then(msg => msg.delete(6000));
      toMute.addRole(row.muteId, args.slice(1).join(" ")).catch(console.error);
      console.log(args[2]);
      console.log(args);
      toMute.user.send(`Hey you got Muted for ${popped} Seconds because of: ${args.slice(1).join(" ")}`);
      setTimeout(function() {
        toMute.removeRole(row.muteId, "Times up!");
        toMute.user.send(`Hey you got unmuted`);
      }, popped * 1000);
    });




    Bot.sql.get(`SELECT * FROM logchannel`).then(row => {
      //If the Channel is found (not undefined) Message will be sent!
      if (typeof row !== 'undefined')
        return message.guild.channels.get(`${row.logChannel}`).send("", {
          embed: {
            'title': `User ${message.mentions.users.first(1)[0].username} muted`,
            "description": `**Reason:** ${args.pop.slice(1).join(" ")}\n**Moderator:** ${message.author}`,
            "timestamp": new Date()
          }
        });
    });

  }
};
