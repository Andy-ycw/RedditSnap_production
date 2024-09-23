import pg from 'pg'

export async function fetchById(query: string) {
    const { Client } = pg
    const client = new Client({
      user: process.env.pg_user,
      password: process.env.pg_password,
      host: process.env.pg_host,
      port: Number(process.env.pg_port),
      database: process.env.pg_db
    })
    await client.connect()
    if (query.length == 0) { 
        const res = await client.query(`
                select id
                from submission_time_series 
                where observed_tstz > now() - interval '1.5 minute'
                order by ups desc limit 1;
            `);
        query = res.rows[0].id;
    }
  
    try {
      const res_data = await client
        .query(`select ups, observed_tstz from submission_time_series where id='${query}' ;`)
      const res_title = await client
        .query(`select title from submission where id='${query}' ;`)
      
      return {data: JSON.stringify(res_data.rows), title: res_title.rows[0].title}
    } catch (err) {
      console.error("error", err);
    } finally {
      await client.end()
    }
  
  }