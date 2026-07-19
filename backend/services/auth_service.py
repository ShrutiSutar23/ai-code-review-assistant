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

def request_password_reset(email):
    try:
        supabase.auth.reset_password_email(
            email,
            {"redirect_to": "http://localhost:3000/reset-password"}
        )
        return {"message": "Password reset email sent"}
    except Exception as e:
        return {"error": str(e)}

def update_password(access_token, new_password):
    try:
        supabase.auth.set_session(access_token, access_token)
        result = supabase.auth.update_user({"password": new_password})
        return {"message": "Password updated successfully"}
    except Exception as e:
        return {"error": str(e)}
    
def update_profile(access_token, name=None, email=None):
    try:
        supabase.auth.set_session(access_token, access_token)

        update_data = {}
        if email:
            update_data["email"] = email
        if name:
            update_data["data"] = {"full_name": name}

        result = supabase.auth.update_user(update_data)
        return {"message": "Profile updated successfully"}
    except Exception as e:
        return {"error": str(e)}


def get_profile(access_token):
    try:
        supabase.auth.set_session(access_token, access_token)
        user = supabase.auth.get_user(access_token)
        return {
            "email": user.user.email,
            "name": user.user.user_metadata.get("full_name", "") if user.user.user_metadata else ""
        }
    except Exception as e:
        return {"error": str(e)}