from dotenv import load_dotenv
import os
import praw
import time
from . import pg_utils 
import pandas as pd
from datetime import datetime, timezone
from enum import Enum, auto
from typing import List, Tuple, Optional, Set
import logging
import pytz

def connect_reddit_endpoint():
    load_dotenv()
    return praw.Reddit(
            client_id     = os.environ.get('reddit_client_id'),
            client_secret = os.environ.get('reddit_client_secret'),
            user_agent    = os.environ.get('reddit_user_agent')
        )

class PrawObjectType(Enum):
    SUBMISSION = auto()

# An imcomplete refactor of the function etl.
class SubmissionEtlAgent:
    """
    The class variables store some column names in dataframes, which are the output of the 
    transformation step. The values or data types of these columns are changed 
    so the column names are stored here.
    """
    submission_creation_col = "created_utc"
    submission_measurement_col = "observed_tstz"
    def __init__(
        self,
        reddit: praw.Reddit,
        limit: int,
        subreddit_name: str,
        max_submission: int = 1000,
        reset_dst_db = False,
    ):
        self.reddit = reddit
        self.limit = limit
        self.subreddit_name = subreddit_name
        self.max_submission = max_submission,

    def extract(self) -> List[praw.models.Submission]:
        load_dotenv()

        # Initialise variables for storing data from PRAW
        submission_store = [None] * self.max_submission
        store_index = 0
        
        # Collect all hot posts atm.
        for submission in self.reddit.subreddit(self.subreddit_name).hot(limit=self.limit):
            submission_store[store_index] = submission
            store_index += 1

        submission_num = store_index

        # Slice the list to get rid of empty positions            
        submission_store = submission_store[:submission_num]

        return submission_store
    
    def transform(self, submission_store: List[praw.models.Submission]) -> Tuple[pd.DataFrame]:
        unix_ts_cur = time.time()
        datetime_utc = datetime.fromtimestamp(unix_ts_cur, tz=timezone.utc)
        submission_num = len(submission_store)
        pre_df = {
            k: [None] * submission_num 
            for k in submission.__dict__.keys() 
            if k in pg_utils.Submission.__dict__
        }
        pre_df_ts = {
            k: [None] * submission_num 
            for k in submission.__dict__.keys() 
            if k in pg_utils.SubmissionTimeSeries.__dict__
        }

        for i in range(len(submission_store)):
            submission = submission_store[i]
            for k in submission.__dict__.keys():
                if k in pg_utils.Submission.__dict__:
                    pre_df[k][i] = submission.__dict__[k]
                if k in pg_utils.SubmissionTimeSeries.__dict__:
                    pre_df_ts[k][i] = submission.__dict__[k]

        df = pd.DataFrame(pre_df)
        df[self.submission_creation_col] = df[self.submission_creation_col].apply(lambda x: datetime.fromtimestamp(x, tz=timezone.utc))
        df_ts = pd.DataFrame(pre_df_ts)
        df_ts[self.submission_measurement_col] = datetime_utc

    def bulk_load(
            self, df: pd.DataFrame, 
            db_table: str, 
            data_model: pg_utils.Base,
            db = 'pg', 
            submission_in_db: Optional[Set[str]] = None,):
        if db=='pg':
            if submission_in_db:
                pass
            else:
                pg_utils.bulk_load(df, data_model, db_table)
        # pg_utils.bulk_load(df_ts, pg_utils.SubmissionTimeSeries,target_db_name)
    
    def run(self):
        submission_store = self.extract()
        df_sub, df_sub_ts = self.transform(submission_store)
        self.bulk_load(df_sub, os.environ.get('pg_db'), uniqueness_handle=True)
        self.bulk_load(df_sub_ts, os.environ.get('pg_db'))

def etl(reddit: praw.Reddit,
        limit: int,
        subreddit_name: str,
        dst: str = 'pg',
        max_submission: int = 1000,
        reset_dst_db = False,
        submissions_in_pg = Optional[List[str]]
        ):
    # assert 'src' in kwargs, "Key `src` is required as the function parameter."
    # assert 'dst' in kwargs, "Key `dst` is required as the function parameter."
    # src = kwargs['src']
    # dst = kwargs['dst']
    
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

        # sub_set_from_db = pg_utils.get_sub_set(target_db_name)
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
        # df.dropna(inplace=True) #FIXME: This is likely to be the reason of FK violation.
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