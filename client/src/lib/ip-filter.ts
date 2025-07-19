/**
 * IPFilter handles blocking requests from known malicious IPs.
 * Horizontal Scaling requires(Redis, DB, external APIs). TODO: Implement
 */
class IPFilter {
  private blockedIPs: Set<string>;

  constructor() {
    this.blockedIPs = new Set([
      // Static blacklist (add known bad IPs)
      "1.2.3.4",
      "5.6.7.8",
    ]);
  }

  /**
   * Check if the given IP is blocked.
   * @param ip - IP address to validate
   */
  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  /**
   * Add a new IP to the blocklist.
   * @param ip - IP address to block
   */
  block(ip: string): void {
    this.blockedIPs.add(ip);
  }

  /**
   * Remove an IP from the blocklist.
   * @param ip - IP address to unblock
   */
  unblock(ip: string): void {
    this.blockedIPs.delete(ip);
  }

  /**
   * Load additional blocked IPs (e.g., from env or config).
   */
  loadFromEnv() {
    const envList = process.env.BLOCKED_IPS?.split(",") || [];
    envList.forEach((ip) => this.blockedIPs.add(ip.trim()));
  }
}

export const ipFilter = new IPFilter();
