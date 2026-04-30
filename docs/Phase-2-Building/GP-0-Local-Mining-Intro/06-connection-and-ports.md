---
sidebar_position: 6
title: '🌐 Unit 6: Connection, Ports & Ngrok for CGNAT'
description: 'Set up firewall port 8091 per OS, detect whether your ISP uses CGNAT, and use Ngrok or Cloudflare Tunnel so validators can reach your miner from the internet.'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Unit 6: Connection, Ports & Ngrok for CGNAT

:::info Goal of This Unit
By the end of this unit you will:
- Understand why **port 8091 being open** matters for the miner
- Be able to **check if your ISP uses CGNAT** or has a public IP
- Set up the **firewall per OS** (Windows, macOS, Linux)
- Use an **Ngrok TCP tunnel** as a CGNAT solution: your local miner stays reachable by validators
:::

:::note Prerequisites
- ✅ [Unit 5](./run-local-miner) complete: the miner can start
- ✅ Know your miner UID on testnet
:::

---

## 🔌 Why Does the Port Need to Be Open?

When the miner runs, it opens an **axon endpoint**: an HTTP server on port 8091 (default). Validators need to **reach this endpoint from the internet** in order to:
1. Send queries to your miner
2. Verify whether the miner is still active (health check)
3. Score the miner's responses and set weights

If port 8091 is not reachable from the internet → validators can't reach you → `Active: False` in the metagraph → **score 0, no reward**.

---

## 🔍 Step 1: Check Your Internet Connection Type

### Detect the Public IP

```bash
# Check the public IP visible from the internet
curl -s ifconfig.me
```

### Detect CGNAT

```bash
# Check your local IP
ip addr show    # Linux/WSL2
ifconfig        # macOS
```

**Compare the two outputs:**

| Condition | Meaning |
|-----------|---------|
| `curl ifconfig.me` = a public IP, `ip addr` = `192.168.x.x` | Normal home NAT: port forwarding on the router works |
| `curl ifconfig.me` = a public IP, but `ip addr` = `10.x.x.x` or `100.64.x.x–100.127.x.x` | **CGNAT**: port forwarding won't work! |
| `curl ifconfig.me` fails / times out | Connection problem |

:::warning Residential ISPs & CGNAT
Common residential ISP CGNAT status (varies by region: these are typical patterns):

| ISP type | IP type | CGNAT? | Solution |
|----------|---------|--------|----------|
| Most residential ISPs | Dynamic private | ✅ CGNAT | Ngrok / Cloudflare Tunnel |
| Business / dedicated lines | Static public | ❌ Usually not | Port forward on the router |

If your ISP uses CGNAT → **go directly to Step 3 (Ngrok)**.
:::

---

## 🔥 Step 2: Open Port 8091 on the Firewall

If you're **not on CGNAT** (you have a static public IP or can port-forward on the router), set up the firewall first.

<Tabs>
<TabItem value="linux-wsl" label="🐧 Linux / WSL2" default>

```bash
# Open port 8091 with UFW
sudo ufw allow 8091/tcp
sudo ufw status

# Output:
# Status: active
# 8091/tcp          ALLOW Anywhere
```

:::note WSL2 and the Windows Firewall
WSL2 must also be configured in the **Windows Firewall**. Open PowerShell as Admin:

```powershell
New-NetFirewallRule -DisplayName "Bittensor Miner 8091" -Direction Inbound -LocalPort 8091 -Protocol TCP -Action Allow
```

And port-forward from Windows to WSL2:
```powershell
# Replace <WSL2_IP> with your WSL2 IP (check with: wsl hostname -I)
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8091 connectaddress=<WSL2_IP> connectport=8091
```
:::

</TabItem>
<TabItem value="macos" label="🍎 macOS">

macOS uses an Application Firewall (not port-based). Python typically asks for permission the first time it opens a port.

If a "Do you want the application 'Python' to accept incoming network connections?" dialog appears → click **Allow**.

If it doesn't appear, enable it via System Settings:

1. System Settings → Network → Firewall
2. Click Firewall Options
3. Add Python (`/usr/local/bin/python3.10` or the equivalent path) → Allow Incoming Connections

Verify the port is open:

```bash
lsof -i :8091
# Output should show python3 listening on port 8091
```

</TabItem>
<TabItem value="linux" label="🐧 Linux (Non-WSL)">

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 8091/tcp
sudo ufw enable
sudo ufw status

# firewalld (Fedora/RHEL)
sudo firewall-cmd --permanent --add-port=8091/tcp
sudo firewall-cmd --reload
```

If using iptables directly:

```bash
sudo iptables -A INPUT -p tcp --dport 8091 -j ACCEPT
```

</TabItem>
</Tabs>

### Test the Connection from Outside

After the miner is running and the port is open, test with an online tool:

1. Open **portchecker.co** or **canyouseeme.org**
2. Enter your public IP + port 8091
3. Click "Check"

If the result is "Open" → validators can reach you without a tunnel.

---

## 🚇 Step 3: Ngrok TCP Tunnel (CGNAT Solution)

Ngrok creates a tunnel from the internet to your localhost: validators don't need to know your real IP, only the ngrok tunnel address.

### Install Ngrok

<Tabs>
<TabItem value="linux-wsl-ngrok" label="🐧 Linux / WSL2" default>

```bash
# Add the ngrok repo
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null

echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list

