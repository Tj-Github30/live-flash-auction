#!/usr/bin/env python3
"""
Quick script to check if a user exists in the database
"""
import sys
import os

# Add paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'shared'))
sys.path.insert(0, os.path.dirname(__file__))

# Set database URL if using SQLite (adjust if using PostgreSQL)
if not os.getenv('DATABASE_URL'):
    os.environ['DATABASE_URL'] = 'sqlite:///./test_live_auction.db'

# Remove extra env vars that cause validation errors
extra_vars = ['FLASK_SECRET_KEY', 'API_PORT']
for var in extra_vars:
    if var in os.environ:
        del os.environ[var]

try:
    from shared.database.connection import SessionLocal
    from shared.models.user import User
    
    # Check for users
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f'\n📊 Total users in database: {len(users)}')
        
        if users:
            print('\n✅ Users found:')
            for user in users:
                print(f'   - Email: {user.email}')
                print(f'     User ID: {user.user_id}')
                print(f'     Username: {user.username}')
                print(f'     Name: {user.name}')
                print(f'     Verified: {user.is_verified}')
                print(f'     Created: {user.created_at}')
                print()
        else:
            print('\n⚠️  No users found in database')
            print('\n💡 Why?')
            print('   User sync happens automatically when you make an authenticated API call.')
            print('   The signup/login endpoints don\'t trigger sync - only protected endpoints do.')
            print('\n📝 To trigger sync:')
            print('   1. Make an API call to a protected endpoint (e.g., POST /auctions)')
            print('   2. Include your token in Authorization header: Bearer <your_token>')
            print('   3. The @require_auth decorator will automatically sync the user')
            
    finally:
        db.close()
        
except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()

