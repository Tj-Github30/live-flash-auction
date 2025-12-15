#!/usr/bin/env python3
"""
Quick test script for user synchronization
Usage: python test_user_sync.py <JWT_TOKEN>
"""
import requests
import sys

def test_user_sync(token: str):
    """Test user synchronization by creating an auction"""
    url = "http://localhost:8000/auctions"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "title": "Test Auction for User Sync",
        "description": "Testing automatic user synchronization",
        "duration": 3600,
        "category": "Test",
        "starting_bid": 100.00
    }
    
    print("🧪 Testing user synchronization...")
    print(f"📡 Making request to: {url}")
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        print(f"\n📊 Status Code: {response.status_code}")
        
        try:
            response_data = response.json()
            print(f"📦 Response: {response_data}")
        except:
            print(f"📦 Response (text): {response.text}")
        
        if response.status_code == 201:
            print("\n✅ SUCCESS: User sync worked! Check database for user.")
            print("   Run: docker-compose exec postgres psql -U auction_user -d live_auction -c 'SELECT * FROM users;'")
            return True
        elif response.status_code == 401:
            print("\n❌ ERROR: Invalid or expired token.")
            print("   Get a fresh token from Cognito.")
            return False
        elif response.status_code == 500:
            print("\n❌ ERROR: Server error. Check service logs.")
            print("   Look for user sync errors in the terminal running the service.")
            return False
        else:
            print(f"\n⚠️  Unexpected status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to service.")
        print("   Make sure the Auction Management Service is running on port 8000")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_user_sync.py <JWT_TOKEN>")
        print("\nTo get a JWT token:")
        print("  1. Use AWS CLI: aws cognito-idp initiate-auth ...")
        print("  2. Or log in via frontend and copy token from localStorage")
        sys.exit(1)
    
    token = sys.argv[1]
    success = test_user_sync(token)
    sys.exit(0 if success else 1)


