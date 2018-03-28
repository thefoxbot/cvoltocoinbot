 //Setting up various variables
 var Discord = require("discord.js");
 var bot = new Discord.Client();
 const fs = require('fs');

 //Loading files (im sorry for no fs.readFile even though its fucking loaded)
 const bals = require('./balances.json');
 const cvoltocoin = require('./cvoltocoin.json');

 //The whole fucking economic system for this coin
 //Now this is an example of good code alright, learn from this example, its clean, its good, its just great
 function cvoltoEconomyUpdate() {
    console.debug("Processing CC change")
    if(cvolocoin["bal"]>20) {
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

 function accCheck(makenew) {
    if(bals[msg.user.id] === undefined) {
        if(makenew) {
            bals[msg.user.id] = {"bal": 5, "username": msg.user.username}
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
            break;
        }
    }
 }

 //Setting the interval for the economy update
 //1800000 / 1000 / 60 / 60 = 30 mins 
 setInterval(cvoltoEconomyUpdate(), 1800000)

 //cvoltocoin["bal"] is cvoltocoin in dollars, we can put it into other currencies this way
 function convertCvoltocoin(cvoltobal) {
     return {"ruble": cvoltocoin["bal"]*60, "euro": cvoltocoin["bal"]*0.8}
 }

 //Choo choo, here come the message commands (aka discord intergration, exactly what you were waiting for right)
 bot.on("message", msg => {
     console.debug("Command input detected")
     //No param commands, aka those that can be put into switch()
     switch(msg.content) {
         case "cc-conversion":
            var conversionRates = convertCvoltocoin()
            msg.channel.send("**Conversion rates for CvoltoCoin**\n1 "+cvoloemote+" = "+cvoltocoin["bal"]+"$ Dollars, "+conversionRates.euro+" Euro, "+conversionRates.ruble+" Rubles.")
            break;
         case "cc-bal":
            accCheck(true)
            msg.channel.send("Your account currently has: \n**"+bals[msg.user.id]+cvoloemote+" CC**")
     }
 })

 //No token for you, haha
 bot.login(require('./token.json').discord)
