# AWS IVS Setup - Quick Reference

**Phase 8.5: AWS Interactive Video Service (IVS)**

---

## ✅ What You Need to Do

IVS setup is **VERY SIMPLE** - you only need to add IAM permissions!

### Step 1: Add IVS Permissions to IAM Role

**When:** Do this in Phase 8.5 (after creating Lambda role in Phase 8)

**Where:** AWS Console → IAM

**What to do:**

1. Find your IAM role:
   - If using Lambda: `live-auction-lambda-role`
   - If using EKS: Your EKS node group role

2. Click the role → **"Add permissions"** → **"Attach policies"**

3. Search for: **`AmazonIVSFullAccess`**

4. Click **"Attach policy"**

5. Done! ✅

**That's it!** No manual IVS channel creation needed.

---

## 🤖 How IVS Works Automatically

### Backend Creates Channels Automatically

When a user creates an auction via your API:

1. **Backend calls IVS API** ([backend/shared/aws/ivs_client.py](backend/shared/aws/ivs_client.py:23-72))
   ```python
   ivs_channel = ivs_client.create_channel(
       auction_id=str(auction_id),
       auction_title="My Auction"
   )
   ```

2. **AWS IVS returns:**
   - `channel_arn`: Channel identifier
   - `stream_key`: Secret for broadcasting
   - `playback_url`: Public URL for viewers
   - `ingest_endpoint`: RTMP server address

3. **Backend stores in PostgreSQL:**
   - Saved in `auctions` table ([STUDENT_DEPLOYMENT_GUIDE_PART2.md](STUDENT_DEPLOYMENT_GUIDE_PART2.md:111-113))
   ```sql
   ivs_channel_arn VARCHAR(255)
   ivs_stream_key TEXT
   ivs_playback_url TEXT
   ```

4. **When auction ends:**
   - Backend calls `ivs_client.delete_channel()` to clean up

---

## 💰 IVS Costs

**Good news:** IVS costs are very low for a demo!

### Pricing (us-east-1)
- **Input:** $0.09/hour of video streamed by host
- **Output:** $0.015/hour of video delivered per viewer
- **Storage:** $0 (we don't record videos)

### Demo Usage Estimate
- **1 test auction** (5 min streaming, 5 viewers): ~$0.02
- **10 test auctions** (10 min each, 5 viewers): ~$0.20-1.00
- **Monthly total: $1-5** (very conservative estimate)

**Per-auction cost is negligible!** You can test freely.

---

## 🔧 Backend Configuration

### Environment Variables

Your backend services need these environment variables:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>  # If not using IAM roles
AWS_SECRET_ACCESS_KEY=<your-secret>
IVS_CHANNEL_TYPE=STANDARD  # or BASIC (cheaper, lower quality)
```

**For EKS deployments**, add to Kubernetes secrets:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: aws-credentials
  namespace: live-auction
type: Opaque
stringData:
  AWS_REGION: "us-east-1"
  AWS_ACCESS_KEY_ID: "your-access-key"
  AWS_SECRET_ACCESS_KEY: "your-secret-key"
  IVS_CHANNEL_TYPE: "STANDARD"
```

### Channel Types

- **STANDARD:** Better quality, higher latency (~3-5 sec), costs more
- **BASIC:** Lower quality, ultra-low latency (~1-3 sec), **saves ~40% on costs**

For a demo, **BASIC is recommended** to save money!

Change in [backend/shared/config/settings.py](backend/shared/config/settings.py):
```python
IVS_CHANNEL_TYPE = "BASIC"  # Change from STANDARD to BASIC
```

---

## 🧪 Testing IVS (After Backend Deployment)

### Test 1: Create Auction via API

```bash
curl -X POST http://[API_URL]:8000/api/auctions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -d '{
    "title": "Test Auction",
    "description": "Testing IVS",
    "starting_bid": 100,
    "duration": 300,
    "category": "electronics"
  }'
```

**Expected response includes:**
```json
{
  "auction_id": "550e8400-e29b-41d4-a716-446655440000",
  "ivs_channel_arn": "arn:aws:ivs:us-east-1:123456789012:channel/AbCdEfGh",
  "ivs_playback_url": "https://xxxxx.us-east-1.playback.live-video.net/api/video/v1/...",
  "ivs_stream_key": "sk_us-east-1_AbCdEfGh1234567890"
}
```

### Test 2: Verify in AWS Console

1. AWS Console → Search **"IVS"** → **"Amazon IVS"**
2. Click **"Channels"**
3. You should see: `auction_[auction_id]`
4. Status: **"LIVE"** (ready to receive stream)

### Test 3: Stream Video (Optional)

**Using OBS Studio (free software):**

1. Download **OBS Studio**: https://obsproject.com/

2. Settings → Stream:
   - Service: **Custom**
   - Server: `rtmps://[ingest_endpoint]:443/app/`
   - Stream Key: `[ivs_stream_key from API response]`

3. Click **"Start Streaming"**

4. Open `ivs_playback_url` in browser to watch!

---

## ❌ What NOT to Do

- ❌ **Don't manually create IVS channels** - backend does it automatically
- ❌ **Don't leave channels running** - backend deletes them when auctions end
- ❌ **Don't use STANDARD if cost is a concern** - use BASIC instead
- ❌ **Don't enable recording** - adds storage costs

---

## 🆘 Troubleshooting

### Error: "Failed to create IVS channel"

**Check:**
1. ✅ IAM role has `AmazonIVSFullAccess` policy attached
2. ✅ AWS credentials are correct in backend config
3. ✅ Region is `us-east-1` (IVS not available in all regions)
4. ✅ AWS account has IVS service enabled

**Verify IAM permissions:**
```bash
aws ivs list-channels --region us-east-1
# Should return empty list (not error)
```

### Backend Logs Show IVS Error

**Check backend logs:**
```bash
# For EKS
kubectl logs [pod-name] -n live-auction | grep -i ivs

# For local testing
docker logs [container-name] | grep -i ivs
```

**Common error:** "AccessDeniedException"
- **Fix:** Add `AmazonIVSFullAccess` policy to IAM role

---

## 📚 Reference Files

- **IVS Client Code:** [backend/shared/aws/ivs_client.py](backend/shared/aws/ivs_client.py)
- **Auction Service:** [backend/auction-management-service/app/services/auction_service.py](backend/auction-management-service/app/services/auction_service.py:40-47)
- **Database Schema:** [STUDENT_DEPLOYMENT_GUIDE_PART2.md](STUDENT_DEPLOYMENT_GUIDE_PART2.md:111-113)
- **Full Setup Guide:** [COMPLETED_DEPLOYMENT_PHASES.md](COMPLETED_DEPLOYMENT_PHASES.md) - Phase 8.5

---

## ✅ Quick Checklist

- [ ] Phase 8 complete (Lambda role created)
- [ ] Attached `AmazonIVSFullAccess` to Lambda/EKS IAM role
- [ ] Set `IVS_CHANNEL_TYPE=BASIC` in backend config (optional, saves cost)
- [ ] Backend deployed with AWS credentials
- [ ] Tested creating auction via API
- [ ] Verified IVS channel created in AWS Console
- [ ] (Optional) Tested streaming with OBS Studio

---

**That's it! IVS is now ready to use.** 🚀

Your backend will automatically create and delete IVS channels as needed. You just needed to add the IAM permissions!
