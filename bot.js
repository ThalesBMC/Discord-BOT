const Discord = require('discord.js')
const client = new Discord.Client()
const ytdl = require("ytdl-core")
const { token } = require("./config.json");
var server ={
}
var servers={}
client.on('ready',()=>{
    console.log("Connected as"+ client.user.tag)
    
    client.user.setActivity("Comendo cu de curioso")
    client.guilds.cache.forEach((guild) => {
        console.log(guild.name)
        guild.channels.cache.forEach((channel)=>{
            console.log(`${channel.name} ${channel.type} ${channel.id}`)
        })
        //general id text 276502251252744192
    })
    let generalChannel = client.channels.cache.get("276502251252744192")
    generalChannel.send(" O pai Está ON")
})
client.on('message',(receivedMessage)=>{
    if(receivedMessage.author === client.user){
        return
    }
    //receivedMessage.channel.send(`Estou te ouvindo ${receivedMessage.author.toString()}, vc falou:` + receivedMessage.content)
    //receivedMessage.react("/")
    if (receivedMessage.content.startsWith("!")){
        processCommand(receivedMessage)
    }
})
function processCommand(receivedMessage){
    let fullCommand= receivedMessage.content.substr(1)
    let splitCommand= fullCommand.split(" ")
    let primaryCommand= splitCommand[0]
    let args = splitCommand.slice(1)

    if (primaryCommand =="help"){
        helpCommand(args,receivedMessage)
    }else if (primaryCommand =="imagem"){
        receivedMessage.channel.send()
    }else if (primaryCommand === 'avatar') {
        if (!receivedMessage.mentions.users.size) {
            return receivedMessage.channel.send(`Your avatar: <${receivedMessage.author.displayAvatarURL({ format: "png", dynamic: true })}>`);
        }
        const avatarList = receivedMessage.mentions.users.map(user => {
            return `${user.username}'s avatar: <${user.displayAvatarURL({ format: "png", dynamic: true })}>`;
        });
        receivedMessage.channel.send(avatarList);
    }else if (primaryCommand === 'prune') {
        const amount = parseInt(args[0]) + 1;
        
        if (isNaN(amount)) {
            return receivedMessage.reply('that doesn\'t seem to be a valid number.');
        } else if (amount < 1 || amount > 100) {
            return receivedMessage.reply('you need to input a number between 1 and 99.')
        }else{
            receivedMessage.channel.bulkDelete(amount, true).catch(err => {
                console.error(err);
                receivedMessage.channel.send('there was an error trying to prune messages in this channel!');
            });
        }
        
    }else if (primaryCommand === 'play') {
        function play(connection, receivedMessage){
            var server = servers[receivedMessage.guild.id]
            server.dispatcher= connection.play(ytdl(server.queue[0],{filter:"audioonly"}))
            receivedMessage.channel.send("Está tocando a música") 
            server.queue.shift();
            server.dispatcher.on("finish",function(){
                if(server.queue[0]){
                    play(connection,receivedMessage)
                }else{
                    connection.disconnect();
                }
            })
        }
        if(!args[0]){
            receivedMessage.channel.send("coloque o link") 
            return;    
        }
        if(!receivedMessage.member.voice.channel){
            receivedMessage.channel.send("Você precisa estar em um canal para adicionar um bot.")
            return
        }
        if(!servers[receivedMessage.guild.id]) servers[receivedMessage.guild.id]={
            queue:[]
        }
        var server = servers[receivedMessage.guild.id]
        console.log(server.queue,"aqui5")
        server.queue.push(args[0]);
        console.log(server.queue,"aqui6")
        
        if(!receivedMessage.guild.voiceConnection)  receivedMessage.member.voice.channel.join().then(function(connection){
            play(connection,receivedMessage);
        })
    }else if (primaryCommand === 'skip'){
        var server = servers[receivedMessage.guild.id]
        if(server.dispatcher) server.dispatcher.end();
        receivedMessage.channel.send("Pulando música")
    }else if (primaryCommand === 'stop'){
        var server = servers[receivedMessage.guild.id];
        if(receivedMessage.guild.voiceConnection){
            for(var i= server.queue.length -1; i>=0;i--){
                server.queue.splice(i, 1);
            }
            server.dispatcher.end();
            receivedMessage.channel.send('Parando a reprodução, saindo do servidor')
            console.log("stopped")
        }
        if(receivedMessage.guild.connection) receivedMessage.guild.voiceConnection.disconnect();
    }
    else{
        receivedMessage.channel.send("Comando desconhecido.")
    }
}
function helpCommand(args,receivedMessage){
    if (args.length ==0){
        receivedMessage.channel.send("Eu não te entendo. tente usar o !help [topic]")
    }else{
        receivedMessage.channel.send("Este bot possui os comandos a seguir: !help, !avatar,!play link, !prune x. o prune exclui mensagens,X pode ir até 100" )
    }

}


client.login(token)
