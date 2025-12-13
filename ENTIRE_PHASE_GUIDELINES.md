# Overview of all the phases we have
1. Phase 1: AWS Cognito Setup - DONE 🟩
2. Phase 2: Frontend (we should do this with phase 12)
3. Phase 3: Network Setup - Use Default VPC - DONE 🟩
4. Phase 4: RDS PostgreSQL - DONE 🟩
5. Phase 5: ElastiCache Redis - DONE 🟩
6. Phase 6: DynamoDB - DONE 🟩
7. Phase 7: SQS Queues - DONE 🟩
8. Phase 8: Lambda Functions- DONE 🟩
9. Phase 9: Initialize Database - DONE 🟩
10. Phase 10: EKS Cluster
11. Phase 11: Backend Services
12. Phase 12: Update Frontend with backend url
13. Phase 13: Testing 
14. Phase 14 : IVS

## 📊 Data Storage Architecture

**Important: Where Data is Stored**

| Data Type | Storage Location | How It's Created |
|-----------|-----------------|------------------|
| **Users** | PostgreSQL (RDS) - `users` table | ✅ **Automatically synced** from Cognito when user signs up/logs in |
| **Auctions** | PostgreSQL (RDS) - `auctions` table | Created via API when user creates an auction |
| **Bid History** | DynamoDB - `bids_history` table | Created when users place bids (via Lambda) |

**Key Points:**
- ✅ **Users are automatically synced** from Cognito to PostgreSQL - no manual creation needed
- ✅ DynamoDB is **ONLY for bid history**, not for users
- ✅ User sync happens automatically in the backend after signup/login
- ✅ The `user_id` in PostgreSQL matches the Cognito `sub` (UUID)

# Details

## Phase 1: AWS Cognito Setup (FREE) - 20 minutes

### Step 1.1: Create User Pool

1. **AWS Console** → Search **"Cognito"** → Click **"Cognito"**

2. Click **"Create user pool"**

3. **Step 1: Configure sign-in experience**
   - Provider types: ☑️ **Cognito user pool**
   - Cognito user pool sign-in options:
     - ☑️ **Email**
     - ☐ Username (uncheck)
     - ☐ Phone number (uncheck)
   - Click **Next**

4. **Step 2: Configure security requirements**
   - Password policy strength: **Cognito defaults**
   - Multi-factor authentication: **No MFA** (to keep it simple)
   - User account recovery: ☑️ **Enable self-service account recovery**
     - Delivery method: **Email only**
   - Click **Next**

5. **Step 3: Configure sign-up experience**
   - Self-service sign-up: ☑️ **Enable self-registration**
   - Cognito-assisted verification: ☑️ **Allow Cognito to automatically send messages**
   - Attributes to verify: ☑️ **Send email message, verify email address**
   - Required attributes:
     - ☑️ **email**
     - ☑️ **name**
   - Click **Next**

6. **Step 4: Configure message delivery**
   - Email provider: ☑️ **Send email with Cognito** (FREE)
   - SES Region: us-east-1
   - FROM email address: (use default)
   - Click **Next**

7. **Step 5: Integrate your app**
   - User pool name: `live-auction-users`
   - ☐ **Uncheck** Use the Cognito Hosted UI
   - App type: **Public client**
   - App client name: `live-auction-web-app`
   - Client secret: ☐ **Don't generate a client secret**
   - Advanced app client settings:
     - Authentication flows:
       - ☑️ **ALLOW_USER_PASSWORD_AUTH**
       - ☑️ **ALLOW_REFRESH_TOKEN_AUTH**
       - ☑️ **ALLOW_USER_SRP_AUTH**
   - Click **Next**

8. **Step 6: Review and create**
   - Review all settings
   - Click **Create user pool**

9. **Save Configuration:**
   After creation, copy these values:
   ```
   User Pool ID: us-east-1_XXXXXXXXX
   ```

   Then:
   - Click **"App integration"** tab
   - Under **"App clients and analytics"**, click your app client name
   - Copy:
   ```
   Client ID: xxxxxxxxxxxxxxxxxxxxx
   ```

### Step 1.2: Create Test User

1. In User Pool → **"Users"** tab → **"Create user"**

2. Fill in:
   - Email address: `demo@example.com`
   - ☐ Uncheck "Send an email invitation"
   - ☑️ Check **"Mark email address as verified"**
   - Temporary password: `Demo123!`

3. Click **"Create user"**

4. Set permanent password:
   - Select the user
   - **Actions** → **"Confirm account"**
   - Then **Actions** → **"Reset password"**
   - New password: `Demo1234!`
   - ☑️ Check "Password is permanent"

✅ **Cognito Complete! Cost: $0 (FREE)**

**📌 Important Note: Automatic User Sync to PostgreSQL**
- When users sign up or log in via Cognito, they are **automatically synced** to PostgreSQL (RDS)
- The backend extracts user info from Cognito JWT tokens and creates/updates users in the `users` table
- **No manual user creation needed** in the database - it happens automatically after authentication
- User data is stored in **PostgreSQL (RDS)**, not in DynamoDB
- See Phase 9 for database initialization details

