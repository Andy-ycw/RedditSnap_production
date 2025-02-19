import pg from 'pg'

const DEFAULT_SUBMISSION_QUERY = `
                select id
                from submission_time_series 
                where observed_tstz > now() - interval '10.5 minute'
                order by ups desc limit 1;
            `;

// TODO: Write data class or use ORM for validating retrieved data.

export async function fetchById(query: string) {
    query = query.replace(/[^a-zA-Z0-9 ]/g, "");
    console.log("clean query", query);
    const { Client } = pg
    const client = new Client({
      user: process.env.pg_user,
      password: process.env.pg_password,
      host: process.env.NODE_ENV === 'development' ? 'localhost' : process.env.pg_host,
      port: Number(process.env.pg_port),
      database: process.env.pg_db
    })
    await client.connect()
    if (query.length == 0) { 
        const res = await client.query(DEFAULT_SUBMISSION_QUERY);
        query = res.rows[0].id;
    }
  
    try {
      let match = true;
      let res_data = await client
        .query(`select ups, observed_tstz from submission_time_series where id='${query}' ;`)
      
      // Handle unmatched id query by returning default.
      if (res_data.rowCount===0) {
        const default_data = await client.query(DEFAULT_SUBMISSION_QUERY);
        query = default_data.rows[0].id;
        res_data = await client
          .query(`select ups, observed_tstz from submission_time_series where id='${query}' ;`)
        match = false
      }
      
      const res_title = await client
        .query(`select title from submission where id='${query}' ;`)
      
      return {data: JSON.stringify(res_data.rows), title: res_title.rows[0].title, match: match}
    } catch (err) {
      console.error("error", err);
    } finally {
      await client.end()
    }
  
  }

export async function fetchFuzzyTitle(query: string) {
  query = query.replace(/[^a-zA-Z0-9 ]/g, "");
  if (query.length > 0) {
      const { Client } = pg
      const client = new Client({
      user: process.env.pg_user,
      password: process.env.pg_password,
      host: process.env.NODE_ENV === 'development' ? 'localhost' : process.env.pg_host,
      port: Number(process.env.pg_port),
      database: process.env.pg_db
      })
      await client.connect()
      if (query.length == 0) return
      
      // TODO: Should make posts with higher upvotes appear first
      try {
          const res = await client.query(`
              select id, title, created_utc 
              from submission 
              where '${query}' <% title
              order by created_utc desc limit 5;
          `);
      
          return res.rows
      } catch (err) {
      console.error("error", err);
      } finally {
      await client.end()
      }
  }
  

}

//   select title, word_similarity('ukr', title) as sml
// 	from submission
// 	where 'ukr' <% title
// 	order by sml desc;