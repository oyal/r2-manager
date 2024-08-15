import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic',
      },
    })
  }
}

async function isAuthorized(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return false

  const [username, password] = atob(authHeader.split(' ')[1]).split(':')

  return username === process.env.USERNAME && password === process.env.PASSWORD
}
