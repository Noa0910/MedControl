import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Try to connect to MySQL database
    const mysql = require('mysql2/promise')
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'medcontrol'
    })

    await connection.execute('SELECT 1')
    await connection.end()

    return NextResponse.json({ 
      status: 'ok', 
      database: 'mysql',
      message: 'Database connection successful' 
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      database: 'localStorage',
      message: 'MySQL not available, using localStorage' 
    }, { status: 503 })
  }
}