sudo apt update && sudo apt install ngrok
```

</TabItem>
<TabItem value="macos-ngrok" label="🍎 macOS">

```bash
brew install ngrok/ngrok/ngrok
```

</TabItem>
</Tabs>

### Create an Ngrok Account & Auth Token

1. Open **ngrok.com** → Sign Up (free)
2. After login, go to **Dashboard → Your Authtoken**
3. Copy your authtoken

Set up the authtoken in your terminal:

```bash
ngrok config add-authtoken <YOUR_TOKEN>
```

### Open a Tunnel to Port 8091

```bash
ngrok tcp 8091
```

Ngrok output:

```text
ngrok

Session Status: online
Account: you@email.com (Plan: Free)
Version: 3.x.x
Region: Asia Pacific (ap)
Latency: 45ms

Forwarding tcp://0.tcp.ap.ngrok.io:XXXXX -> localhost:8091
```

Note the forwarding address, e.g.: `0.tcp.ap.ngrok.io:12345`

### Run the Miner With the Ngrok External IP

Restart the miner with the ngrok parameters as the external IP:

```bash
python neurons/miner.py \
  --netuid 1 \
  --wallet.name mywallet \
  --wallet.hotkey miner1 \
  --subtensor.network test \
  --axon.port 8091 \
  --axon.external_ip 0.tcp.ap.ngrok.io \
  --axon.external_port 12345 \
  --logging.debug
```

Replace `0.tcp.ap.ngrok.io` and `12345` with the values from your ngrok output.

:::warning Ngrok Free Plan: Limitations
- Free plan: **1 TCP tunnel at a time**, the ngrok address changes every restart
- Each ngrok restart → new address → must update the `--axon.external_ip` and `--axon.external_port` flags
- For stable production mining, upgrade to Ngrok Pro (static address) or use a VPS

For testnet GP-0, the free plan is enough to learn the flow.
:::

---

## ☁️ Alternative: Cloudflare Tunnel

Cloudflare Tunnel is more stable for production (the address doesn't change), but setup is more involved.

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Login (opens a browser)
cloudflared tunnel login

# Create the tunnel
cloudflared tunnel create bittensor-miner

# Create the config
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOF
tunnel: bittensor-miner
credentials-file: ~/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: miner.yourdomain.com
    service: tcp://localhost:8091
  - service: http_status:404
EOF

# Run the tunnel
cloudflared tunnel run bittensor-miner
```

:::note Cloudflare Tunnel Requires a Domain
Cloudflare Tunnel requires a domain registered with Cloudflare. If you don't have a domain, Ngrok is more practical for learning.
:::

---

## 📊 Comparing Connection Solutions

| Solution | Best For | Setup | Stability | Cost |
|----------|----------|-------|-----------|------|
| **Router port forward** | Public IP without CGNAT | Easy | High | Free |
| **Ngrok Free** | CGNAT, learning/testnet | Easy | Medium (address changes) | Free |
| **Ngrok Pro** | CGNAT, semi-production | Easy | High | ~$10/month |
| **Cloudflare Tunnel** | CGNAT, production | Medium | Very high | Free (needs a domain) |
| **VPS in your region** | Serious production | Medium | Very high | ~$40/month |

---

## 🐛 Connection Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `Active: False` in metagraph | Port not reachable | Check firewall, use Ngrok |
| Ngrok "ERR_NGROK_108" | Free tunnel limit reached | Log out all sessions: re-run `ngrok authtoken <token>` |
| Ngrok tunnel connects but miner doesn't respond | Miner port differs from the tunnel | Make sure the miner uses port 8091 and ngrok uses `ngrok tcp 8091` |
| `axon.external_ip` becomes obsolete too quickly | Ngrok restart changed the address | Restart the miner with the new ngrok address |
| macOS firewall blocks Python | The dialog didn't appear | System Settings → Network → Firewall → Firewall Options → Add Python |
| WSL2 port not accessible from Windows | Port proxy not yet configured | Run `netsh interface portproxy` in PowerShell Admin |

---

## 🎯 Summary

- **Port 8091** must be reachable from the internet for validators to query the miner
- **CGNAT** = residential ISP shares one IP → can't port-forward → need a tunnel
- Most residential ISPs use CGNAT
- **Ngrok TCP** = the fastest CGNAT solution (the free plan is enough for testnet)
- **Miner flags**: add `--axon.external_ip` and `--axon.external_port` with values from ngrok

### ✅ Quick Check

1. How do you detect whether your ISP uses CGNAT?
2. What happens to the miner's scoring if the port isn't reachable?
3. Why does the ngrok free-plan address change?
4. When is a VPS better than ngrok for mining?

<details>
<summary>💡 Answers</summary>

1. Compare `curl ifconfig.me` (IP from the internet) with `ip addr` (local IP). If local is `10.x.x.x` or `100.64–127.x.x` = CGNAT.
2. `Active: False` in metagraph → validators can't query → **score 0** → no TAO reward.
3. The ngrok free plan doesn't provide a static address: every ngrok restart, the server assigns a new random address. Ngrok Pro/Teams have reserved domains/IPs.
4. A VPS is better when: (1) you need 24/7 uptime without restarts; (2) home internet isn't stable; (3) serious mainnet production mining. Ngrok is fine for testnet + learning.

</details>

---

**Next:** [Unit 7: Local Debugging & Troubleshooting →](./local-debugging)

*Open connection = miner can be scored. 🔓*
