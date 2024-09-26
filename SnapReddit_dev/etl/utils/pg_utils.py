from sqlalchemy import Column, Integer, String, create_engine, Numeric, Boolean, ForeignKey, DateTime, select, Index, text
from sqlalchemy.orm import sessionmaker, declarative_base
from psycopg2 import OperationalError as psycopg2OperationalError
from dotenv import load_dotenv
import os
import pandas as pd
from typing import List
import logging

Base = declarative_base()

class Submission(Base):
    """
    Most object attributes below are named after attribtes in Submission object.
    Check the corresponding bulk loading method to see which attribute is not.
    """
    __tablename__ = 'submission'
    id = Column(String, primary_key=True)
    title = Column(String)
    subreddit_name_prefixed = Column(String)
    name = Column(String)
    author_fullname = Column(String)
    is_original_content = Column(Boolean)
    is_created_from_ads_ui = Column(Boolean)
    is_self = Column(Boolean)
    subreddit_id = Column(String)
    permalink = Column(String)
    created_utc = Column(DateTime(timezone=True))

    __table_args__ = (
        
        Index('idx_created_utc', created_utc, postgresql_using='brin' ),
        
    )

class SubmissionTimeSeries(Base):
    __tablename__ = 'submission_time_series'
    id = Column(String, ForeignKey('submission.id'), primary_key=True)
    # id = Column(String, primary_key=True)
    observed_tstz = Column(DateTime(timezone=True), primary_key=True)
    ups = Column(Integer)
    upvote_ratio = Column(Numeric(precision=3, scale=2))
    num_comments = Column(Integer)

    __table_args__ = (
        Index('idx_observation_time_w/timezone', observed_tstz ,postgresql_using='brin' ),
        # {"postgresql_partition_by": 'RANGE (observed_tstz)'} #FIXME: Need to find a way to create parition table. Otherwise insertion would fail.
        # Index('idx_observation_time_w/timezone_btree', observed_tstz ,postgresql_using='btree' ),  
    )

def get_pg_credentials():
    load_dotenv()
    user = os.environ.get('pg_user')
    password = os.environ.get('pg_password')
    host = os.environ.get('pg_host')  # or the IP address of your PostgreSQL server
    port = os.environ.get('pg_port')  # Default PostgreSQL port
    return user, password, host, port

def get_pg_rds_credentials():
    load_dotenv()
    user = os.environ.get('pg_rds_user')
    password = os.environ.get('pg_rds_password')
    host = os.environ.get('pg_rds_host')  # or the IP address of your PostgreSQL server
    port = os.environ.get('pg_rds_port')  # Default PostgreSQL port
    return user, password, host, port


def init_tables(db_name):
    # Table initialisation
    user, password, host, port = get_pg_credentials()
    engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{db_name}')
    Base.metadata.create_all(engine)

    # Submit transactions to init tables 
    Session = sessionmaker(bind=engine)
    session = Session()
    session.commit()
    session.close_all()

    # Submit transactions for partion table creation FIXME: Need better partitions; NOT WOKRING
    # with engine.connect() as conn:
    #     conn.execute(text("CREATE TABLE orders_2024 PARTITION OF submission_time_series FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');"))

    logging.info("Successfully initialises tables in db server.")

def reset_db(db_name):
    user, password, host, port = get_pg_credentials()
    engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{db_name}')

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    
    Session = sessionmaker(bind=engine)
    session = Session()
    session.commit()
    session.close_all()

    return "Successful"

def bulk_load_df(df_list: list[pd.DataFrame], data_model_list: List[Base], db_name):     
    # It is designed that the data should be loaded to a local db and a remote db with identical data.
    # So the database name and data models should be the same. 

    user, password, host, port = get_pg_credentials()
    engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{db_name}')
    
    user_rds, password_rds, host_rds, port_rds = get_pg_rds_credentials()
    engine_rds = create_engine(f'postgresql://{user_rds}:{password_rds}@{host_rds}:{port_rds}/{db_name}')

    for i in range(len(df_list)):
        with engine.connect() as conn:
            df = df_list[i]
            data_model = data_model_list[i]
            df.to_sql(data_model.__tablename__, conn, if_exists="append", index=False)
        
        with engine_rds.connect() as conn:
            df = df_list[i]
            data_model = data_model_list[i]
            df.to_sql(data_model.__tablename__, conn, if_exists="append", index=False)

# Get the list of submission id from db
def get_sub_set():
    user, password, host, port = get_pg_credentials()
    logging.debug(host)
    load_dotenv()
    db_name = os.environ.get('pg_db')
    
    engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{db_name}')
    # For development, use localhost below but not the host in .env as above
    # engine = create_engine(f'postgresql://{user}:{password}@localhost:{port}/{db_name}')

    with engine.connect() as connection:
        query = select(Submission.id)
        result_tuple_list = connection.execute(query).fetchall()
        
        brin_size_list = connection.execute(text("SELECT pg_size_pretty(pg_relation_size('idx_observation_time_w/timezone'));")).fetchall()
        logging.info(f"brin size: {[size for size in brin_size_list]}")
    
    return set(t[0] for t in result_tuple_list)