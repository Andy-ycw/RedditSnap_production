from etl.utils.pg_utils import get_sub_set, init_tables
import os
from dotenv import load_dotenv
import logging

class BlockRepeatSubmissionMiddleware:
    def __init__(self, get_response):
        load_dotenv()

        try:
            # init_tables(os.environ.get('pg_db')) # FIXME: For development only - uncomment only when the database is reinitialised.

            # The `get_response` function is stored in the middleware object in which the middleware would 
            # use when requests come.
            self.get_response = get_response

            # Store the existing submission IDs in the database to avoid repetitive loading into the database.
            self.submissions_in_pg = get_sub_set()
            

        except Exception as e:
            logging.debug(e)
            raise Exception("Errors when initialising the middleware.")
            
        
        logging.info("Here is run only once when the server starts")

    def __call__(self, request):
        try:
            logging.info("Here is run before a view is run")

            # Attach the existing submission ids to the incoming request so that 
            # downstream processes can check.
            request.submissions_in_pg = self.submissions_in_pg
            response = self.get_response(request)

            logging.info("Here is run after a view is run")

            return response
        except Exception:
            raise Exception("Error when handling request")