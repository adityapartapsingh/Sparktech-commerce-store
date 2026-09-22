# System Design Concepts & Production Guide: SparkTech

## 1. System Design Architecture Map

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  CLIENT TIER (React 19 SPA)                                                      │
│  • Debouncing (Search bar)       • Throttling (Scroll / Resizing / Click Spam)   │
│  • Optimistic UI Updates         • Local Storage / Memory Token Handling         │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ HTTPS / TLS 1.3 Handshake
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│  EDGE & NETWORK TIER                                                             │
│  • DNS (Route 53 / GeoDNS)       • CDN (Cloudflare / CloudFront)                 │
│  • SSL/TLS Termination           • L7 Load Balancer (Nginx / AWS ALB)            │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ Reverse Proxy / Routing
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│  APPLICATION & API GATEWAY TIER (Node.js / Express 5)                            │
│  • Rate Limiting (Token Bucket)  • Idempotency Keys (Payments & Orders)          │
│  • Circuit Breaker Pattern       • Stateless JWT Sessions                        │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ Caching & Async Pipelines
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│  DISTRIBUTED DATA & INFRASTRUCTURE TIER                                          │
│  • Redis Cache-Aside & Redlock   • Consistent Hashing (Node Sharding)            │
│  • Message Queue (BullMQ / Kafka)• ZooKeeper vs etcd vs Redis Consensus         │
│  • MongoDB Read Replicas (CQRS)  • Atomic Concurrency ($inc / Distributed Lock)  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend System Design Concepts

### A. Debouncing
- **Problem**: When a user types in a live search bar for a microcontroller like `ESP32-S3-WROOM`, firing an HTTP request per keystroke overwhelms the backend with 16 requests.
- **Solution**: Debouncing delays execution until a quiet period (e.g. 300ms) has passed since the last keystroke.
- **Implementation**:
  ```javascript
  function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
  }
  ```

### B. Throttling
- **Problem**: A user frantically double-clicking "Add to Cart" or "Buy Now" triggers duplicate cart requests; continuous window resizing causes layout re-calculation thrashing.
- **Solution**: Throttling enforces a maximum frequency of execution (e.g. at most once every 500ms).

---

## 3. Network & Edge Infrastructure

### C. DNS (Domain Name System)
- **Role**: Translates domain names to IP addresses.
- **Production Setup**:
  - **Anycast DNS**: Routes the user to the nearest geographic DNS server.
  - **GeoDNS Routing (AWS Route 53)**: Directs Indian traffic to Mumbai/Bangalore clusters, and international traffic to Europe/US clusters.
  - **Health-Check Automated Failover**: If the primary cluster fails, DNS routes to a secondary standby cluster.

### D. HTTPS & TLS 1.3 Handshake
- **Layer 4**: TCP 3-Way Handshake (`SYN`, `SYN-ACK`, `ACK`).
- **Layer 7**: TLS 1.3 (1-RTT Handshake):
  1. `ClientHello` includes supported cipher suites and key share parameters.
  2. `ServerHello` responds with chosen cipher and server key share.
  3. **ECDHE (Elliptic Curve Diffie-Hellman)** calculates a shared secret without ever sending the key over the wire.
  4. Server sends its Digital Certificate signed by a trusted CA (Let's Encrypt / DigiCert) to verify authenticity.
  5. The session switches to fast symmetric encryption (`AES-256-GCM`) for all HTTP traffic.

### E. CDN (Content Delivery Network)
- **Static Assets**: React bundles, CSS, and fonts cached at edge points of presence (PoP).
- **Media CDN (Cloudinary)**: Component datasheets, pinout charts, and product images transformed to `.webp`/`.avif` and cached with `Cache-Control: public, max-age=31536000, immutable`.

### F. Load Balancer (L4 vs L7)
- **Layer 4 (Transport Layer)**: High-throughput routing based strictly on IP and TCP port.
- **Layer 7 (Application Layer - AWS ALB / Nginx)**:
  - Inspects HTTP headers, cookies, and URLs.
  - **SSL Termination**: Decrypts HTTPS traffic at the load balancer, offloading cryptographic computation from application workers.
  - **Path-based routing**: Routes `/api/v1/payments/*` to payment microservices, and `/api/v1/products/*` to catalog workers.

---

## 4. Application & Distributed Systems

### G. Rate Limiting (Token Bucket & Sliding Window)
- Prevents scraping and DDoS.
- **Sliding Window Log in Redis**:
  - Stores request timestamps in Redis Sorted Sets (`ZADD`).
  - Clears timestamps older than 60 seconds (`ZREMRANGEBYSCORE`).
  - Checks if remaining count exceeds threshold (`ZCARD`). Returns HTTP 429 if exceeded.

### H. Idempotency Keys
- Prevents duplicate credit card charges if mobile network disconnects mid-checkout.
- Client passes `Idempotency-Key: <UUID>`.
- Backend stores transaction state in Redis with a 120s TTL. Duplicate requests receive the cached initial result without executing a second payment.

### I. Consistent Hashing
- Distributes cache keys across a cluster of $N$ Redis instances using a hash ring ($0$ to $2^{32}-1$).
- Standard modulo hashing (`hash(key) % N`) reshuffles ~100% of keys when a node joins/leaves, creating a devastating Cache Stampede on the database.
- Consistent hashing reshuffles only $K/N$ keys, using virtual nodes (Vnodes) to balance load evenly.

### J. Distributed Coordination: ZooKeeper vs etcd vs Redis Redlock
- **Apache ZooKeeper**: Heavy, requires JVM. Used for large distributed systems like Kafka and Hadoop. Overkill for SparkTech.
- **etcd**: Lightweight Raft consensus, standard for Kubernetes state.
- **Redis Redlock**: Recommended for SparkTech. Uses quorum locking across Redis nodes to safely manage flash-sale inventory without race conditions.
