exports.run = (Bot, message, args) => {

  //Check for Admin Perms
  if (message.member.hasPermission("ADMINISTRATOR")) {

    //Look if the User made something wrong and if he did return an error!
    if (!args[0])
      return message.channel.send('You forgot some paramters!Look at the help!').then(msg => msg.delete(5000));


  }

  let time = args[2];

  //set everything back
  message.mentions.channels.first(1)[0].overwritePermissions(message.guild.id, {
    SEND_MESSAGES: null
  }).then(() => {
    Bot.sql.get("SELECT * FROM mute").then(row => {
      let role = row.muteId;
      message.mentions.channels.first(1)[0].overwritePermissions(role, {
        SEND_MESSAGES: false
      });
      message.channel.send('Chatlock lifted!');
    });
  }).catch(error => {
    console.log(error);
  });

};
