 //Setting up various variables
 var Discord = require("discord.js");
 var bot = new Discord.Client();
 const fs = require('fs');
 var cvoloemote = "EP"

 //Loading files (im sorry for no fs.readFile even though its fucking loaded)
 const bals = require('./balances.json');
 const cvoltocoin = require('./cvoltocoin.json');

 //The whole fucking economic system for this coin
 //Now this is an example of good code alright, learn from this example, its clean, its good, its just great
 function cvoltoEconomyUpdate() {
    console.debug("Processing CC change")
    if(cvoltocoin["bal"]>0.5) {
        cvoltocoin["dirCountdown"] -= 1
        console.debug("Direction counted down; that's done")
        if(cvoltocoin["dirCountdown"] === 0) {
            cvoltocoin["direction"] = null
            console.debug("Direction expired!!! back to null")
        }
     } else if (cvoltocoin["bal"]>1000) {
        cvoltocoin["direction"] = "down"
        cvoltocoin["dirCountdown"] = 30
        console.debug("CC's direction set to down due to out of bounds detector for 30 more updates")
     } else {
        cvoltocoin["direction"] = "up"
        cvoltocoin["dirCountdown"] = 30
        console.debug("CC's direction set to up due to out of bounds detector for 30 more updates")
     }
     if(Math.random()<0.93) {
        switch(cvoltocoin["direction"]) {
            case "up":
                cvoltocoin["bal"] += (Math.round(Math.random() * 100) / 100)
                console.debug("CC Bal has been successfully changed with up direction")
                break;
            case "down":
                cvoltocoin["bal"] -= (Math.round(Math.random() * 100) / 100)
                console.debug("CC Bal has been successfully changed with down direction")
                break;
            default:
                cvoltocoin["bal"] += (Math.round(Math.random() * 100) / 100) * 2 - 1
                console.debug("CC Bal has been successfully changed")
        }
     }

     if(Math.random()>0.9 && cvoltocoin["direction"] === null) {
         if(Math.random()>0.5) {
            cvoltocoin["direction"] = "down"
            cvoltocoin["dirCountdown"] = 5
            console.debug("CC's direction set to down due to direction randomizer for 5 more updates")
         } else {
            cvoltocoin["direction"] = "up"
            cvoltocoin["dirCountdown"] = 5
            console.debug("CC's direction set to up due to direction randomizer for 5 more updates")
         }
     }
     console.debug("Writing to file...")
     fs.writeFile("./cvoltocoin.json", JSON.stringify(cvoltocoin), function(err) {
        if(err) {
            console.log("Oh shit, something's gone wrong when writing file\n"+err)
        } else {
            console.debug("Writing file successful!")
        }
     })
 }

 //Minute bonus
 setInterval(function() {
    Object.keys(bals).map(function(objectKey, index) {
        var acc = bals[objectKey];
        if(acc.mining) {
            
            bals[acc.id]["miningBonus"] += Math.floor(Math.random()*4)
        }
        bals[acc.id]["recievedMinuteBonus"] = false
    });
    console.debug("Gave mining people minute bonus")
 }, 60000)

 //Make a new account if you haven't already, useful for commands
 function accCheck(makenew, user) {
    if(bals[user.id] === undefined) {
        if(makenew) {
            bals[user.id] = {"bal": 0.5, "username": user.username, "mining": false, "miningBonus":0,"recievedMinuteBonus":false,"id":user.id}
            console.debug("Created new account for a user that didn't have one yet")
            console.debug("Writing to file...")
            fs.writeFile("./balances.json", JSON.stringify(bals), function(err) {
                if(err) {
                    console.log("Oh shit, something's gone wrong when writing file\n"+err)
                } else {
                    console.debug("Writing file successful!")
                }
            })
        } else {
            throw new Error("User does not have an account")
            return "User does not have an account"
        }
    }
 }

 //Setting the interval for the economy update
 //1800000 / 1000 / 60 / 60 = 30 mins 
 setInterval(cvoltoEconomyUpdate, 1800000)

 //cvoltocoin["bal"] is cvoltocoin in dollars, we can put it into other currencies this way
 function convertCvoltocoin(cvoltobal) {
     return {"ruble": cvoltocoin["bal"]*60, "euro": cvoltocoin["bal"]*0.8}
 }

 //Choo choo, here come the message commands (aka discord intergration, exactly what you were waiting for right)
 bot.on("message", msg => {
     console.debug("Command input detected")
     //Mining
     if(bals[msg.author.id] !== undefined) {
         if(bals[msg.author.id].mining && !bals[msg.author.id].recievedMinuteBonus) {
            console.debug("Gave a person a mining bonus for talking")
            bals[msg.author.id]["miningBonus"] += Math.floor(Math.random()*10)
            bals[msg.author.id]["recievedMinuteBonus"] = true
         }
     }
     //No param commands, aka those that can be put into switch()
     switch(msg.content) {
         case "cc-conversion":
            var conversionRates = convertCvoltocoin()
            msg.channel.send("**Conversion rates for CvoltoCoin**\n1 "+cvoloemote+" = "+cvoltocoin["bal"]+"$ Dollars, "+conversionRates.euro+" Euro, "+conversionRates.ruble+" Rubles.")
            break;
         case "cc-bal":
            accCheck(true, msg.author)
            msg.channel.send("Your account currently has: \n**"+bals[msg.author.id].bal+cvoloemote+" CC**")
            break;
         case "cc-mine":
            accCheck(true, msg.author)
            if(bals[msg.author.id].mining) {
            msg.channel.send("Aaaand... done!! During this time, you have successfully earned **"+bals[msg.author.id].miningBonus+cvoloemote+" CC**! Mining has been disabled, come again next time!")
            bals[msg.author.id]["bal"] += bals[msg.author.id].miningBonus
            bals[msg.author.id]["miningBonus"] = 0
            bals[msg.author.id]["mining"] = false
            console.debug("Ended mining session")
            fs.writeFile("./balances.json", JSON.stringify(bals), function(err) {
                if(err) {
                    console.log("Oh shit, something's gone wrong when writing file\n"+err)
                } else {
                    console.debug("Writing file successful!")
                }
            })
            } else {
                console.debug("Added new mining session")
                msg.channel.send("**Mining has been enabled!** During this time, you cannot use any currency commands, except cc-bal, for the bonus of up to 4CC each minute and 14CC each minute if you talk enough!\nStop mining by doing this command again")
                bals[msg.author.id]["mining"] = true
            }
     }
 })

 //No token for you, haha
 bot.login(require('./token.json').discord)
