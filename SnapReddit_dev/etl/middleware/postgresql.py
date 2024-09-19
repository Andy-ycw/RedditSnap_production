from etl.utils.pg_utils import get_sub_set, init_tables, get_pg_credentials
import os
from dotenv import load_dotenv
import logging
from sqlalchemy import create_engine, text

# Need to rename to PostgresMiddleware
class SimpleMiddleware:
    # TODO: Code partition through pg_partmen; need to NOTE!idenfify where(s) to implement.
    def __init__(self, get_response):
        load_dotenv()
        # user, password, host, port = get_pg_credentials()
        # db_name = os.environ.get('pg_db')
        # engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{db_name}')
        # with engine.connect() as conn:
        #     query = text("CREATE EXTENSION pg_partman WITH SCHEMA public;")
        #     conn.execute(query)

        try:
            
            init_tables(os.environ.get('pg_db')) # FIXME: For development only - uncomment only when the database is reinitialised.
            self.get_response = get_response
            self.submissions_in_pg = get_sub_set(os.environ.get('pg_db'))

        except Exception:
            raise Exception("Errors when initialising the middleware.")
        
        logging.info("Here is run only once when the server starts")

    def __call__(self, request):
        try:
            logging.info("Here is run before a view is run")

            # request = {'request': request, 'submission_in_pg': self.submission_in_pg }
            # response, etlAgent = self.get_response(request)
            request.submissions_in_pg = self.submissions_in_pg
            response = self.get_response(request)

            logging.info("Here is run after a view is run")

            return response
        except Exception:
            raise Exception("Error when handling request")