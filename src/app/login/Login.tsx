'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/server/actions/auth'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function Login() {
  const router = useRouter()
  const handleSubmit =  async (formData : FormData) => {
    const success = await login(formData)
    if(success) {
      router.refresh()
    }
  }

  return (
    <div>
      <Card className='rounded-none shadow-md'>
        <CardHeader >
          <CardTitle>Login</CardTitle>
          <CardDescription>Provide information below</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label >Email</Label>
              <Input type='email' name='email' placeholder="example@gmail.com" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label >Password</Label>
              <Input  type='password' name='password' placeholder="Password" />
            </div>
            <div className=" flex items-center justify-between">
                {/* <span className="text-xs">Don't have an account? <Link href='/signup'><span className="hover:text-primary underline text-foreground">Sign up</span></Link></span> */}
                <Button size='sm' >Login</Button>
              </div>
            </div>
          </form>
        </CardContent>

      </Card>
    </div>
  )
}
