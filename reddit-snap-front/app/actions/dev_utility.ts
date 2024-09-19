import pg from 'pg'

export async function fetchData(query: string) {
    'use server'
    const { Client } = pg
    const client = new Client({
      user: process.env.pg_user,
      password: process.env.pg_password,
      host: process.env.pg_host,
      port: process.env.pg_port,
      database: process.env.pg_db
    })
    await client.connect()
  
    try {
      const res = await client
        .query(`select ups, observed_tstz from submission_time_series where id='${query}' ;`)
      
      console.log("hi", res.rows.length)
      return JSON.stringify(res.rows)
    } catch (err) {
      console.error("error", err);
    } finally {
      await client.end()
    }
  
  }