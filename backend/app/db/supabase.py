from supabase import create_client, Client
from app.core.config import settings
from typing import Optional

def get_supabase_client() -> Optional[Client]:
    """
    Initialize and return a Supabase client using the service role key for full backend access.
    """
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    
    if not url or not key:
        print("Warning: Supabase credentials not fully provided. Running in fallback mode.")
        return None
        
    return create_client(url, key)

supabase_client: Optional[Client] = get_supabase_client()
