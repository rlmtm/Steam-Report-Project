const Koa = require('koa');
const app = new Koa();
const SteamAPI = require('steamapi');
const steam = new SteamAPI('X');
const Handlebars = require("handlebars");
var moment = require('moment');
const e = require('express');
moment().format();
const { isContext } = require('vm');
const axios = require('axios');
const { url } = require('inspector');
//const ScreenSizeDetector = require('screen-size-detector');
//const screen = new ScreenSizeDetector();

const fs = require('fs').promises;

app.use(async ctx => {
    if (ctx.request.query.login) {
        let id = await steam.resolve(ctx.request.query.login);
        let bans = await steam.getUserBans(id);
        let player = await steam.getGamePlayers('730');
        let summary = await steam.getUserSummary(id);
        let creationDate = moment.unix(summary.created).format("MMM Do YYYY");
        let lastOnline = moment.unix(summary.lastLogOff).format("MMM Do YYYY");
        let daysSinceBan = bans.daysSinceLastBan;
        let url = ctx.request.query.login;
        const gameIDList = [];
        let gameDetails;
        const gamesWithoutApps = [];
        const gameGenres = [];
        const gameGenresAmount = [];
        const isFree = [];
        const gameCategories = [];
        let gameTimeTotal = 0;
        let gameTimeNew = 0;
        let level = await steam.getUserLevel(id);
        let level0 = false;
        let level10 = false;
        let level20 = false;
        let levelT = false;
        let levelG = false;
        let friends;
        let friendsPrivate = false;
        let games;
        let gamesPrivate = false;
        let isBanned = false;
        let personaState;
        let admin = false;
        let online = false;
        let NoGamesOwned = false;
        let gameLength0 = false;
        let gameLength1 = false;
        let gameLength2 = false;
        let gameLength3 = false;
        let gameLength4 = false;
        let gameLength5 = false;
        let gameLength6 = false;
        let gameLength7 = false;
        let gameLength8 = false;
        let gameLength9 = false;
        let gameLengthFull = false;
        let privateProfile = false;

        function roundT(num) {
            var m = Number((Math.abs(num) * 10).toPrecision(15));
            return Math.round(m) / 10 * Math.sign(num);
        }

        function contains(arr, val) {
            return arr.some(function(arrVal) {
              return val === arrVal;
            });
        }

        if (id == "76561199103486871" || id == "76561198426601542") {
            admin = true;
        }

        if (summary.personaState == 0) {
            if (summary.visibilityState != 3) {
                personaState = "Private";
            } else {
                personaState = "Offline";
            }
        } else if (summary.personaState == 1) {
            personaState = "Online";
            online = true;
        } else if (summary.personaState == 2) {
            personaState = "Busy";
        } else if (summary.personaState == 3) {
            personaState = "Away";
        } else if (summary.personaState == 4) {
            personaState = "Snooze";
        } else if (summary.personaState == 5) {
            personaState = "Looking to Trade";
        } else {
            personaState = "Looking to Play";
        }

        if (admin == true) {
            levelG = true;
        } else {
            if (level < 10) {
                level0 = true;
            } else if (level >= 10 && level < 20) {
                level10 = true;
            } else if (level >= 20 && level < 30) {
                level20 = true;
            } else if (level >= 30) {
                levelT = true;
            }
        }

        try {
            games = await steam.getUserOwnedGames(id);

            if (games.length > 0) {
                NoGamesOwned = false;
            } else if (games.length <= 0) {
                NoGamesOwned = true;
            }
        } catch (error) {
            //console.log(error);
            NoGamesOwned = true;
        }

        if (summary.visibilityState != 3) {
            privateProfile = true;
        } else {
            privateProfile = false;
        }
        

        if (summary.visibilityState == 3 && bans.communityBanned == false && NoGamesOwned == false) {
            if (bans.communityBanned == true || bans.vacBanned == true || bans.vacBans > 0 || bans.gameBans > 0 || bans.economyBan == "banned") {
                isBanned = true;
                let file = await fs.readFile(__dirname + "/banned.html", "UTF-8");
                const template = Handlebars.compile(file);
                ctx.body = (template({ ban: bans, url: url }));
            }

            try {
                friends = await steam.getUserFriends(id);
            } catch (error) {
                friendsPrivate = true
            }

            try {
                games = await steam.getUserOwnedGames(id);

                for (let x = 0; x < games.length; x++) {
                    if (games[x].playTime > 0) {
                        try {

                            gameTimeTotal = gameTimeTotal + games[x].playTime;

                            if (games[x].playTime < 10*60) {
                                games[x].playTime = roundT(games[x].playTime/60);
                            } else {
                                games[x].playTime = Math.round(games[x].playTime/60);
                            }
                        } catch(error) {
                            console.log(error);
                        }
                    }
                    if (games[x].playTime2 > 0) {
                        try {

                            gameTimeNew = gameTimeNew + games[x].playTime2;

                            if (games[x].playTime2 < 10*60) {
                                games[x].playTime2 = roundT(games[x].playTime2/60);
                            } else {
                                games[x].playTime2 = Math.round(games[x].playTime2/60);
                            }
                        } catch(error) {
                            console.log(error);
                        }
                    }
                }

                games.sort(function(b, a){return (a.playTime) - (b.playTime)});
                games.sort(function(b, a){return (a.playTime2) - (b.playTime2)});

                gameTimeTotal = roundT(gameTimeTotal/60);
                gameTimeNew = roundT(gameTimeNew/60);

                for (let x = 0; x < games.length; x++) {
                    gameIDList.push(games[x].appID.toString());
                }

                for (let x = 0; x < 11; x++) {
                    try {
                        gameDetails = await steam.getGameDetails(gameIDList[x], [false]);
                        if (gameDetails.name == "Apex Legends???") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.name == "The Witcher?? 3: Wild Hunt") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.name == "Terraria") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.name == "Aim Lab") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.name == "Dota Underlords") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.name == "Conqueror's Blade") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.name == "SMITE??") {
                            gameDetails.background_raw = gameDetails.screenshots[1].path_full
                        }
                        if (gameDetails.name == "Path of Exile") {
                            gameDetails.background_raw = gameDetails.screenshots[14].path_full
                        }
                        if (gameDetails.name == "RISK: Global Domination") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.name == "Rust") {
                            gameDetails.background_raw = gameDetails.screenshots[2].path_full
                        }
                        if (gameDetails.name == "Unturned") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.name == "The Forest") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.name == "Garry's Mod") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.name == "F1?? 2021") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.name == "Bloons TD Battles 2") {
                            gameDetails.background_raw = gameDetails.screenshots[0].path_full
                        }
                        if (gameDetails.type == 'game' && gameDetails.background_raw != "" && !gamesWithoutApps.some(game => game.name == gameDetails.name)) {
                            try {
                                await axios.get(gameDetails.background_raw)
                            } catch (error) {
                                gameDetails.background_raw = gameDetails.screenshots[0].path_thumbnail 
                            }
                            gamesWithoutApps.push(gameDetails);
                        }

                        if (contains(gameGenres, gameDetails.genres[0].description) == false) {
                            //console.log(gameGenres);
                            gameGenres.push(gameDetails.genres[0].description);
                        } else if (gameDetails.genres[0].description == gameGenres[0]) {
                            gameGenresAmount[0]
                        }
                        

                    } catch (error) {
                        //console.log(error);
                    }
                }

                if ((gamesWithoutApps.length == 0 && games.length >= 0) || games.length == 0) {
                    gameLength0 = true;
                    gameLength1 = true;
                    gameLength2 = true;
                    gameLength3 = true;
                    gameLength4 = true;
                    gameLength5 = true;
                    gameLength6 = true;
                    gameLength7 = true;
                    gameLength8 = true;
                    gameLength9 = true;
                } else if (gamesWithoutApps.length == 1) {
                    gameLength1 = true;
                    gameLength2 = true;
                    gameLength3 = true;
                    gameLength4 = true;
                    gameLength5 = true;
                    gameLength6 = true;
                    gameLength7 = true;
                    gameLength8 = true;
                    gameLength9 = true;
                } else if (gamesWithoutApps.length == 2) {
                    gameLength2 = true;
                    gameLength3 = true;
                    gameLength4 = true;
                    gameLength5 = true;
                    gameLength6 = true;
                    gameLength7 = true;
                    gameLength8 = true;
                    gameLength9 = true;
                } else if (gamesWithoutApps.length == 3) {
                    gameLength3 = true;
                    gameLength4 = true;
                    gameLength5 = true;
                    gameLength6 = true;
                    gameLength7 = true;
                    gameLength8 = true;
                    gameLength9 = true;
                } else if (gamesWithoutApps.length == 4) {
                    gameLength4 = true;
                    gameLength5 = true;
                    gameLength6 = true;
                    gameLength7 = true;
                    gameLength8 = true;
                    gameLength9 = true;
                } else if (gamesWithoutApps.length == 5) {
                    gameLength5 = true;
                    gameLength6 = true;
                    gameLength7 = true;
                    gameLength8 = true;
                    gameLength9 = true;
                } else if (gamesWithoutApps.length == 6) {
                    gameLength6 = true;
                    gameLength7 = true;
                    gameLength8 = true;
                    gameLength9 = true;
                } else if (gamesWithoutApps.length == 7) {
                    gameLength7 = true;
                    gameLength8 = true;
                    gameLength9 = true;
                } else if (gamesWithoutApps.length == 8) {
                    gameLength8 = true;
                    gameLength9 = true;
                } else if (gamesWithoutApps.length == 9 ) {
                    gameLength9 = true;
                } else if (gamesWithoutApps.length == 10) {
                    gameLengthFull = true;
                }

            } catch (error) {
                gamesPrivate = true
                //console.log(error);
            }

            //console.log(url);
            //console.log('http://steamreport.info/?login=%27+'+url);
            //console.log("Height:" +  window.screen.height)
            //console.log("Width:" +  window.screen.width)
            //console.log(`The current screen width is ${screen.width}`);
            //console.log("Total Game Time: " + gameTimeTotal);
            //console.log("Recent Game Time: " + gameTimeNew);
            //console.log("genres array: " + gameGenres)
            

            let file = await fs.readFile(__dirname + "/webpage-input.html", "UTF-8");
            const template = Handlebars.compile(file);
            ctx.body = (template({ id: id,
                player: player,
                summary: summary,
                friends: friends,
                games: games,
                friendsPrivate: friendsPrivate,
                gamesPrivate: gamesPrivate,
                isBanned: isBanned,
                creationDate: creationDate,
                personaState: personaState,
                level: level, level0, level10, level20, levelT, levelG,
                admin: admin,
                online: online,
                lastOnline: lastOnline,
                daysSinceBan: daysSinceBan,
                games: games,
                gameIDList: gameIDList,
                gamesWithoutApps: gamesWithoutApps,
                gameLength1: gameLength1, 
                gameLength2: gameLength2,
                gameLength3: gameLength3,
                gameLength4: gameLength4,
                gameLength5: gameLength5,
                gameLength6: gameLength6,
                gameLength7: gameLength7,
                gameLength8: gameLength8,
                gameLength9: gameLength9,
                gameLengthFull: gameLengthFull,
                NoGamesOwned: NoGamesOwned
            }));

        } else {
            let file = await fs.readFile(__dirname + "/private-profile.html", "UTF-8");
            const template = Handlebars.compile(file);
            ctx.body = (template({ bans: bans, NoGamesOwned: NoGamesOwned, privateProfile: privateProfile, admin: admin }));
        }
    } else {
        let file = await fs.readFile(__dirname + "/profile-set.html", "UTF-8");
        const template = Handlebars.compile(file);
        ctx.body = (template({ }));
    }
});

//Code on lines 344, 345 used when running server locally
console.log('Server is running on port 3000')
app.listen(3000);

// Code below used when running server in cloud
//console.log('Server is running...')
//app.listen();
