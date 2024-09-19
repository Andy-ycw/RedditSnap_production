from django.http import HttpResponse
from .utils.praw_utils import connect_reddit_endpoint, etl
from datetime import datetime
import pytz

"""
Currently only subreddit relevant etl pipline is planned.
Can incorporate different data in the future such as comments.
"""

def index(request):
    
    return HttpResponse(f"Hello, world. You're at the etl index.\n \
        Your request is {type(request)}")

def dev(request):
    limit = None
    reset = False
    subreddit = "worldnews"
    reddit = connect_reddit_endpoint()
    etl(reddit, limit, subreddit, reset_dst_db = reset, submissions_in_pg=request.submissions_in_pg)

    
    return HttpResponse(f"\nRequest responded successfully at {datetime.now(tz=pytz.timezone('Australia/Melbourne'))}.")