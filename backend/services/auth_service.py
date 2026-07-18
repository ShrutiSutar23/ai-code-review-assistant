from services.supabase_client import supabase

def register_user(email, password):
    try:
        result = supabase.auth.sign_up({"email": email, "password": password})
        return {"user": result.user.email if result.user else None, "session": result.session is not None}
    except Exception as e:
        return {"error": str(e)}

def login_user(email, password):
    try:
        result = supabase.auth.sign_in_with_password({"email": email, "password": password})
        return {
            "access_token": result.session.access_token,
            "user": result.user.email
        }
    except Exception as e:
        return {"error": str(e)}

def logout_user():
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out"}
    except Exception as e:
        return {"error": str(e)}