---

## Phase 2: Frontend Deployment (FREE) - 30 minutes

### Step 2.1: Create S3 Bucket

1. **AWS Console** → Search **"S3"** → **"S3"**

2. Click **"Create bucket"**

3. **General configuration:**
   - Bucket name: `live-auction-demo-yourname` (must be globally unique)
   - AWS Region: **US East (N. Virginia) us-east-1**

4. **Object Ownership:**
   - ☑️ **ACLs disabled (recommended)**

5. **Block Public Access:**
   - ☐ **UNCHECK "Block all public access"**
   - ☑️ Check acknowledgment: "I acknowledge..."

6. **Bucket Versioning:**
   - ☑️ **Enable** (helpful for rollbacks)

7. **Default encryption:**
   - ☑️ **Enable**
   - Encryption type: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**

8. Click **"Create bucket"**

### Step 2.2: Configure S3 for Static Hosting

1. Click your bucket name

2. Go to **"Properties"** tab

3. Scroll to **"Static website hosting"**

4. Click **"Edit"**
   - Static website hosting: ☑️ **Enable**
   - Hosting type: **Host a static website**
   - Index document: `index.html`
   - Error document: `index.html`
   - Click **"Save changes"**

### Step 2.3: Add Bucket Policy

1. Go to **"Permissions"** tab

2. Scroll to **"Bucket policy"**

3. Click **"Edit"**

