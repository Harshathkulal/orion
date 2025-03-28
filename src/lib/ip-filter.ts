class IPFilter {
    private blockedIPs: Set<string>;
  
    constructor() {
      this.blockedIPs = new Set([
        // Add known malicious IPs
        '1.2.3.4',
        '5.6.7.8'
      ]);
    }
  
    isBlocked(ip: string): boolean {
      return this.blockedIPs.has(ip);
    }
  }
  
  export const ipFilter = new IPFilter();