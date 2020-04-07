const Discord = require('discord.js');
exports.run = (Bot, message, args) => {
  //Check if member has admin perms
  if (message.member.hasPermission("ADMINISTRATOR")) {
    //Check if admin set a role
    if (!args[0]) {
      message.reply('You forgot to set an arg!').then(msg => msg.delete(5000));
    } else {
      switch (args[0]) {
        case 'add':
          if (!args[1]) {
            message.reply('You forgot to set a word!').then(msg => msg.delete(5000));
            break;
          }
          Bot.sql.run(`INSERT INTO bannedwords (ServerId, word) VALUES (?, ?)`, [message.guild.id, args[1].toUpperCase()]);
          message.reply(`${args[1].toLowerCase()} has been successfully added!`).then(msg => msg.delete(5000));
          break;
        case 'del':
          if (!args[1]) {
            message.reply('You forgot to set a word!').then(msg => msg.delete(5000));
            break;
          }
          Bot.sql.run(`DELETE FROM bannedwords WHERE (ServerId, word) = (?, ?)`, [message.guild.id, args[1].toUpperCase()]);
          message.reply(`${args[1].toUpperCase()} has been successfully deleted!`).then(msg => msg.delete(5000));
          break;
        case 'clear':
          Bot.sql.run(`DELETE FROM bannedwords WHERE ServerId = ?`, [message.guild.id]);
          message.reply('Banned words have been cleared!').then(msg => msg.delete(5000));
          break;
        case 'list':
          Bot.sql.all(`SELECT * FROM bannedwords WHERE ServerId = ?`, [message.guild.id]).then(rows => {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Banned Words:");
            embed.setAuthor(`${Bot.user.username}`, `${Bot.user.displayAvatarURL}`);
            embed.setThumbnail(`${Bot.user.displayAvatarURL}`);
            embed.setTimestamp();
            for (var i = 0, len = rows.length; i < len; i++) {
              embed.addField(`${rows[i].word}`, "Banned Word");
              if (i > 20) {break;}
            }
            message.reply({embed}).catch(console.error());
          }).catch(console.error());
          break;
        case 'bypass':
          if (message.mentions.roles.size >= 1) {
            Bot.sql.run(`INSERT INTO bannedwordsbypass (ServerId, roleId) VALUES (?, ?)`, [message.guild.id, message.mentions.roles.first(1)[0].id]);
            message.reply(`@${message.mentions.roles.first(1)[0].name} has been successfully added!`).then(msg => msg.delete(5000));
            break;
          } else {
            message.channel.send(`You have forgotten to mention a Role!`).then(msg => msg.delete(5000));
            break;
          }
          break;
        case 'delbypass':
          if (message.mentions.roles.size >= 1) {
            Bot.sql.run(`DELETE FROM bannedwordsbypass WHERE (ServerId, roleId) = (?, ?)`, [message.guild.id, message.mentions.roles.first(1)[0].id]);
            message.reply(`${message.mentions.roles.first(1)[0].name} has been successfully deleted!`).then(msg => msg.delete(5000));
            break;
          } else {
            message.channel.send(`You have forgotten to mention a Role!`).then(msg => msg.delete(5000));
            break;
          }
          break;
      }
    }
  }
};