4. Paste this (replace `YOUR-BUCKET-NAME`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```

5. Click **"Save changes"**

### Step 2.4: Build and Upload Frontend

On your Mac:

```bash
cd ~/Documents/Projects/live_flash_auction/frontend

# Create production environment file
cat > .env.production << 'EOF'
# Cognito Configuration (replace with your values)
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_REGION=us-east-1

# Backend URLs (temporary - will update later)
VITE_API_BASE_URL=http://localhost:8000
VITE_WEBSOCKET_URL=ws://localhost:8001
EOF

# Install and build
npm install
npm run build

# Upload to S3 (replace bucket name)
aws s3 sync dist/ s3://live-auction-demo-yourname/ --delete
```

### Step 2.5: Create CloudFront Distribution (FREE)

1. **AWS Console** → Search **"CloudFront"** → **"CloudFront"**

2. Click **"Create distribution"**

3. **Origin:**
   - Origin domain: **Click dropdown** → Select your S3 bucket
   - IMPORTANT: After selecting, click **"Use website endpoint"**
   - Origin path: (leave empty)
   - Name: (auto-filled)

4. **Default cache behavior:**
   - Viewer protocol policy: ☑️ **Redirect HTTP to HTTPS**
   - Allowed HTTP methods: **GET, HEAD**
   - Cache policy: **CachingOptimized**
   - Response headers policy: **SimpleCORS**

5. **Settings:**
   - Price class: **Use only North America and Europe** (cheaper)
   - Alternate domain name (CNAME): (leave empty)
   - Default root object: `index.html`

6. Click **"Create distribution"**

7. **⏰ Wait 15-20 minutes** for deployment (Status: "Enabled")

8. **Configure Error Pages:**
   - Click your distribution ID
   - Go to **"Error pages"** tab
   - Click **"Create custom error response"**
     - HTTP error code: **404: Not Found**
     - Customize error response: **Yes**
     - Response page path: `/index.html`
     - HTTP Response code: **200: OK**
     - Click **"Create custom error response"**
   - Repeat for **403: Forbidden** error

9. **Copy CloudFront URL:**
   - Distribution domain name: `d111111abcdef8.cloudfront.net`

✅ **Frontend Deployed! Cost: $0 (FREE TIER)**

---

## Phase 3: Network Setup - Use Default VPC (FREE) - 5 minutes

**💡 Good News:** AWS automatically creates a default VPC for you! We'll use it instead of creating a new one.

### Step 3.1: Find Your Default VPC Information

1. **AWS Console** → Search **"VPC"** → **"VPC"**

2. Click **"Your VPCs"** in the left sidebar

3. Find the VPC with **Default VPC** = **Yes**
   - Note down **VPC ID**: `vpc-xxxxx` (usually starts with vpc-)
   - Note down **IPv4 CIDR**: Usually `172.31.0.0/16`

4. Click **"Subnets"** in the left sidebar

5. Find subnets belonging to your default VPC (filter by VPC ID)
   - You should see 3-6 subnets (one per availability zone)
   - Note down at least 2 subnet IDs:
     - Subnet 1 (us-east-1a): `subnet-xxxxx`
     - Subnet 2 (us-east-1b): `subnet-yyyyy`

**Save these values in `MY_AWS_CONFIG.txt`**

### Step 3.2: Create Security Groups

**RDS Security Group:**

1. **VPC** → **"Security Groups"** → **"Create security group"**
   - Security group name: `live-auction-rds-sg`
   - Description: `Security group for RDS`
   - VPC: Select your **default VPC** (the one you noted above)
   - **Inbound rules:**
     - Click **"Add rule"**
     - Type: **PostgreSQL**
     - Port range: **5432** (auto-filled)
     - Source: **Anywhere-IPv4** (0.0.0.0/0) - OK for demo
   - Click **"Create security group"**

**Redis Security Group:**

2. **Create security group**
   - Security group name: `live-auction-redis-sg`
   - Description: `Security group for Redis`
   - VPC: Select your **default VPC**
   - **Inbound rules:**
     - Click **"Add rule"**
     - Type: **Custom TCP**
     - Port: **6379**
     - Source: **Anywhere-IPv4** (0.0.0.0/0) - OK for demo
   - Click **"Create security group"**

**EKS Security Group:**

3. **Create security group**
   - Security group name: `live-auction-eks-sg`
   - Description: `Security group for EKS`
   - VPC: Select your **default VPC**
   - **Inbound rules:**
     - Click **"Add rule"**
     - Type: **All traffic**
     - Source: **Anywhere-IPv4** (0.0.0.0/0) - OK for demo
   - Click **"Create security group"**

✅ **Network Setup Complete! Cost: $0 (FREE)**

**Why Default VPC?**
- ✅ Already configured and ready to use
- ✅ Saves 10 minutes of setup time
- ✅ Same cost as creating new VPC (FREE)
- ✅ Perfect for student demos

---

## Phase 4: RDS PostgreSQL (FREE TIER) - 25 minutes

### Step 4.1: Create DB Subnet Group

1. **AWS Console** → Search **"RDS"** → **"RDS"**

2. Sidebar → **"Subnet groups"** → **"Create DB subnet group"**

3. **Subnet group details:**
   - Name: `live-auction-db-subnet`
   - Description: `Subnet group for live auction`
   - VPC: Select your **default VPC** (from Phase 3)
   - Availability Zones: Select **us-east-1a** and **us-east-1b**
   - Subnets: Select the 2 subnets you noted in Phase 3 (or select all available)

4. Click **"Create"**

### Step 4.2: Create RDS Instance

1. **RDS Dashboard** → **"Create database"**

2. **Choose creation method:**
   - ☑️ **Standard create**

3. **Engine options:**
   - Engine type: **PostgreSQL**
   - Version: **PostgreSQL 15.4-R2** (latest 15.x)

4. **Templates:**
   - ☑️ **Free tier** ⭐ (IMPORTANT!)

5. **Settings:**
   - DB instance identifier: `live-auction-db`
   - Master username: `auction_admin`
   - Master password: `StudentDemo123!`
   - Confirm password: `StudentDemo123!`

6. **Instance configuration:**
   - DB instance class: **db.t3.micro** (only option for free tier)

7. **Storage:**
   - Storage type: **General Purpose SSD (gp2)**
   - Allocated storage: **20 GiB** (free tier max)
   - ☐ **Uncheck** "Enable storage autoscaling"

8. **Connectivity:**
   - Virtual private cloud (VPC): Select your **default VPC**
   - DB subnet group: Select `live-auction-db-subnet`
   - Public access: ☑️ **Yes** (for easier setup/testing)
   - VPC security group: **Choose existing** → Select `live-auction-rds-sg` (remove default)
   - Availability Zone: **No preference**
   - Database port: **5432**

9. **Database authentication:**
   - ☑️ **Password authentication**

10. **Additional configuration:**
    - Initial database name: `live_auction`
    - Backup retention period: **7 days** (free tier includes backups)
    - ☐ **Uncheck** "Enable encryption" (not needed for demo)
    - ☐ **Uncheck** "Enable Enhanced monitoring" (save cost)
    - ☐ **Uncheck** "Enable auto minor version upgrade"

11. Click **"Create database"**

12. **⏰ Wait 10-15 minutes** (Status → "Available")

13. **Get Endpoint:**
    - Click database name
    - Copy **Endpoint**: `live-auction-db.xxxxx.us-east-1.rds.amazonaws.com`

✅ **RDS Complete! Cost: $0 (FREE TIER for 750 hours/month)**

---

## Phase 5: ElastiCache Redis (MINIMAL) - 20 minutes

⚠️ **Note:** ElastiCache is NOT free tier, but cache.t2.micro is the cheapest option (~$12/month)

### Step 5.1: Create Cache Subnet Group

1. **AWS Console** → Search **"ElastiCache"** → **"ElastiCache"**

2. Sidebar → **"Subnet groups"** → **"Create subnet group"**

3. **Subnet group settings:**
   - Name: `live-auction-redis-subnet`
   - Description: `Redis subnet group`
   - VPC: Select your **default VPC** (from Part 1, Phase 3)
   - Availability Zones: Select **us-east-1a** and **us-east-1b**
   - Subnets: Select the subnets you noted in Phase 3 (or select all available)

4. Click **"Create"**

### Step 5.2: Create Redis Cluster

1. **ElastiCache Dashboard** → **"Redis clusters"** → **"Create Redis cluster"**

2. **Cluster mode:**
   - ☑️ **Disabled** (simpler and cheaper)

3. **Cluster info:**
   - Name: `live-auction-redis`
   - Description: `Redis for demo`
   - Engine version: **7.0** (latest)
   - Port: **6379**
   - Parameter group: **default.redis7**
   - Node type: **cache.t2.micro** ⭐ (CHEAPEST!)
   - Number of replicas: **0** (save cost)

4. **Subnet group settings:**
   - Subnet group: Select `live-auction-redis-subnet`

5. **Security:**
   - Security groups: Select `live-auction-redis-sg`

6. **Encryption:**
   - ☐ **Uncheck** "Encryption at rest" (save cost)
   - ☐ **Uncheck** "Encryption in-transit" (save cost)

7. **Backup:**
   - ☐ **Uncheck** "Enable automatic backups" (save cost)

8. **Logs:**
   - ☐ **Uncheck** all logs (save cost)

9. Click **"Create"**

10. **⏰ Wait 5-10 minutes** (Status → "Available")

11. **Get Endpoint:**
    - Click cluster name
    - Copy **Primary endpoint**: `live-auction-redis.xxxxx.cache.amazonaws.com`

✅ **ElastiCache Complete! Cost: ~$12/month (cache.t2.micro)**

---

## Phase 6: DynamoDB (FREE TIER) - 10 minutes

**📌 Important: DynamoDB is ONLY for Bid History**
- This table stores **bid history** (bids placed on auctions)
- **Users are NOT stored in DynamoDB** - they are stored in PostgreSQL (RDS)
- Users are automatically synced from Cognito to PostgreSQL when they signup/login
- See Phase 9 for PostgreSQL database setup

### Step 6.1: Create Bids Table

1. **AWS Console** → Search **"DynamoDB"** → **"DynamoDB"**

2. Click **"Create table"**

3. **Table details:**
   - Table name: `bids_history`
   - Partition key: `auction_id` (String)
   - Sort key: `timestamp_user_id` (String)

4. **Table settings:**
   - ☑️ **Customize settings**

5. **Read/write capacity:**
   - Capacity mode: ☑️ **Provisioned** (free tier eligible)
   - Read capacity:
     - Provisioned capacity units: **5** (within free tier)
     - ☑️ **Auto scaling: Off**
   - Write capacity:
     - Provisioned capacity units: **5** (within free tier)
     - ☑️ **Auto scaling: Off**

6. **Encryption at rest:**
   - Encryption type: ☑️ **Owned by Amazon DynamoDB** (FREE)

7. **Tags:** (optional)
   - Key: `Project`, Value: `LiveAuction`

8. Click **"Create table"**

9.  **⏰ Wait 2-3 minutes** (Status → "Active")

### Step 6.2: Enable TTL

1. Click table name `bids_history`

2. Go to **"Additional settings"** tab

3. Under **"Time to Live (TTL)"** → Click **"Manage TTL"**

4. **TTL attribute:** `ttl_expiry`

5. Click **"Enable TTL"**

✅ **DynamoDB Complete! Cost: $0 (FREE TIER: 25 GB, 25 RCU, 25 WCU)**

**📌 Reminder:**
- DynamoDB table `bids_history` is **only for bid records**
- Users are stored in **PostgreSQL (RDS)** - see Phase 9
- Users are automatically synced from Cognito to PostgreSQL (no manual creation needed)

-----

## Phase 7: SQS Queues (FREE TIER) - 10 minutes

### Step 7.1: Create Bid Persistence Queue

1. **AWS Console** → Search **"SQS"** → **"SQS"**

2. Click **"Create queue"**

3. **Details:**
   - Type: ☑️ **FIFO**
   - Name: `bid-persistence-queue.fifo`

4. **Configuration:**
   - Visibility timeout: **5 minutes**
   - Message retention period: **1 day**
   - Delivery delay: **0 seconds**
   - Maximum message size: **256 KB**
   - Receive message wait time: **0 seconds**
   - ☑️ **Enable content-based deduplication**
   - Deduplication scope: **Queue**
   - FIFO throughput limit: **Per queue**

5. **Access policy:**
   - Method: **Basic**

6. **Encryption:**
   - Server-side encryption: ☐ **Disabled** (save cost for demo)

7. Click **"Create queue"**

8. **Copy Queue URL** from details page

### Step 7.2: Create Notification Queue

1. Click **"Create queue"** again

2. Use same settings as above:
   - Name: `notification-queue.fifo`
   - Type: **FIFO**
   - Same configuration

3. **Copy Queue URL**

✅ **SQS Complete! Cost: $0 (FREE TIER: 1M requests/month)**

---

## Phase 8: Lambda Functions (FREE TIER) - 25 minutes

### Step 8.1: Create IAM Role

1. **AWS Console** → Search **"IAM"** → **"IAM"**

2. **Roles** → **"Create role"**

3. **Trusted entity:**
   - Trusted entity type: ☑️ **AWS service**
   - Use case: **Lambda**
   - Click **"Next"**

4. **Add permissions:** Search and select:
   - ☑️ `AWSLambdaBasicExecutionRole`
   - ☑️ `AmazonDynamoDBFullAccess`
   - ☑️ `AmazonSQSFullAccess`
   - Click **"Next"**

5. **Name and create:**
   - Role name: `live-auction-lambda-role`
   - Description: `Lambda execution role for demo`
   - Click **"Create role"**

### Step 8.2: Prepare Lambda Packages

On your Mac:

```bash
cd ~/Documents/Projects/live_flash_auction/backend/lambdas

# Package bid-persistence
cd bid-persistence
mkdir -p package
pip3 install -r requirements.txt -t package/ --platform manylinux2014_x86_64 --only-binary=:all:
cd package
zip -r ../bid-persistence-lambda.zip .
cd ..
zip bid-persistence-lambda.zip lambda_function.py
ls -lh bid-persistence-lambda.zip

# Package auction-notifications
cd ../auction-notifications
mkdir -p package
pip3 install -r requirements.txt -t package/ --platform manylinux2014_x86_64 --only-binary=:all:
cd package
zip -r ../notifications-lambda.zip .
cd ..
zip notifications-lambda.zip lambda_function.py
ls -lh notifications-lambda.zip
```

### Step 8.3: Create Bid Persistence Lambda

1. **AWS Console** → Search **"Lambda"** → **"Lambda"**

2. Click **"Create function"**

3. **Function settings:**
   - ☑️ **Author from scratch**
   - Function name: `bid-persistence`
   - Runtime: **Python 3.11**
   - Architecture: **x86_64**
   - Permissions:
     - ☑️ **Use an existing role**
     - Existing role: `live-auction-lambda-role`

4. Click **"Create function"**

5. **Upload code:**
   - In **"Code"** section → Click **"Upload from"** → **".zip file"**
   - Click **"Upload"**
   - Select `bid-persistence-lambda.zip`
   - Click **"Save"**

6. **Configure environment variables:**
   - Go to **"Configuration"** tab → **"Environment variables"** → **"Edit"**
   - Add variable:
     - Key: `AWS_REGION`, Value: `us-east-1`
   - Add variable:
     - Key: `DYNAMODB_BIDS_TABLE`, Value: `bids_history`
   - Click **"Save"**

7. **Configure settings:**
   - **"Configuration"** → **"General configuration"** → **"Edit"**
   - Memory: **512 MB** (within free tier)
   - Timeout: **5 min 0 sec**
   - Click **"Save"**

8. **Add SQS trigger:**
   - Click **"Add trigger"**
   - Select a source: **SQS**
   - SQS queue: Select `bid-persistence-queue.fifo`
   - Batch size: **10**
   - Click **"Add"**

### Step 8.4: Create Notification Lambda

1. **Create function**
   - Function name: `auction-notifications`
   - Runtime: **Python 3.11**
   - Architecture: **x86_64**
   - Role: `live-auction-lambda-role`

2. **Upload code:**
   - Upload `notifications-lambda.zip`

3. **Environment variables:**
   - `AWS_REGION`: `us-east-1`

4. **Settings:**
   - Memory: **256 MB**
   - Timeout: **3 min 0 sec**

5. **Add SQS trigger:**
   - SQS queue: `notification-queue.fifo`
   - Batch size: **10**

✅ **Lambda Functions Complete! Cost: $0 (FREE TIER: 1M requests, 400K GB-seconds)**

----

## Phase 9: Initialize Database - 15 minutes

### Step 9.1: Create Temporary EC2

1. **AWS Console** → Search **"EC2"** → **"EC2"**

2. Click **"Launch instance"**

3. **Name:** `temp-db-init`

4. **Application and OS Images:**
   - Quick Start: **Amazon Linux 2023 AMI**

5. **Instance type:**
   - ☑️ **t2.micro** (FREE TIER) ⭐

6. **Key pair:**
   - Click **"Create new key pair"**
   - Name: `temp-db-key`
   - Key pair type: **RSA**
   - Private key format: **.pem**
   - Click **"Create key pair"** (downloads to ~/Downloads)

7. **Network settings:**
   - VPC: Select your **default VPC**
   - Subnet: Select any subnet from your default VPC
   - Auto-assign public IP: **Enable**
   - Security group: **Create new**
     - Name: `temp-ssh-sg`
     - Allow SSH from: **My IP**

8. Click **"Launch instance"**

9. **Move key to safe location:**
   ```bash
   mv ~/Downloads/temp-db-key.pem ~/.ssh/
   chmod 400 ~/.ssh/temp-db-key.pem
   ```

### Step 9.2: Initialize Database

**📌 Important: User Data Storage**
- **Users table** is created in PostgreSQL (RDS) during initialization
- **Users are automatically synced** from Cognito to PostgreSQL when they signup/login
- **No manual user creation needed** - the backend handles this automatically
- The `user_id` in PostgreSQL matches the Cognito `sub` (UUID)

1. **Get EC2 Public IP:**
   - EC2 → Instances → Select `temp-db-init`
   - Copy **Public IPv4 address**

2. **SSH into EC2:**
   ```bash
   ssh -i ~/.ssh/temp-db-key.pem ec2-user@<PUBLIC_IP>
   ```

3. **Install PostgreSQL client:**
   ```bash
   sudo dnf install postgresql15 -y
   ```

4. **Connect to RDS:**
   ```bash
   # Replace with your RDS endpoint
   psql -h live-auction-db.xxxxx.us-east-1.rds.amazonaws.com \
        -U auction_admin \
        -d live_auction

   # Password: StudentDemo123!
   ```

5. **Run initialization SQL:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   CREATE TABLE users (
     user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email VARCHAR(255) UNIQUE NOT NULL,
     phone VARCHAR(20),
     is_verified BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     name VARCHAR(255),
     username VARCHAR(100) UNIQUE NOT NULL
   );

   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_username ON users(username);

   CREATE TABLE auctions (
     auction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     host_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
     title VARCHAR(500) NOT NULL,
     description TEXT,
     duration INTEGER NOT NULL,
     category VARCHAR(100),
     starting_bid DECIMAL(10,2) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     status VARCHAR(20) DEFAULT 'live',
     winner_id UUID REFERENCES users(user_id),
     winning_bid DECIMAL(10,2),
     ended_at TIMESTAMP WITH TIME ZONE,
     ivs_channel_arn VARCHAR(255),
     ivs_stream_key TEXT,
     ivs_playback_url TEXT
   );

   CREATE INDEX idx_auctions_host ON auctions(host_user_id);
   CREATE INDEX idx_auctions_status ON auctions(status);
   CREATE INDEX idx_auctions_category ON auctions(category);

   -- Verify
   \dt

   -- Exit
   \q
   ```

6. **Exit EC2:**
   ```bash
   exit
   ```

7. **Terminate EC2:**
   - EC2 Console → Select instance → **Instance state** → **Terminate instance**

✅ **Database Initialized!**

**📌 How Users Are Added to the Database:**

Users are **automatically synced** from Cognito to PostgreSQL when they:
1. **Sign up** via the frontend → Cognito creates user → Backend syncs to PostgreSQL
2. **Log in** via the frontend → Backend syncs user info to PostgreSQL (if not already present)

**The sync process:**
- User signs up/logs in through Cognito (OTP flow)
- Backend receives JWT tokens from Cognito
- Backend extracts user info from ID token (`sub`, `email`, `name`, etc.)
- Backend calls `user_service.get_or_create_user_from_cognito()` 
- User is created/updated in PostgreSQL `users` table automatically
- `user_id` in PostgreSQL = Cognito `sub` (UUID)

**You don't need to:**
- ❌ Manually create users in PostgreSQL
- ❌ Run SQL INSERT statements for users
- ❌ Sync users via scripts

**The backend handles everything automatically!** ✅

---


## Phase 10: EKS Cluster Setup (MINIMAL) - 40 minutes

⚠️ **EKS Cost:** Control plane = $72/month (NOT free, but necessary for Kubernetes)
⚠️ **Worker Nodes:** 2x t3.small = ~$30/month (cheaper than t3.medium)

**💡 TIP:** Stop cluster when not demoing to save ~$100/month!

### Step 10.1: Create EKS Cluster (Using eksctl - Faster)

On your Mac:

```bash
# Create cluster config file
cat > ~/eks-student-cluster.yaml << 'EOF'
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: live-auction-demo
  region: us-east-1

# eksctl will automatically use your default VPC!
# No need to specify VPC ID or subnets - it will discover them

# Minimal node group for students
managedNodeGroups:
  - name: student-workers
    instanceType: t3.small  # Smaller than t3.medium (saves $30/month)
    minSize: 2
    maxSize: 2  # Fixed size (no auto-scaling to control costs)
    desiredCapacity: 2
    volumeSize: 20
    ssh:
      allow: false  # No SSH needed
    labels:
      role: worker
      environment: demo
    tags:
      Project: live-auction-demo
      Owner: student
EOF
```

**Note:** eksctl will automatically use your default VPC and create necessary subnets!

```bash
# Create cluster (takes ~20 minutes)
eksctl create cluster -f ~/eks-student-cluster.yaml
```

Get coffee ☕ This will take about 20 minutes.

### Step 10.2: Verify Cluster

```bash
# Check cluster status
eksctl get cluster --name live-auction-demo

# Check nodes
kubectl get nodes

# Should show 2 nodes in Ready state
```

✅ **EKS Cluster Created! Cost: $72/month (control plane) + $30/month (2x t3.small)**

---

## Phase 11: Build & Deploy Backend - 45 minutes

### Step 11.1: Create ECR Repositories

1. **AWS Console** → Search **"ECR"** → **"Elastic Container Registry"**

2. Click **"Create repository"**

3. **Create 4 repositories** (one for each service):

   **Repository 1:**
   - Visibility: **Private**
   - Repository name: `live-auction/auction-management`
   - Click **"Create repository"**

   **Repeat for:**
   - `live-auction/websocket`
   - `live-auction/bid-processing`
   - `live-auction/timer`

4. **Copy repository URIs** (will need them for Docker push)

### Step 11.2: Build and Push Docker Images

On your Mac:

```bash
cd ~/Documents/Projects/live_flash_auction/backend

# Get your AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Your AWS Account ID: $ACCOUNT_ID"

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Set registry URL
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"

echo "Building images... this may take 5-10 minutes"

# Build auction-management
echo "Building auction-management..."
cd auction-management-service
docker build -t live-auction/auction-management:latest .
docker tag live-auction/auction-management:latest $ECR_REGISTRY/live-auction/auction-management:latest
docker push $ECR_REGISTRY/live-auction/auction-management:latest

# Build websocket
echo "Building websocket..."
cd ../websocket-service
docker build -t live-auction/websocket:latest .
docker tag live-auction/websocket:latest $ECR_REGISTRY/live-auction/websocket:latest
docker push $ECR_REGISTRY/live-auction/websocket:latest

# Build bid-processing
echo "Building bid-processing..."
cd ../bid-processing-service
docker build -t live-auction/bid-processing:latest .
docker tag live-auction/bid-processing:latest $ECR_REGISTRY/live-auction/bid-processing:latest
docker push $ECR_REGISTRY/live-auction/bid-processing:latest

# Build timer
echo "Building timer..."
cd ../timer-service
docker build -t live-auction/timer:latest .
docker tag live-auction/timer:latest $ECR_REGISTRY/live-auction/timer:latest
docker push $ECR_REGISTRY/live-auction/timer:latest

cd ..
echo "All images pushed to ECR!"
```

### Step 11.3: Create Kubernetes Namespace and Secrets

```bash
# Create namespace
kubectl create namespace live-auction

# Set your configuration values (replace with your actual values)
RDS_ENDPOINT="live-auction-db.xxxxx.us-east-1.rds.amazonaws.com"
REDIS_ENDPOINT="live-auction-redis.xxxxx.cache.amazonaws.com"
USER_POOL_ID="us-east-1_XXXXXXXXX"
APP_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxx"
BID_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/123456/bid-persistence-queue.fifo"
NOTIFICATION_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/123456/notification-queue.fifo"

# Create Kubernetes secret
kubectl create secret generic auction-secrets \
  --from-literal=database-url="postgresql://auction_admin:StudentDemo123!@$RDS_ENDPOINT:5432/live_auction" \
  --from-literal=redis-url="redis://$REDIS_ENDPOINT:6379/0" \
  --from-literal=cognito-user-pool-id="$USER_POOL_ID" \
  --from-literal=cognito-app-client-id="$APP_CLIENT_ID" \
  --from-literal=sqs-bid-queue-url="$BID_QUEUE_URL" \
  --from-literal=sqs-notification-queue-url="$NOTIFICATION_QUEUE_URL" \
  --namespace live-auction

# Verify secret created
kubectl get secrets -n live-auction
```

### Step 11.4: Update Kubernetes Manifests

```bash
cd ~/Documents/Projects/live_flash_auction/backend/k8s

# Get your account ID and ECR registry
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"

# Update all deployment files with your ECR registry
# We'll use sed to replace placeholder

for service in auction-management websocket bid-processing timer; do
  sed -i '' "s|<YOUR_ECR_REPO>|$ECR_REGISTRY|g" $service/deployment.yaml
done

echo "Deployment files updated!"
```

### Step 11.5: Deploy Services to Kubernetes

```bash
# Deploy all services
kubectl apply -f auction-management/deployment.yaml -n live-auction
kubectl apply -f websocket/deployment.yaml -n live-auction
kubectl apply -f bid-processing/deployment.yaml -n live-auction
kubectl apply -f timer/deployment.yaml -n live-auction

# Check pod status (wait until all are Running)
kubectl get pods -n live-auction -w

# Press Ctrl+C to exit watch once all pods are Running

# Check services
kubectl get svc -n live-auction
```

### Step 11.6: Wait for Load Balancers

```bash
# Wait for LoadBalancer to get external hostname (2-3 minutes)
kubectl get svc websocket-service -n live-auction -w

# Once EXTERNAL-IP shows a hostname, press Ctrl+C

# Get the LoadBalancer URLs
WS_URL=$(kubectl get svc websocket-service -n live-auction -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "WebSocket URL: ws://$WS_URL:8001"

# If auction-management is also a LoadBalancer:
API_URL=$(kubectl get svc auction-management-service -n live-auction -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "API URL: http://$API_URL:8000"
```

**Save these URLs!** You'll need them for the frontend.

### Step 11.7: Verify Backend Health

```bash
# Test API health
curl http://$API_URL:8000/health

# Expected: {"status":"healthy","service":"auction-management"}
```

✅ **Backend Services Deployed!**

---

## Phase 12: Update Frontend with Backend URLs - 15 minutes

### Step 12.1: Update Frontend Environment

```bash
cd ~/Documents/Projects/live_flash_auction/frontend

# Edit .env.production
nano .env.production
```

Update with your real URLs:

```env
# Cognito Configuration (same as before)
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_REGION=us-east-1

# Backend URLs - UPDATE THESE WITH YOUR REAL LOAD BALANCER URLs
VITE_API_BASE_URL=http://YOUR-API-LB.us-east-1.elb.amazonaws.com:8000
VITE_WEBSOCKET_URL=ws://YOUR-WS-LB.us-east-1.elb.amazonaws.com:8001
```

Save: `Ctrl+O`, Enter, `Ctrl+X`

### Step 12.2: Rebuild and Redeploy Frontend

```bash
# Rebuild
npm run build

# Get your S3 bucket name
BUCKET_NAME="live-auction-demo-yourname"

# Upload to S3
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude index.html

aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

# Get CloudFront distribution ID
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[?DomainName.contains(@, '$BUCKET_NAME')]].Id" \
  --output text)

echo "Distribution ID: $DISTRIBUTION_ID"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "Frontend updated! Wait 2-3 minutes for cache invalidation."
```

✅ **Frontend Updated with Backend URLs!**

---

## Phase 13: Testing - 20 minutes

### Step 13.1: Test Backend APIs

```bash
# Test API health
curl http://$API_URL:8000/health

# Should return: {"status":"healthy","service":"auction-management"}

# Test WebSocket health
curl http://$WS_URL:8001/health

# Should return: {"status":"healthy","service":"websocket"}
```

### Step 13.2: Test Frontend

1. **Open your CloudFront URL:**
   ```
   https://d111111abcdef8.cloudfront.net
   ```

2. **Sign Up:**
   - Create a new account with email/password
   - Or use test account: `demo@example.com` / `Demo1234!`

3. **Check Browser Console (F12):**
   - Look for WebSocket connection messages
   - Check Network tab for API calls
   - Should see no CORS errors

4. **Test Creating an Auction** (if you have the UI):
   - Create a test auction
   - Verify it appears in the database

### Step 13.3: Verify Database

```bash
# Launch temporary EC2 again (same as Phase 9)
# SSH in and connect to RDS:

psql -h $RDS_ENDPOINT -U auction_admin -d live_auction

# Check tables
SELECT * FROM users;
SELECT * FROM auctions;

\q
exit

# Terminate EC2
```

✅ **All Systems Operational!**

---

## Phase 14: IVS
Refer to IVS Setup document


### 💡 Cost Saving Tips:

**During Development:**
```bash
# Stop EKS cluster when not using
eksctl delete cluster --name live-auction-demo

# Recreate when needed (20 min)
eksctl create cluster -f ~/eks-student-cluster.yaml
```

**For Demo Day:**
- Start cluster 30 minutes before demo
- Keep running for demo
- Delete immediately after

**After Project:**
```bash
# Delete everything
eksctl delete cluster --name live-auction-demo
aws rds delete-db-instance --db-instance-identifier live-auction-db --skip-final-snapshot
aws elasticache delete-cache-cluster --cache-cluster-id live-auction-redis
aws s3 rb s3://your-bucket-name --force
# etc.
```

---

## 🎓 Demo Presentation Tips

### Before Demo:
- [ ] Verify all services are running: `kubectl get pods -n live-auction`
- [ ] Test frontend loads: Open CloudFront URL
- [ ] Test authentication: Sign in works
- [ ] Have backup screenshots ready

### During Demo:
1. Show **architecture diagram** (explain microservices)
2. Show **CloudFront URL** (working frontend)
3. Show **AWS Console**:
   - RDS database with tables
   - DynamoDB with bid records
   - Lambda functions processing events
   - EKS cluster with running pods
4. **Live demo**: Create auction, place bids
5. Show **real-time features**: WebSocket connections, live updates

### Talking Points:
- "Using AWS FREE TIER where possible to minimize costs"
- "Kubernetes (EKS) for container orchestration and scalability"
- "Real-time bidding with WebSocket connections"
- "Asynchronous processing with Lambda + SQS"
- "Anti-snipe logic to prevent last-second bidding"

---

## 🐛 Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <POD-NAME> -n live-auction

# Check logs
kubectl logs <POD-NAME> -n live-auction

# Common issues:
# - Image pull errors: Check ECR permissions
# - Database connection: Check RDS security group
# - Redis connection: Check ElastiCache security group
```

### Fix Security Groups

If pods can't connect to RDS/Redis:

1. **Get EKS node security group:**
   ```bash
   # Find node security group ID
   kubectl get nodes -o wide
   # Look at EC2 console for the node's security group
   ```

2. **Update RDS security group:**
   - EC2 → Security Groups → `live-auction-rds-sg`
   - Edit inbound rules
   - Add rule: PostgreSQL (5432) from EKS node security group

3. **Update Redis security group:**
   - Same process for `live-auction-redis-sg`

### LoadBalancer Stuck

```bash
# Check service events
kubectl describe svc websocket-service -n live-auction

# Ensure subnets have required tags:
# kubernetes.io/role/elb = 1
```

---

## 🎉 Congratulations!

Your Live Flash Auction platform is deployed!

**Access:**
- **Frontend:** `https://your-cloudfront-url.cloudfront.net`
- **API:** `http://your-api-lb.us-east-1.elb.amazonaws.com:8000`
- **WebSocket:** `ws://your-ws-lb.us-east-1.elb.amazonaws.com:8001`

**Remember to:**
- Stop/delete resources after demo to avoid charges
- Take screenshots for your project report
- Document any issues you encountered

Good luck with your demo! 🚀