# utils.py

from datetime import timedelta
from django.utils.timezone import now


def format_time_difference(last_updated_at):
    now_time = now()
    diff = now_time - last_updated_at

    if diff < timedelta(minutes=1):
        return "moments ago"
    elif diff < timedelta(hours=1):
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    elif diff < timedelta(days=1):
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff < timedelta(days=30):
        days = diff.days
        return f"{days} day{'s' if days > 1 else ''} ago"
    elif diff < timedelta(days=365):
        months = diff.days // 30
        return f"{months} month{'s' if months > 1 else ''} ago"
    else:
        years = diff.days // 365
        return f"{years} year{'s' if years > 1 else ''} ago"

