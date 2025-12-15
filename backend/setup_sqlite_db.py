#!/usr/bin/env python3
"""
Setup SQLite database for local testing (no Docker needed)
"""
import sys
import os

# Add shared to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'shared'))
sys.path.insert(0, os.path.dirname(__file__))

# Set SQLite database URL
os.environ.setdefault('DATABASE_URL', 'sqlite:///./test_live_auction.db')
os.environ.setdefault('FLASK_DEBUG', 'True')

from database.connection import init_db, engine
from sqlalchemy import inspect

def setup_database():
    """Initialize database and create tables"""
    print("🔧 Setting up SQLite database...")
    print("=" * 60)
    
    try:
        # Initialize database (creates tables)
        init_db()
        print("✅ Database initialized!")
        
        # Verify tables were created
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"\n📊 Created tables: {', '.join(tables)}")
        
        if 'users' in tables and 'auctions' in tables:
            print("✅ All required tables created!")
            print(f"\n📁 Database file: {os.path.abspath('test_live_auction.db')}")
            return True
        else:
            print("⚠️  Some tables may be missing")
            return False
            
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = setup_database()
    if success:
        print("\n✅ Database setup complete! Ready to run services.")
        sys.exit(0)
    else:
        print("\n❌ Database setup failed.")
        sys.exit(1)


