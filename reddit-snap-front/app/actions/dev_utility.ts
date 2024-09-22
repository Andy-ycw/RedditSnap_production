import pg from 'pg'

export async function fetchData(query: string) {
    'use server'
    const { Client } = pg
    const client = new Client({
      user: process.env.pg_user,
      password: process.env.pg_password,
      host: process.env.pg_host,
      port: Number(process.env.pg_port),
      database: process.env.pg_db
    })
    await client.connect()
  
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