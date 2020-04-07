const Discord = require('discord.js');
const Config = require('./config.js');
const chalk = require('chalk');
const Database = require('./Setup/database/db.js');

// Creating the discord client
const client = new Discord.Client();

// Attaching the sqlite database to the client
client.sql = Database.sql;
client.database = Database;

// Attaching the config to the client
client.config = Config;


client.on('ready', () => {
  console.log(chalk.bgBlue.white(`Logged in as ${client.user.tag}\n${client.guilds.size} servers!`));


  client.user.setActivity(`${Config.Prefix}help`, {
    type: "LISTENING"
  });

  // Creating the tables for the database
  client.sql.run(`CREATE TABLE IF NOT EXISTS afk (ServerId TEXT, userId, reason TEXT)`);
  client.sql.run(`CREATE TABLE IF NOT EXISTS logchannel (ServerId TEXT, logChannel TEXT)`);
  client.sql.run(`CREATE TABLE IF NOT EXISTS mute (ServerId TEXT, muteId TEXT)`);
  client.sql.run(`CREATE TABLE IF NOT EXISTS auto (ServerId TEXT, roleId TEXT)`);
  client.sql.run(`CREATE TABLE IF NOT EXISTS bannedwords (ServerId TEXT, word TEXT)`);
  client.sql.run(`CREATE TABLE IF NOT EXISTS bannedwordsbypass (ServerId TEXT, roleId TEXT)`);
  client.sql.run(`CREATE TABLE IF NOT EXISTS reputation (UserId TEXT, ServerId TEXT, Reputation INT)`);
  client.sql.run(`CREATE TABLE IF NOT EXISTS reputationrewards (ServerId TEXT, Required INT, RoleId TEXT)`);
  client.sql.run(`CREATE TABLE IF NOT EXISTS repbackup (UserId TEXT, ServerId TEXT, Id TEXT, Reputation INT)`);
  client.sql.run(`CREATE TABLE IF NOT EXISTS feedchannel (ServerId TEXT, ChannelId TEXT)`);
  client.sql.run(`CREATE TABLE IF NOT EXISTS feeds (ServerId TEXT, Feed TEXT)`);

  client.sql.all(`SELECT * FROM reputation`).then(d => {
    console.log(d);
  });

  console.log(chalk.bgGreen.white(`Opened all the tables`));
  require('./Setup/twitter/twitter.js').SetClient(client);
});




// Fires whenever a message gets deleted. (Works only with messages AFTER the bot has started)
client.on('messageDelete', function(message) {
  // Don't continue if it was a bot
  if (message.author.bot) return;
  client.sql.get(`SELECT * FROM logchannel`).then(row => {
    // If the channel is found (not undefined) Message will be sent!
    if (typeof row !== "undefined") {
      return message.guild.channels.get(`${row.logChannel}`).send("", {
        embed: {
          'author': {
            name: message.author.username,
            icon_url: message.author.displayAvatarURL
          },
          'title': `Message by ${message.author.username} deleted`,
          "description": `Content: ${message.content}`,
          "timestamp": new Date()
        }
      });
    }
  });
});



//Event when a User joins
client.on('guildMemberAdd', (member) => {
  client.sql.get(`SELECT * FROM logchannel`).then(row => {
    //If the Channel is found (not undefined) Message will be sent!
    if (typeof row !== 'undefined')
      return member.guild.channels.get(`${row.logChannel}`).send("", {
        embed: {
          'title': `New Member`,
          "description": `Name: ${member.user.username}\nDiscriminator: ${member.user.discriminator}`,
          "timestamp": new Date()
        }
      });
  });

  client.sql.get(`SELECT * FROM auto`).then(row => {
    if (typeof row !== 'undefined')
      member.addRole(row.roleId, "Autorole").catch(console.error);
  });
});


//When someone left the Server(also kick)
client.on('guildMemberRemove', (member) => {
  client.sql.get(`SELECT * FROM logchannel`).then(row => {
    //If the Channel is found (not undefined) Message will be sent!
    if (typeof row !== 'undefined')
      return member.guild.channels.get(`${row.logChannel}`).send("", {
        embed: {
          'title': `Member left/got kicked`,
          "description": `Name: ${member.user.username}\nDiscriminator: ${member.user.discriminator}`,
          "timestamp": new Date()
        }
      });
  });
});


