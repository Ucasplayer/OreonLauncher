const { mcVersionAtLeast } = require('helios-core/common')
const { JdkDistribution, Platform } = require('helios-distribution-types')

function resolveServerJavaOptions(server) {
    const rawJavaOptions = server?.rawServer?.javaOptions ?? {}
    const platformOptions = rawJavaOptions.platformOptions ?? []
    const mergeableProps = []

    for(const option of platformOptions){
        if(option.platform === process.platform){
            if(option.architecture === process.arch){
                mergeableProps[0] = option
            } else if(option.architecture == null){
                mergeableProps[1] = option
            }
        }
    }

    mergeableProps[3] = {
        distribution: rawJavaOptions.distribution,
        supported: rawJavaOptions.supported,
        suggestedMajor: rawJavaOptions.suggestedMajor
    }

    const merged = {}
    for(let i = mergeableProps.length - 1; i >= 0; i--){
        const option = mergeableProps[i]
        if(option != null){
            if(option.distribution != null){
                merged.distribution = option.distribution
            }
            if(option.supported != null){
                merged.supported = option.supported
            }
            if(option.suggestedMajor != null){
                merged.suggestedMajor = option.suggestedMajor
            }
        }
    }

    const modernVersion = mcVersionAtLeast('1.17', server.rawServer.minecraftVersion)

    return {
        supported: merged.supported ?? (modernVersion ? '>=17.x' : '8.x'),
        distribution: merged.distribution ?? (process.platform === Platform.DARWIN ? JdkDistribution.CORRETTO : JdkDistribution.TEMURIN),
        suggestedMajor: merged.suggestedMajor ?? (modernVersion ? 17 : 8),
    }
}

exports.resolveServerJavaOptions = resolveServerJavaOptions
