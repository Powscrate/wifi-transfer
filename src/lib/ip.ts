import { networkInterfaces } from 'os';

export function getLocalIp(): string {
    const nets = networkInterfaces();
    const results: Record<string, string[]> = {};

    for (const name of Object.keys(nets)) {
        const net = nets[name];
        if (net) {
            for (const anet of net) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (anet.family === 'IPv4' && !anet.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(anet.address);
                }
            }
        }
    }
    
    // Prioritize common Wi-Fi and Ethernet interface names
    const preferredInterfaces = ['wlan0', 'wlan1', 'Wi-Fi', 'eth0', 'eth1', 'Ethernet'];
    for(const iface of preferredInterfaces) {
        if(results[iface]?.[0]) {
            return results[iface][0];
        }
    }

    // Fallback to the first found address if preferred interfaces are not found
    const firstInterfaceName = Object.keys(results)[0];
    if (firstInterfaceName && results[firstInterfaceName].length > 0) {
        return results[firstInterfaceName][0];
    }

    // Final fallback for environments where detection is not possible
    return '127.0.0.1';
}
