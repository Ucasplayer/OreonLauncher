// Work in progress
const { LoggerUtil } = require('helios-core')

const logger = LoggerUtil.getLogger('DiscordWrapper')

const { Client } = require('discord-rpc-patch')

const Lang = require('./langloader')

const OREON_DISCORD_CLIENT_ID = '1500587745150636112'
const OREON_DISCORD_INVITE_URL = 'https://discord.com/invite/oreon'

let client
let activity
let activeClientId
let clientReady = false

function resolveClientId(genSettings = {}) {
    return genSettings.clientId || OREON_DISCORD_CLIENT_ID
}

function resolveServerSettings(servSettings = {}) {
    return {
        shortId: servSettings.shortId || 'Oreon',
        largeImageKey: servSettings.largeImageKey || 'oreon',
        largeImageText: servSettings.largeImageText || 'Oreon Roleplay'
    }
}

function resolveGlobalSettings(genSettings = {}) {
    return {
        clientId: resolveClientId(genSettings),
        smallImageKey: genSettings.smallImageKey || 'oreon',
        smallImageText: genSettings.smallImageText || 'Oreon'
    }
}

function ensureClient(clientId) {
    if(!clientId) {
        logger.info('Discord Rich Presence disabled: missing Discord client id.')
        return false
    }

    if(client && activeClientId === clientId) {
        return true
    }

    exports.shutdownRPC()

    client = new Client({ transport: 'ipc' })
    activeClientId = clientId
    clientReady = false

    client.on('ready', () => {
        logger.info('Discord RPC Connected')
        clientReady = true
        if(activity) {
            client.setActivity(activity)
        }
    })
    
    client.login({clientId}).catch(error => {
        if(error.message.includes('ENOENT')) {
            logger.info('Unable to initialize Discord Rich Presence, no client detected.')
        } else {
            logger.info('Unable to initialize Discord Rich Presence: ' + error.message, error)
        }
    })

    return true
}

function setActivity(nextActivity) {
    activity = {
        ...nextActivity,
        buttons: buildButtons()
    }
    if(client && clientReady) {
        client.setActivity(activity).catch(error => {
            logger.info('Unable to update Discord Rich Presence: ' + error.message, error)
        })
    }
}

function applyActivityUpdate(update = {}) {
    if(!client || !activity) return
    activity = {
        ...activity,
        ...update
    }
    setActivity(activity)
}

function applyPlayerCount(activityData, playerCount) {
    if(playerCount?.online != null && playerCount?.max != null) {
        activityData.partyId = 'oreon-roleplay'
        activityData.partySize = playerCount.online
        activityData.partyMax = playerCount.max
    }
    return activityData
}

function buildButtons() {
    return [{
        label: Lang.queryJS('discord.discordButton'),
        url: OREON_DISCORD_INVITE_URL
    }]
}

exports.initLauncherRPC = function(genSettings, servSettings){
    const gen = resolveGlobalSettings(genSettings)
    const serv = resolveServerSettings(servSettings)

    if(!ensureClient(gen.clientId)) {
        return false
    }

    setActivity({
        details: Lang.queryJS('discord.launcherDetails'),
        state: Lang.queryJS('discord.launcherState'),
        largeImageKey: serv.largeImageKey,
        largeImageText: serv.largeImageText,
        smallImageKey: gen.smallImageKey,
        smallImageText: gen.smallImageText,
        startTimestamp: new Date().getTime(),
        buttons: buildButtons(),
        instance: false
    })

    return true
}

exports.initRPC = function(genSettings, servSettings, initialDetails = Lang.queryJS('discord.waiting'), playerCount = null){
    const gen = resolveGlobalSettings(genSettings)
    const serv = resolveServerSettings(servSettings)

    if(!ensureClient(gen.clientId)) {
        return false
    }

    activity = applyPlayerCount({
        details: initialDetails,
        state: Lang.queryJS('discord.state', {shortId: serv.shortId}),
        largeImageKey: serv.largeImageKey,
        largeImageText: serv.largeImageText,
        smallImageKey: gen.smallImageKey,
        smallImageText: gen.smallImageText,
        startTimestamp: new Date().getTime(),
        buttons: buildButtons(),
        instance: false
    }, playerCount)

    setActivity(activity)
    return true
}

exports.updateActivity = function(update = {}) {
    applyActivityUpdate(update)
}

exports.updateDetails = function(details){
    if(!client || !activity) return
    activity.details = details
    setActivity(activity)
}

exports.updatePlayerCount = function(playerCount) {
    if(!client || !activity) return
    const nextActivity = applyPlayerCount({...activity}, playerCount)
    setActivity(nextActivity)
}

exports.shutdownRPC = function(){
    if(!client) return
    client.clearActivity()
    client.destroy()
    client = null
    activity = null
    activeClientId = null
    clientReady = false
}
