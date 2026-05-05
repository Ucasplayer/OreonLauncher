const fs = require('fs-extra')
const path = require('path')

const TAG_END = 0
const TAG_BYTE = 1
const TAG_STRING = 8
const TAG_LIST = 9
const TAG_COMPOUND = 10

function writeShort(parts, value) {
    const buffer = Buffer.alloc(2)
    buffer.writeUInt16BE(value)
    parts.push(buffer)
}

function writeInt(parts, value) {
    const buffer = Buffer.alloc(4)
    buffer.writeInt32BE(value)
    parts.push(buffer)
}

function writeStringPayload(parts, value) {
    const buffer = Buffer.from(value, 'utf8')
    writeShort(parts, buffer.length)
    parts.push(buffer)
}

function writeNamedTagHeader(parts, type, name) {
    parts.push(Buffer.from([type]))
    writeStringPayload(parts, name)
}

function writeByte(parts, name, value) {
    writeNamedTagHeader(parts, TAG_BYTE, name)
    parts.push(Buffer.from([value]))
}

function writeString(parts, name, value) {
    writeNamedTagHeader(parts, TAG_STRING, name)
    writeStringPayload(parts, value)
}

function buildServersDat(servers) {
    const parts = []

    writeNamedTagHeader(parts, TAG_COMPOUND, '')
    writeNamedTagHeader(parts, TAG_LIST, 'servers')
    parts.push(Buffer.from([TAG_COMPOUND]))
    writeInt(parts, servers.length)

    for(const server of servers) {
        writeString(parts, 'name', server.name)
        writeString(parts, 'ip', server.ip)
        writeByte(parts, 'acceptTextures', server.acceptTextures ? 1 : 0)
        writeByte(parts, 'hidden', server.hidden ? 1 : 0)
        parts.push(Buffer.from([TAG_END]))
    }

    parts.push(Buffer.from([TAG_END]))

    return Buffer.concat(parts)
}

exports.writeServerList = function(gameDir, servers) {
    fs.ensureDirSync(gameDir)
    fs.writeFileSync(path.join(gameDir, 'servers.dat'), buildServersDat(servers))
}
