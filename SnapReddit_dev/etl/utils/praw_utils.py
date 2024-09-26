from dotenv import load_dotenv
import os
import praw
import time
from . import pg_utils 
import pandas as pd
from datetime import datetime, timezone
from typing import List, Optional, Set
import logging
import pytz

def connect_reddit_endpoint():
    load_dotenv()
    return praw.Reddit(
            client_id     = os.environ.get('reddit_client_id'),
            client_secret = os.environ.get('reddit_client_secret'),
            user_agent    = os.environ.get('reddit_user_agent')
        )

def etl(reddit: praw.Reddit,
        limit: int,
        subreddit_name: str,
        dst: str = 'pg',
        max_submission: int = 1000,
        reset_dst_db = False,
        submissions_in_pg = Optional[List[str]]
        ):
    
    if dst=='pg':
        load_dotenv()
        target_db_name = os.environ.get('pg_db')

        if reset_dst_db:
            pg_utils.reset_db(target_db_name)

        # Initialise variables for storing data from PRAW
        submission_store = [None] * max_submission
        store_index = 0
        
        # Collect all hot posts atm.
        for submission in reddit.subreddit(subreddit_name).hot(limit=limit):
            submission_store[store_index] = submission
            store_index += 1

        submission_num = store_index

        # Slice the list to get rid of empty positions            
        submission_store = submission_store[:submission_num]     
        
        # Load submission objects into dataframe.
        unix_ts_cur = time.time()
        datetime_utc = datetime.fromtimestamp(unix_ts_cur, tz=timezone.utc)
        
        pre_df = {
            k: [None] * submission_num 
            for k in submission.__dict__.keys() 
            if k in pg_utils.Submission.__dict__
        }
        # Manually handle the situation when `author_fullname` is missing in some submission.
        pre_df['author_fullname'] = [None] * submission_num

        pre_df_ts = {
            k: [None] * submission_num 
            for k in submission.__dict__.keys() 
            if k in pg_utils.SubmissionTimeSeries.__dict__
        }

        sub_set_from_db = submissions_in_pg
        logging.info(f"Registered submission number: {len(sub_set_from_db)}")
        for i in range(len(submission_store)):
            submission = submission_store[i]
            sub_id = submission.id
            for k in submission.__dict__.keys():
                # The if clause below is for filtering registered submissions.
                if k in pg_utils.Submission.__dict__ and not (sub_id in sub_set_from_db):
                    try:
                        pre_df[k][i] = submission.__dict__[k]
                    except KeyError:
                        # FIXME Manual handle of sometimes-missing author_fullname field in praw.Submission
                        pass
                if k in pg_utils.SubmissionTimeSeries.__dict__:
                    pre_df_ts[k][i] = submission.__dict__[k]
            sub_set_from_db.add(sub_id)

        # Bulk load with Pandas Dataframe
        df = pd.DataFrame(pre_df)
        df = df.drop(df[df['id'].isna()].index)
        df['created_utc'] = df['created_utc'].apply(lambda x: datetime.fromtimestamp(x, tz=timezone.utc))
        df_ts = pd.DataFrame(pre_df_ts)
        df_ts['observed_tstz'] = datetime_utc

        pg_utils.bulk_load_df(
            [df, df_ts], 
            [pg_utils.Submission, pg_utils.SubmissionTimeSeries],
            target_db_name)
        # pg_utils.bulk_load(df_ts, pg_utils.SubmissionTimeSeries,target_db_name)
        
        
        melbourne_time = datetime_utc.astimezone(pytz.timezone("Australia/Melbourne"))
        logging.info(f"Data loading successful at {melbourne_time}")
        
    else:
        print(f"The etl process to {dst} is not supported.")
        return None