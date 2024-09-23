# Use the official Python base image
FROM python:3.10.9-alpine

# Set environment variables
# ENV PYTHONDONTWRITEBYTECODE=1
ENV HOMEDIR="/RedditSnap"

# Set the working directory
WORKDIR $HOMEDIR

# Copy the requirements file
COPY . .

# Install dependencies
RUN pip install -r requirements.txt
RUN apk add curl
# RUN cd /RedditSnap

# Arrange cron job
RUN echo "*/10 * * * * time curl http://localhost:8000/etl/dev >> /RedditSnap/completion_time.log 2>>/RedditSnap/response_time.log" >> "/var/spool/cron/crontabs/root"
RUN crond

# Copy the rest of the application code
# COPY . /app/

# Expose the port Django will run on
# EXPOSE 5432

# Command to run the Django development server
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "myproject.wsgi:application"]
CMD crond; python ./SnapReddit_dev/manage.py runserver
    # ["python", "./SnapReddit_dev/manage.py", "runserver"]
# CMD echo $subreddit
