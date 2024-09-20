'use server'
import { createSession, encrypt, verifyUser } from "@/lib/session";
import { UserSchema } from "@/validation/schema";


export async function login(formData : FormData) {
  const validate = UserSchema.safeParse({
    email : formData.get('email'),
    password : formData.get('password')
  })

  if(!validate.success) { 
    return {
      success : false,
    }
  }

  if(!verifyUser(validate.data)) {
    return {
      success : false
    }
  } 

  const token = await encrypt({email : validate.data.email})
  
  createSession(token)
  
  return {
    success : true
  }

}