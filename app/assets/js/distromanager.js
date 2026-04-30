const { DistributionAPI } = require('helios-core/common')

const ConfigManager = require('./configmanager')

// Host docs/oreon_distribution.json at this URL before distributing the launcher.
exports.REMOTE_DISTRO_URL = 'http://151.242.227.173/launcher/distribution.json'

const api = new DistributionAPI(
    ConfigManager.getLauncherDirectory(),
    null, // Injected forcefully by the preloader.
    null, // Injected forcefully by the preloader.
    exports.REMOTE_DISTRO_URL,
    false
)

exports.DistroAPI = api
