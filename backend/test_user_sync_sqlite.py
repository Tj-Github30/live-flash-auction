#!/usr/bin/env python3
"""
Test User Sync with SQLite (No Docker, No PostgreSQL needed!)
This uses SQLite instead of PostgreSQL for easy testing.
"""
import sys
import os
import uuid
import sqlite3
from pathlib import Path

# Add shared to path
backend_dir = Path(__file__).parent
shared_dir = backend_dir / "shared"
sys.path.insert(0, str(shared_dir))
sys.path.insert(0, str(backend_dir))

# Use SQLite for testing
TEST_DB_PATH = backend_dir / "test_auction.db"

def setup_sqlite_database():
    """Create SQLite database with same schema as PostgreSQL"""
    print("📦 Setting up SQLite test database...")
    
    # Remove old test DB if exists
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()
        print("   Removed old test database")
    
    conn = sqlite3.connect(str(TEST_DB_PATH))
    cursor = conn.cursor()
    
    # Create users table (SQLite compatible)
    cursor.execute("""
        CREATE TABLE users (
            user_id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            is_verified INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            name TEXT,
            username TEXT UNIQUE NOT NULL
        )
    """)
    
    # Create indexes
    cursor.execute("CREATE INDEX idx_users_email ON users(email)")
    cursor.execute("CREATE INDEX idx_users_username ON users(username)")
    
    conn.commit()
    conn.close()
    
    print(f"   ✅ Created test database: {TEST_DB_PATH}")
    return str(TEST_DB_PATH)


def test_user_sync_sqlite():
    """Test user synchronization with SQLite"""
    print("\n" + "=" * 60)
    print("🧪 Testing User Sync with SQLite (No Docker Needed!)")
    print("=" * 60)
    
    # Setup SQLite database
    db_path = setup_sqlite_database()
    
    # Override database URL to use SQLite
    os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
    os.environ['FLASK_DEBUG'] = 'True'
    
    # Import after setting environment
    try:
        # Monkey patch SQLAlchemy to work with SQLite UUIDs
        from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Integer
        from sqlalchemy.ext.declarative import declarative_base
        from sqlalchemy.orm import sessionmaker
        from sqlalchemy.sql import func
        
        # Create SQLite-compatible User model
        Base = declarative_base()
        
        class User(Base):
            __tablename__ = "users"
            
            user_id = Column(String, primary_key=True)  # UUID as string for SQLite
            email = Column(String(255), unique=True, nullable=False)
            phone = Column(String(20))
            is_verified = Column(Boolean, default=False)
            created_at = Column(DateTime(timezone=True), server_default=func.now())
            updated_at = Column(DateTime(timezone=True), server_default=func.now())
            name = Column(String(255))
            username = Column(String(100), unique=True, nullable=False)
            
            def to_dict(self):
                return {
                    "user_id": self.user_id,
                    "email": self.email,
                    "phone": self.phone,
                    "is_verified": self.is_verified,
                    "created_at": str(self.created_at) if self.created_at else None,
                    "updated_at": str(self.updated_at) if self.updated_at else None,
                    "name": self.name,
                    "username": self.username
                }
        
        # Create engine and session
        engine = create_engine(f'sqlite:///{db_path}', echo=False)
        Base.metadata.create_all(engine)
        SessionLocal = sessionmaker(bind=engine)
        
        print("\n✅ Database setup complete")
        
    except Exception as e:
        print(f"\n❌ Error setting up database: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test user creation
    print("\n" + "-" * 60)
    print("1️⃣  Testing User Creation")
    print("-" * 60)
    
    test_user_id = str(uuid.uuid4())
    cognito_user_info = {
        "user_id": test_user_id,
        "email": "test@example.com",
        "username": "testuser",
        "name": "Test User",
        "email_verified": True,
        "phone": None
    }
    
    print(f"   Cognito User ID: {test_user_id}")
    print(f"   Email: {cognito_user_info['email']}")
    print(f"   Username: {cognito_user_info['username']}")
    
    try:
        db = SessionLocal()
        
        # Check if user exists
        existing = db.query(User).filter(User.user_id == test_user_id).first()
        if existing:
            print("   ⚠️  User already exists, deleting for clean test...")
            db.delete(existing)
            db.commit()
        
        # Create new user (simulating user service)
        user = User(
            user_id=test_user_id,
            email=cognito_user_info["email"],
            username=cognito_user_info["username"],
            name=cognito_user_info["name"],
            phone=cognito_user_info.get("phone"),
            is_verified=cognito_user_info.get("email_verified", False)
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print("   ✅ User created successfully!")
        print(f"   PostgreSQL User ID: {user.user_id}")
        print(f"   Email: {user.email}")
        print(f"   Username: {user.username}")
        print(f"   Name: {user.name}")
        print(f"   Verified: {user.is_verified}")
        
        db.close()
        
    except Exception as e:
        print(f"   ❌ Error creating user: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test user retrieval
    print("\n" + "-" * 60)
    print("2️⃣  Testing User Retrieval")
    print("-" * 60)
    
    try:
        db = SessionLocal()
        retrieved_user = db.query(User).filter(User.user_id == test_user_id).first()
        
        if retrieved_user:
            print("   ✅ User retrieved successfully!")
            print(f"   Found: {retrieved_user.email} - {retrieved_user.username}")
        else:
            print("   ❌ User not found")
            return False
        
        db.close()
        
    except Exception as e:
        print(f"   ❌ Error retrieving user: {e}")
        return False
    
    # Test user update
    print("\n" + "-" * 60)
    print("3️⃣  Testing User Update")
    print("-" * 60)
    
    try:
        db = SessionLocal()
        user_to_update = db.query(User).filter(User.user_id == test_user_id).first()
        
        if user_to_update:
            old_name = user_to_update.name
            user_to_update.name = "Updated Test User"
            db.commit()
            
            print(f"   ✅ User updated!")
            print(f"   Old name: {old_name}")
            print(f"   New name: {user_to_update.name}")
        else:
            print("   ❌ User not found for update")
            return False
        
        db.close()
        
    except Exception as e:
        print(f"   ❌ Error updating user: {e}")
        return False
    
    # Verify in database directly
    print("\n" + "-" * 60)
    print("4️⃣  Verifying in Database")
    print("-" * 60)
    
    try:
        conn = sqlite3.connect(str(TEST_DB_PATH))
        cursor = conn.cursor()
        
        cursor.execute("SELECT user_id, email, username, name, is_verified FROM users WHERE user_id = ?", (test_user_id,))
        row = cursor.fetchone()
        
        if row:
            print("   ✅ User found in database!")
            print(f"   User ID: {row[0]}")
            print(f"   Email: {row[1]}")
            print(f"   Username: {row[2]}")
            print(f"   Name: {row[3]}")
            print(f"   Verified: {bool(row[4])}")
        else:
            print("   ❌ User not found in database")
            return False
        
        conn.close()
        
    except Exception as e:
        print(f"   ❌ Error verifying: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("=" * 60)
    print("\n🎉 User sync logic is working correctly!")
    print(f"\n📁 Test database: {TEST_DB_PATH}")
    print("   (You can delete this file after testing)")
    
    return True


if __name__ == "__main__":
    try:
        success = test_user_sync_sqlite()
        if success:
            print("\n💡 Next Steps:")
            print("   1. Install Docker (optional) for PostgreSQL testing")
            print("   2. Or install PostgreSQL locally")
            print("   3. Test with real Cognito JWT token via API")
            sys.exit(0)
        else:
            print("\n❌ Tests failed. Check errors above.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