client.on('guildBanAdd', (guild, user) => {
  client.sql.get(`SELECT * FROM logchannel`).then(row => {
    //If the Channel is found (not undefined) Message will be sent!
    if (typeof row !== 'undefined')
      return guild.channels.get(`${row.logChannel}`).send("", {
        embed: {
          'title': `User got banned`,
          "description": `Name: ${user.username}\nDiscriminator: ${user.discriminator}`,
          "timestamp": new Date()
        }
      });
  });
});




client.on('message', function(message) {
  const msgUpper = message.content.toUpperCase();
  // Don't listen to a bot!!
  if (message.author.bot) return;
  // If the guild/server isn't available
  if (message.guild.available != true) return;


  CheckMutedRoleInServer(message.guild);
  client.database.repreward.CheckRewards(message.author.id, message.guild.id).then(rewardsGotten => {
    if (!rewardsGotten) return console.log("No rewards :D");
    for (var n in rewardsGotten) {
      let thisReward = rewardsGotten[n];
      let getRole = message.guild.roles.get(thisReward);
      if (getRole) {
        message.member.addRole(getRole.id);
      }
    }
  });



  //Check if user is mentioned and is not an command
  if (message.mentions.members.size >= 1 && !message.content.startsWith(client.config.Prefix)) {
    //Check for user in DB
    client.sql.get(`SELECT * FROM 'afk' WHERE userID = ${message.mentions.users.first(1)[0].id}`).then(row => {
      //Continue if in DB
      if (typeof row === 'undefined') {
        return;
      }
      message.reply(`the User ${message.mentions.users.first(1)[0].username} is AFK : ${row.reason}`).then(msg => msg.delete(4000));

    });

  }



  //Remove AFK when Message is written
  client.sql.get(`SELECT * FROM 'afk' WHERE userID = ${message.author.id}`).then(row => {
    if (typeof row !== 'undefined') {
      //Delete out of DB
      client.sql.run(`DELETE FROM 'afk' WHERE userID = ${message.author.id}`);
    }
  });


  // Check for banned words
  client.sql.all(`SELECT * FROM bannedwords WHERE ServerId = ?`, [message.guild.id]).then(rows => {
    for (var i = 0, len = rows.length; i < len; i++) {
      let check = msgUpper.indexOf(rows[i].word);
      if (check !== -1) {
        message.author.send(`Hello, I am just letting you know that your message:\n\n"${message.content}"\n\nwas deleted because it had the banned word: "${rows[i].word.toLowerCase()}" Please remove these words and try again. Thanks.`)
          .then(message.delete())
          .catch(console.error());
        break;
      }
    }
  });

  // If message didn't start with the prefix, then stop it here
  if (!message.content.toLowerCase().startsWith(client.config.Prefix)) return;

  // Removes the prefix from the message, before "slicing" it up to an array ['like', 'this']
  const args = message.content.slice(client.config.Prefix.length).trim().split(/ +/g);
  // The command
  const command = args.shift().toLowerCase();

  try {
    let fetchCommand = require(`./Setup/commands/${command}.js`);
    fetchCommand.run(client, message, args);
  } catch (err) {
    // Failed to get the command
    // console.error(err);
  }
});

function CheckMutedRoleInServer(guild) {

  //Create a Role named Muted from the Guild Object which cant write in any Channel and saves ID of the Role to the DB
  if (!guild.roles.find(val => val.name === "muted")) {
    guild.createRole({
      name: "muted",
      mentionable: false,
    }, "Automaticly generated for Mut command").then(role => {

      client.sql.run("INSERT INTO mute (muteId) VALUES (?)", [role.id]);
      let channels = guild.channels.array();
      for (var i = 0; i < channels.length; i++) {
        channels[i].overwritePermissions(role, {
          SEND_MESSAGES: false
        }, "Muted role should not be able to write").catch();
      }
      //Contact Owner
      guild.owner.send("Please move the muted role over the User role.This is needed to let the Mute command be working");
    });
  } else {
    let murole = guild.roles.find(val => val.name === "muted");
    client.sql.run("INSERT INTO mute (muteId) VALUES (?)", [murole.id]);
    for (var i = 0; i < guild.channels.length; i++) {
      guild.channels[i].overwritePermissions(role, {
        SEND_MESSAGES: false
      }, "Muted role should not be able to write").catch();
    }
  }


}

// Logging in to the client with the token
client.login(Config.Token);
