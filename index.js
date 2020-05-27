require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
  if (msg.author.bot) {
    return;
  }

  if (msg.content.startsWith('!hello')) {
    msg.reply('world!');
  }

  if (msg.content.startsWith('!dm')) {
    let messageContent = msg.content.replace('!dm', '');
    msg.member.send(messageContent);
  }

  if (msg.content.startsWith('!args')) {
    const args = msg.content.split(' ');
    let messageContent = '';
    if (args.includes('foo')) {
      messageContent += 'bar ';
    }
    if (args.includes('bar')) {
      messageContent += 'baz ';
    }
    if (args.includes('baz')) {
      messageContent += 'foo ';
    }
    msg.reply(messageContent);
  }

  if (msg.content.startsWith('!collector')) {
    // Filters define what kinds of messages should be collected
    let filter = (msg) => !msg.author.bot;
    // Options define how long the collector should remain open
    //    or the max number of messages it will collect
    let options = {
      max: 2,
      time: 15000
    };
    let collector = msg.channel.createMessageCollector(filter, options);

    // The 'collect' event will fire whenever the collector receives input
    collector.on('collect', (m) => {
      console.log(`Collected ${m.content}`);
    });

    // The 'end' event will fire when the collector is finished.
    collector.on('end', (collected) => {
      console.log(`Collected ${collected.size} items`);
    });

    msg.reply('What is your favorite color?');
  }

  if (msg.content.startsWith('!gimme')) {
    // Split the arguments
    const args = msg.content.split(' ');

    // Check the first argument (skipping the command itself)
    if (args[1] === 'smiley') {
      if (args.length < 3) {
        // Filter out any bot messages
        let filter = (msg) => !msg.author.bot;
        // Set our options to expect 1 message, and timeout after 15 seconds
        let options = {
          max: 1,
          time: 15000
        };
        let collector = msg.channel.createMessageCollector(filter, options);

        collector.on('end', (collected, reason) => {
          // If the collector ends for 'time', display a message to the user
          if (reason === 'time') {
            msg.reply('Ran out of time ☹...');
          } else {
            // Convert the collection to an array and check the content of the message.
            //   Repsond accordingly
            switch (collected.array()[0].content) {
              case 'happy':
                msg.reply('😀');
                break;
              case 'sad':
                msg.reply('😢');
                break;
              default:
                msg.reply('I dont know that smiley...');
                break;
            }
          }
        });

        msg.reply('What kind of smiley do you like? (happy or sad)');
      } else {
        // If all arguments are already there, respond with the requested item
        switch (args[2]) {
          case 'happy':
            msg.reply('😀');
            break;
          case 'sad':
            msg.reply('😢');
            break;
          default:
            msg.reply('I dont know that smiley...');
            break;
        }
      }
    }

    if (args[1] === 'circle') {
      if (args.length < 3) {
        let filter = (msg) => !msg.author.bot;
        let options = {
          max: 1,
          time: 15000
        };
        let collector = msg.channel.createMessageCollector(filter, options);

        collector.on('end', (collected, reason) => {
          if (reason === 'time') {
            msg.reply('Ran out of time ☹...');
          } else {
            switch (collected.array()[0].content) {
              case 'red':
                msg.reply('🔴');
                break;
              case 'blue':
                msg.reply('🔵');
                break;
              default:
                msg.reply('I dont know that color...');
                break;
            }
          }
        });

        msg.reply('What color circle would you like? (blue or red)');
      } else {
        switch (args[2]) {
          case 'red':
            msg.reply('🔴');
            break;
          case 'blue':
            msg.reply('🔵');
            break;
          default:
            msg.reply('I dont know that color...');
            break;
        }
      }
    }
  }

  if (msg.content.startsWith('!react')) {
    // Use a promise to wait for the question to reach Discord first
    msg.channel.send('Which emoji do you prefer?').then((question) => {
      // Have our bot guide the user by reacting with the correct reactions
      question.react('👍');
      question.react('👎');

      // Set a filter to ONLY grab those reactions & discard the reactions from the bot
      const filter = (reaction, user) => {
        return ['👍', '👎'].includes(reaction.emoji.name) && !user.bot;
      };

      // Create the collector
      const collector = question.createReactionCollector(filter, {
        max: 1,
        time: 15000
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          msg.channel.send('Ran out of time ☹...');
        } else {
          // Grab the first reaction in the array
          let userReaction = collected.array()[0];
          // Grab the name of the reaction (which is the emoji itself)
          let emoji = userReaction._emoji.name;

          // Handle accordingly
          if (emoji === '👍') {
            msg.channel.send('Glad your reaction is 👍!');
          } else if (emoji === '👎') {
            msg.channel.send('Sorry your reaction is 👎');
          } else {
            // This should be filtered out, but handle it just in case
            msg.channel.send(`I dont understand ${emoji}...`);
          }
        }
      });
    });
  }

  if (msg.content.startsWith('!survey')) {
    // Create an empty 'survey' object to hold the fields for our survey
    let survey = {};
    // We're going to use this as an index for the reactions being used.
    let reactions = [
      "1️⃣",
      "2️⃣",
      "3️⃣",
      "4️⃣"
    ]
    // Send a message to the channel to start gathering the required info
    msg.channel
      .send(
        'Welcome to the !survey command. What would you like to ask the community?'
      )
      .then(() => {
        // After each question, we setup a collector just like we did previously
        let filter = (msg) => !msg.author.bot;
        let options = {
          max: 1,
          time: 15000
        };

        return msg.channel.awaitMessages(filter, options);
      })
      .then((collected) => {
        // Lets take the input from the user and store it in our 'survey' object
        survey.question = collected.array()[0].content;
        // Ask the next question
        return msg.channel.send(
          'Great! How long should it go? (specified in seconds)'
        );
      })
      .then(() => {
        let filter = (msg) => !msg.author.bot;
        let options = {
          max: 1,
          time: 15000
        };

        return msg.channel.awaitMessages(filter, options);
      })
      .then((collected) => {
        // Adding some checks here to ensure the user entered a number.
        if (!isNaN(collected.array()[0].content)) {
          survey.timeout = collected.array()[0].content;
          // Ask the final question 
          return msg.channel.send(
            'Excellent. Now enter up to four options, separated by commas.'
          );
        } else {
          throw 'timeout_format_error';
        }
      })
      .then(() => {
        let filter = (msg) => !msg.author.bot;
        let options = {
          max: 1,
          time: 15000
        };

        return msg.channel.awaitMessages(filter, options);
      })
      .then((collected) => {
        // Split the answers by commas so we have an array to work with
        survey.answers = collected.array()[0].content.split(',');

        let surveyDescription = ""
        // Loop through the questions and create the 'description' for the embed
        survey.answers.forEach((question, index) => {
          surveyDescription += `${reactions[index]}: ${question}\n`;
        })

        // Create the embed object and send it to the channel
        let surveyEmbed = new Discord.MessageEmbed()
          .setTitle(`Survey: ${survey.question}`)
          .setDescription(surveyDescription)
        return msg.channel.send(surveyEmbed)
      })
      .then(surveyEmbedMessage => {
        // Create the initial reactions to embed for the members to see
        for (var i = 0; i < survey.answers.length; i++) {
          surveyEmbedMessage.react(reactions[i])
        }

        // Set a filter to ONLY grab those reactions & discard the reactions from the bot
        const filter = (reaction, user) => {
          return reactions.includes(reaction.emoji.name) && !user.bot;
        };

        // Use the timeout from our survey
        const options = {
          time: survey.timeout * 1000
        }

        // Create the collector
        return surveyEmbedMessage.awaitReactions(filter, options);
      })
      .then(collected => {
        // Convert the collection to an array
        let collectedArray = collected.array()
        // Map the collection down to ONLY get the emoji names of the reactions
        let collectedReactions = collectedArray.map(item => item._emoji.name)
        let reactionCounts = {}

        // Loop through the reactions and build an object that contains the counts for each reaction
        // It will look something like this:
        // {
        //   1️⃣: 1
        //   2️⃣: 0
        //   3️⃣: 3
        //   4️⃣: 10
        // }
        collectedReactions.forEach(reaction => {
          if (reactionCounts[reaction]) {
            reactionCounts[reaction]++
          } else {
            reactionCounts[reaction] = 1
          }
        })

        // Using those results, rebuild the description from earlier with the vote counts
        let surveyResults = ""
        survey.answers.forEach((question, index) => {
          let voteCount = 0
          if (reactionCounts[reactions[index]]) {
            voteCount = reactionCounts[reactions[index]]
          }
          let voteCountContent = `(${voteCount} vote${voteCount !== 1 ? 's' : ''})`
          surveyResults += `${reactions[index]}: ${question} ${voteCountContent}\n`;
        })

        // Create the embed and send it to the channel
        let surveyResultsEmbed = new Discord.MessageEmbed()
          .setTitle(`Results for '${survey.question}' (${collectedArray.length} total votes)`)
          .setDescription(surveyResults)

        msg.channel.send(surveyResultsEmbed);
      })
      .catch((err) => {
        console.error('Something went wrong', err);
        if (err === 'timeout_format_error') {
          msg.channel.send("That doesn't seem to be a valid number...");
        } else {
          msg.channel.send('Sorry! Something went wrong...');
        }
      });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);