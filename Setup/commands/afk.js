//Everything in the curly braces will be run and in the () are the Bot and the message+args defined
exports.run = (Bot, message, args) => {
  //Check if user has given an reason
  if (!args[0] || args[0] == " ") {
    //Return an error Message and deletes it after 6 seconds
    message.channel.send('You forgot to give a Reason for being AFK!').then(msg => msg.delete(6000));
  } else {
    //Will be run if the user has given a reason

    //save data to db
    Bot.sql.run("INSERT INTO afk (userId, reason) VALUES (?, ?)", [message.author.id, args.join(' ')]);



    //Give the User a response
    message.channel.send("", {
      embed: {
        'description': 'Successfully set you AFK state to : ' + args.join(' '),
        'footer': {
          'text': 'AFK will reset after you send a Message'
        }
      }
    }).then(msg => msg.delete(5000));
  }

};