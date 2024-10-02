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
RUN apk add openssh
RUN apk add autossh
RUN mkdir ~/.ssh

# Arrange cron job for regular snapshot
RUN echo "*/10 * * * * time curl http://localhost:8000/etl/snap_shot >> /RedditSnap/completion_time.log 2>>/RedditSnap/response_time.log" >> "/var/spool/cron/crontabs/root"
RUN crond

CMD ssh-keyscan -H ${aws_pub_ip} >> ~/.ssh/known_hosts; \
    autossh -M 0 -f -N -L 5431:${rds_domain}:5432 -i ${HOMEDIR}/${key_path} ec2-user@${aws_pub_ip}; \
    crond; \
    python ./manage.py runserver

# Previous version
# CMD ssh -o StrictHostKeyChecking=no -f -N -L 5431:${rds_domain}:5432 -i ${key_path} ec2-user@${aws_pub_ip}; \
#     autossh -M 0 -f -N -L 5431:${rds_domain}:5432 -i ${key_path} ec2-user@${aws_pub_ip}; \
#     crond; \
#     python ./manage.py runserver