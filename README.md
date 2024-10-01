<h1>Overview</h1>

Welcome to the GitHub repo of [RedditSnap](https://www.andycw.com/RedditSnap)! RedditSnap is a simple web app that provides visualisation for the upvote trends of Reddit posts over time. The app takes a snapshot of Reddit posts every 10 minutes, which is why the app is named RedditSnap.

<h3>Features</h3>
    <ol>
        <li>The visualisation of post upvote trends over time with tip mark.</li>
        <li>Search post by post ID.</li>
        <li>Fuzzy search of post by post title.</li>
    </ol>

The project is in the early stage so only the trends of Hot posts in the WorldNews subreddit are available. More data will be availble and more features will be implemented in the future. For example, the trend of comment numbers will be made available, and it would be interesting to use NLP for investigating comment topics over different time windows. Nonetheless, improvements on technical aspects will also be made incrementally (i.e. code refactoring, search result pagination).

<h1>Application architecture</h1>

- Local snapshot service: Django (local Docker deployment, code in SnapReddit_dev)
- Database: PostgreSQL (managed by AWS RDS, some queries in postgres_admin)
- Web server: Next.js (Docker deployment in EC2, code in reddit-snap-front) + Nginx (configured manually in EC2)
 
The main compoenents of RedditSnap is outlined above. Note that scripts in postgres_admin are for exploring query efficiency.  

The local snapshot service is run locally on my device with Docker. A Cron job is set up inside the container environment to make regular requests to the Django service. Each time the service receives a request, it extracts Hot post data from the Reddit API, transforms them into Pandas DataFrame, and bulk loads them into the database. 

In the Postgres database, the BRIN index and the GIST index are implemented. BRIN is beneficial because the data queried in RedditSnap are mostly time-series data. GIST is implemented to index the trigrams of post titles, which enables fast fuzzy search of posts by title.
 
Next.js is considered suitable for small projects like RedditSnap because both the frontend and backend code can be developed within the framework. Nginx is used for HTTPS connection, and rate limiting.

<h3>Lessons learned and decision making on architectural desings and implementation details</h3>

<ol>
    <li>The snapshot service is deployed locally because it loads data not only into the database on AWS, but also a local one, as I want to keep a copy of the data locally. While data transfer out from AWS incurs costs, data tranfer into AWS is free. Hence, deploying the snapshot service locally is more cost efficient. </li>
        <ul>
            <li>A trivial approach of loading data from the local snapshot service to the remote RDS databsae would be assigning the database a public IP address, and load data directly. This is not a good practice for reasons of security and cost. Firstly, exposing a database to the public makes the database susceptible to attacks from the Internet. Secondly, except the first public IP address assigned to an EC2 instance, all the others incur costs. </li>
            <li>SSH tunneling is used for loading data into the remote database. By tunneling through the EC2 instance with a public IP address, an ecrypted connection is establish between a local port and the remote database port. It is worth noting that SSH connections can be dropped due to various reasons, so a tool of automatically re-establishing SSH connection is necessary for this approach. autossh is adopted for this task in this project. </li>
        </ul>
    <li>One may notice that it is an overkill to implement the snapshot service with Django, which is totally a valid criticism. Using Django is purely motivated by my desire of learning web frameworks. In particualr, I learned what middleware is in the context of web frameworks, which had been a vague concept for me. I use the middleware to maintain a Python Set in memory for tracking existing posts in the database. The purpose is to avoid loading post data that could violate the unique constraint enforced in the database.</li>    
    <li>RedditSnap utilises the Server Component feature offered by React and Next.js to interact with the database so that a REST API service is not necessary for fetching data. However, this is not to say that the Server Component replaces API services because the latter is the best practice in more complex environments. For example, a REST API can fetch data for any services that make requests (with valid credentials, of course), but the Server Component is bound to Next.js. Overall, as RedditSnap is the only application that interacts with the database, the adoption of Server Component to save the effort of maintaining a REST API service is considered appropriate.</li>
    <li>Although Nginx might seem redundant for small-scale projects like RedditSnap, it is the simplest tool that I know for implementing HTTPS. Moreover, other features in Nginx, such as load balancing, will come in handy if the application is scaled up horizontally in the future. </li>
</ol>

<br>
<h1>Contact</h1>

I would appreciate any questions, suggestions, and feedback to help me get better at web development. Please feel free to email me - andyyu.general@gmail.com. 
