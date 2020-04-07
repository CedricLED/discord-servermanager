exports.run = (Bot, message, args) => {
  //Check if has Permissions
  if (message.member.hasPermission("ADMINISTRATOR")) {
    //Check if on or off
    if (args[0] == 'on') {
      //Check for channel mention
      if (message.mentions.roles.size >= 1) {
        //Set Id in DB and return a Message
        Bot.sql.run(`INSERT INTO auto (roleId) VALUES (?)`, [message.mentions.roles.first(1)[0].id]);
        message.channel.send(`Autorole has been successfully set!`).then(msg => msg.delete(5000));
      } else
        //Message
        return message.channel.send(`You have forgotten to mention a Role!`).then(msg => msg.delete(5000));
    } else {
      Bot.sql.run(`DELETE FROM auto`);
      message.channel.send(`Autorole has been successfully disabled!`).then(msg => msg.delete(5000));
    }
  }
};
