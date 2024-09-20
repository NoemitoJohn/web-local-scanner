import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const encodedKey = new TextEncoder().encode('z3RnfiMwkWFl/T0qZaEDk3dMoVm7wNdzYRylYmQQU44=')

const email = 'gatepersonnel@gmail.com'
const password = '123456789'

export function verifyUser(user : {email: string, password: string}) {
  if(email === user.email && password === user.password) { return true }
  return false
}

export async function encrypt(payload : {email : string}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(encodedKey)
}

export async function decrypt(token: string | undefined = '') {
  try {

    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.log('Failed to verify session')
    // console.log(error)
  }
}

export async function createSession(token : string) {
  cookies().set('session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })
}