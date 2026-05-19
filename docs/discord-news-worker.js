const DISCORD_API = 'https://discord.com/api/v10'
const GUILD_ID = '1378365916751859742'
const CHANNELS = [
    {
        id: '1406960395482038336',
        category: 'Avisos'
    },
    {
        id: '1485740625579081848',
        category: 'Patch Notes'
    }
]

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=120'
}

function jsonResponse(body, status = 200){
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
}

function resolveTitle(message, channel){
    const embedTitle = message.embeds?.find(embed => embed.title)?.title
    if(embedTitle) {
        return embedTitle
    }

    const firstLine = (message.content || '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .find(Boolean)

    if(firstLine) {
        return firstLine.length > 90 ? `${firstLine.slice(0, 87)}...` : firstLine
    }

    return channel.category
}

function resolveContent(message){
    const embedText = (message.embeds || [])
        .map(embed => [embed.title, embed.description].filter(Boolean).join('\n'))
        .filter(Boolean)
        .join('\n\n')

    return message.content || embedText || ''
}

function resolveImages(message){
    const attachmentImages = (message.attachments || [])
        .filter(attachment => (attachment.content_type || '').startsWith('image/'))
        .map(attachment => attachment.url)

    const embedImages = (message.embeds || [])
        .flatMap(embed => [embed.image?.url, embed.thumbnail?.url])
        .filter(Boolean)

    return [...attachmentImages, ...embedImages]
}

function mapMessageToArticle(message, channel){
    return {
        id: message.id,
        category: channel.category,
        channelId: channel.id,
        title: resolveTitle(message, channel),
        author: message.author?.global_name || message.author?.username || 'Oreon',
        timestamp: message.timestamp,
        link: `https://discord.com/channels/${GUILD_ID}/${channel.id}/${message.id}`,
        content: resolveContent(message),
        images: resolveImages(message)
    }
}

async function fetchChannelMessages(channel, token, limit){
    const url = `${DISCORD_API}/channels/${channel.id}/messages?limit=${limit}`
    const res = await fetch(url, {
        headers: {
            Authorization: `Bot ${token}`
        }
    })

    if(!res.ok) {
        throw new Error(`Discord API returned ${res.status} for channel ${channel.id}.`)
    }

    const messages = await res.json()
    return messages
        .filter(message => message.content || message.embeds?.length || message.attachments?.length)
        .map(message => mapMessageToArticle(message, channel))
}

export default {
    async fetch(request, env){
        if(request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: CORS_HEADERS
            })
        }

        if(request.method !== 'GET') {
            return jsonResponse({ error: 'Method not allowed.' }, 405)
        }

        if(!env.DISCORD_BOT_TOKEN) {
            return jsonResponse({ error: 'Missing DISCORD_BOT_TOKEN secret.' }, 500)
        }

        const url = new URL(request.url)
        const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || env.MESSAGE_LIMIT || 5), 1), 20)
        const results = await Promise.all(CHANNELS.map(channel => fetchChannelMessages(channel, env.DISCORD_BOT_TOKEN, limit)))
        const articles = results
            .flat()
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

        return jsonResponse({
            source: 'discord',
            guildId: GUILD_ID,
            articles
        })
    }
}
