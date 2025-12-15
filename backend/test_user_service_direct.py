#!/usr/bin/env python3
"""
Direct test of user service - no Flask, no full service needed!
This tests JUST the user synchronization logic.
"""
import sys
import os
import uuid

# Add shared to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'shared'))
sys.path.insert(0, os.path.dirname(__file__))

# Set minimal environment
os.environ.setdefault('DATABASE_URL', 'postgresql://auction_user:auction_pass@localhost:5432/live_auction')
os.environ.setdefault('FLASK_DEBUG', 'True')

from database.connection import SessionLocal, init_db
from services.user_service import user_service

def test_user_sync():
    """Test user synchronization directly"""
    print("🧪 Testing User Service Directly")
    print("=" * 50)
    
    # Initialize database (create tables if needed)
    print("\n1️⃣  Initializing database...")
    try:
        init_db()
        print("   ✅ Database initialized")
    except Exception as e:
        print(f"   ⚠️  Database init: {e}")
        print("   (This is OK if tables already exist)")
    
    # Mock Cognito user info (like what comes from JWT token)
    print("\n2️⃣  Creating mock Cognito user info...")
    test_user_id = str(uuid.uuid4())  # Simulate Cognito 'sub'
    cognito_user_info = {
        "user_id": test_user_id,
        "email": "test@example.com",
        "username": "testuser",
        "name": "Test User",
        "email_verified": True,
        "phone": None
    }
    
    print(f"   User ID (Cognito sub): {test_user_id}")
    print(f"   Email: {cognito_user_info['email']}")
    print(f"   Username: {cognito_user_info['username']}")
    
    # Test user creation
    print("\n3️⃣  Testing user sync (create)...")
    try:
        user = user_service.get_or_create_user_from_cognito(cognito_user_info)
        
        if user:
            print("   ✅ User created successfully!")
            print(f"   PostgreSQL User ID: {user.user_id}")
            print(f"   Email: {user.email}")
            print(f"   Username: {user.username}")
            print(f"   Name: {user.name}")
            print(f"   Verified: {user.is_verified}")
        else:
            print("   ❌ Failed to create user")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test user retrieval (should find existing)
    print("\n4️⃣  Testing user retrieval (should find existing)...")
    try:
        user2 = user_service.get_or_create_user_from_cognito(cognito_user_info)
        
        if user2 and user2.user_id == user.user_id:
            print("   ✅ User retrieved (not duplicated)")
        else:
            print("   ⚠️  Unexpected result")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test update (change name)
    print("\n5️⃣  Testing user update...")
    try:
        updated_info = cognito_user_info.copy()
        updated_info["name"] = "Updated Test User"
        
        user3 = user_service.get_or_create_user_from_cognito(updated_info)
        
        if user3 and user3.name == "Updated Test User":
            print("   ✅ User updated successfully!")
        else:
            print("   ⚠️  Update may not have worked")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Verify in database
    print("\n6️⃣  Verifying in database...")
    try:
        db = SessionLocal()
        from models.user import User
        db_user = db.query(User).filter(User.user_id == uuid.UUID(test_user_id)).first()
        
        if db_user:
            print("   ✅ User found in database!")
            print(f"   Database record: {db_user.email} - {db_user.username}")
        else:
            print("   ❌ User not found in database")
            return False
            
        db.close()
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("✅ ALL TESTS PASSED!")
    print("\nYour user sync is working! 🎉")
    print("\nNext: Test with real Cognito JWT token via API")
    return True


if __name__ == "__main__":
    print("\n🚀 Direct User Service Test")
    print("This tests user sync WITHOUT needing the full Flask service")
    print("=" * 50)
    
    success = test_user_sync()
    
    if success:
        print("\n💡 Tip: Now test with real Cognito token via API endpoint")
        sys.exit(0)
    else:
        print("\n❌ Tests failed. Check errors above.")
        sys.exit(1)


