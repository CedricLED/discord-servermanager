const Discord = require('discord.js');



exports.run = (client, message, args) => {

  let reply = (m) => {
    return message.reply(m).then(m => m.delete(7000)).catch(console.error);
  };

  if (!args[0]) return reply(`Please tell me what you'd like to do!`);

  let userMention = message.mentions.users.first();
  let roleMention = message.mentions.roles.first();
  let actionWanted = args[0].toLowerCase();



  if (actionWanted == "+" || actionWanted == "-") {
    if (!userMention) return reply(`Please mention a user you'd like to give reputation points to!`);
    if (actionWanted == "+") {
      client.database.reputation.AddRep(message.author.id, message.guild.id, 1).then(() => {
        message.reply(`You just gave ${userMention.tag} 1 reputation point!`);
      });
    } else if (actionWanted == "-") {
      client.database.reputation.MinRep(message.author.id, message.guild.id, 1).then(() => {
        message.reply(`You just gave ${userMention.tag} 1 less reputation point!`);
      });
    }

  } else if (actionWanted == "info") {
    if (!userMention) userMention = message.author;
    client.database.reputation.HandleUser(userMention.id, message.guild.id).then(userData => {
      console.log(userData);
      let makeEmbed = new Discord.RichEmbed()
        .setTitle(`${userMention.username}'s reputation`)
        .setDescription(`${userMention.username} has ${userData.Reputation} reputation points!`);
      message.channel.send(makeEmbed);
    }).catch(e => {
      message.channel.send(`Failed to get data for ${userMention.tag}!`);
      console.error(e);
    });
  } else if (actionWanted == "set") {
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You need administrator privelegies/permissions to use this command!`);
    if (!userMention) return message.reply(`Please mention a user you'd like to set the points to!`);
    let reqNum = Number(args[2]);
    if (!reqNum) return message.reply(`Please supply the amount of reputation points the user should have!`);
    client.database.reputation.SetUser(userMention.id, message.guild.id, reqNum).then(() => {
      message.channel.send(`Set ${userMention.tag}'s reputation points to ${reqNum} :ok_hand:`);
    });
  } else if (actionWanted == "promote") {
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You need administrator privelegies/permissions to use this command!`);
    if (!args[1] || !args[2]) return message.reply(`You need to say how many points are required to achieve the mentioned role!`);
    roleMention = roleMention || message.guild.roles.find('name', args[2]);
    if (!roleMention) return message.reply(`Couldn't find that role!`);
    let requiredPoints = Number(args[1]);
    let rewardRole = roleMention;

    client.database.repreward.AddReward(message.guild.id, requiredPoints, rewardRole.id).then(() => {
      message.channel.send(`${rewardRole.name} has been set as reward for people with ${requiredPoints} reputation points :ok_hand:`);
    });
  } else if (actionWanted == "promoteremove") {
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You need administrator privelegies/permissions to use this command!`);
    roleMention = roleMention || message.guild.roles.find('name', args[1]);
    if (!roleMention) return message.reply(`Couldn't find that role!`);

    client.database.repreward.GetRewardByRoleId(message.guild.id, roleMention.id).then(re => {
      if (!re) return message.reply(`No rewards with that role was found!`);
      client.database.repreward.DeleteReward(message.guild.id, roleMention.id).then(() => {
        message.channel.send(`Deleted reward ${roleMention.name} :ok_hand:`);
      }).catch(e => {
        message.reply(`Failed`);
        throw new Error(e);
      });
    }).catch(e => {
      message.reply(`Failed`);
      throw new Error(e);
    });
  } else if (actionWanted == "backuprep") {
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You need administrator privelegies/permissions to use this command!`);
    if (!args[1]) return message.reply(`Please provide an id to save as! (No spaces)`);
    let backupId = args[1];
    message.channel.send(`**Please wait while creating a backup profile..**`).then(sentMessage => {
      client.database.reputation.GetAll(message.guild.id).then(allRows => {
        allRows.forEach(val => {
          var thisUserRep = val;
          client.database.backup.BackupUser(thisUserRep.UserId, message.guild.id, backupId, thisUserRep.Reputation).then(() => {
            console.log(`Inserted ${thisUserRep.UserId} into the backup with id ${backupId}`);
          });
        });
        sentMessage.edit(`**Reputation points for all ${allRows.length} users have been saved** :ok_hand:`);


      });
    });
  } else if (actionWanted == "restorerep") {
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You need administrator privelegies/permissions to use this command!`);
    if (!args[1]) return message.reply(`Please provide an id to restore to! (No spaces)`);
    let backupId = args[1];
    message.channel.send(`**Please wait while restoring to the backup profile..**`).then(sentMessage => {
      client.database.backup.GetById(message.guild.id, backupId).then(allRows => {
        if (!allRows) return message.edit(`No backups with this id exists!`);
        allRows.forEach(val => {
          client.database.reputation.SetUser(message.author.id, message.guild.id, val.Reputation);
        });

        sentMessage.edit(`**Reputation points for all ${allRows.length} users have been restored the saved version: ${backupId}**`);
      });
    });
  }




};
