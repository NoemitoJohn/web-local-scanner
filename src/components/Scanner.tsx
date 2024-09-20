'use client'

import { scanner, TScannerResponse } from "@/server/actions/scanner"
import { ImageOff } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import profile_placeholder from '@/app/assets/student.png'

type TAttendanceHistory = {
  is_time_out: boolean | null; 
  time_in: string | null;
  time_out: string | null;
  date_time_stamp: Date | null | string;
}

export default function Scanner() {
  // const [studentInfo, formAction] = useFormState(action, null)
  const [studentInfo, setStudentInfo] = useState<TScannerResponse>()
  const [historyTimeIn, setHistoryTimeIn] = useState<TAttendanceHistory[]>();
  const [historyTimeOut, setHistoryTimeOut] = useState<TAttendanceHistory[]>();
  const inputScanRef = useRef<HTMLInputElement>(null)
  const [timer, setTimer] = useState<NodeJS.Timeout>()

  const handleBodyClick = () => { 
    if(inputScanRef.current) {
      inputScanRef.current.focus()
    }
  }

  useEffect(() => {

    if(inputScanRef.current) {
      inputScanRef.current.focus()
    }

    document.body.addEventListener('click', handleBodyClick)
    
    return () => {
      document.body.removeEventListener('click', handleBodyClick)
      clearTimeout(timer)
    };
    
    
  }, []);
  
  const handleKeyDown = async (event : React.KeyboardEvent<HTMLInputElement>) => {
    
    
    
    if(!inputScanRef.current) return
    
    if(event.key === 'Enter'){
      clearTimeout(timer)
      
      const formData = new FormData()
      
      formData.set('code', inputScanRef.current.value)

      const result = await scanner(formData)

      if(!result) { 
        inputScanRef.current.value = ''
        toast.error('No Stundent found', {autoClose: 1500}) 
        return 
      }
      
      const timeOut = result.history.filter((v) => v.is_time_out)
      const timeIn = result.history.filter((v) => !v.is_time_out)

      setHistoryTimeIn(timeIn)
      setHistoryTimeOut(timeOut)
      
      inputScanRef.current.value = ''

      setStudentInfo(result)
      setTimer(setTimeout(()=> {
        setStudentInfo(null)
      }, 1000 * 15))
    }
  }
  return (
    <>
    <input ref={inputScanRef} placeholder="LRN"  className="absolute left-[-99999999px]" onKeyDown={handleKeyDown}/>
    <div className='col-span-4 text-center text-4xl font-extrabold ' >GSC SPED INTEGRATED SCHOOL</div>
    <hr/>
    <div className='grid grid-cols-4 h-full mt-6 gap-4 pl-2 pr-2 '>
        {!studentInfo && (
          <div className='col-span-4 flex justify-center'>
            <p className='text-2xl font-extrabold uppercase'>Scan your Qrcode</p>
          </div>
        )}
        {studentInfo && (
          <>
            <div className='col-start-1 row-span-4'>
              {studentInfo?.profile_url ? 
                (   
                  <div className="bg-zinc-600 w-full h-full relative">
                     <Image loader={(l) => l.src} src={studentInfo?.profile_url} alt="" fill  />
                  </div>
                )
              :
                (
                  <div className=' w-full h-full relative'>
                    <Image alt="profile" src={profile_placeholder} fill />
                  </div>
              )}
            </div>
            <div className= 'col-start-2 col-span-2 row-span-4'>
              <div className='grid grid-cols-2 gap-5'>
                <div className='col-span-2 flex flex-col justify-end '>
                  <p className='text-2xl font-bold font-sans   text-slate-500 uppercase'>Full Name</p>
                </div>
                <div className='col-span-2'>
                  <p className='text-4xl font-sans text-slate-900 font-extrabold uppercase'>{studentInfo?.full_name}</p>
                </div>
                <div className='col-span-2 flex flex-col justify-end '>
                  <p className='text-2xl font-bold font-sans  text-slate-500 uppercase'>Grade Level</p>
                </div>
                <div className='col-span-2'>
                  <p className='text-4xl font-sans text-slate-900 font-extrabold uppercase'>{studentInfo?.grade_level}</p>
                </div>
                <div className='col-span-2 flex flex-col justify-end '>
                  <p className='text-2xl font-bold font-sans   text-slate-500 uppercase'>Section</p>
                </div>
                <div className='col-span-2'>
                  <p className='text-4xl font-sans text-slate-900 font-extrabold uppercase'>{studentInfo?.section_name}</p>
                </div>
                <div className='col-span-2 flex flex-col justify-end '>
                  <p className='text-2xl font-bold font-sans   text-slate-500 uppercase'>School year</p>
                </div>
                <div className='col-span-2'>
                  <p className='text-4xl font-sans text-slate-900 font-extrabold uppercase'>{studentInfo?.school_year}</p>
                </div>
              </div>
            </div>
            <div className="row-span-6 ">
              <div className="max-w-max ml-auto mr-auto">
                <p className="font-sans text-2xl font-bold uppercase">{ new Intl.DateTimeFormat('en-US', { dateStyle: 'long',}).format(new Date())}</p>
                <div className='grid grid-cols-2 mt-2'>
                  <div>
                    <p className='text-2xl font-sans text-slate-500 font-bold uppercase'>TIME IN</p>
                    {historyTimeIn && historyTimeIn.map(v => (
                      <p key={v.time_in} className='text-2xl font-sans  text-slate-900 font-bold uppercase'>
                        {new Intl.DateTimeFormat('en-US', { timeStyle: 'short'}).format(new Date(v.date_time_stamp as string))}
                      </p>
                    ))}
                  </div>
                  <div> 
                    <p className='text-2xl font-sans text-slate-500  font-bold uppercase'>TIME OUT</p>
                    {historyTimeOut && historyTimeOut.map(v => (
                      <p key={v.time_out} className='text-2xl font-sans  text-slate-900 font-bold uppercase'>
                        {new Intl.DateTimeFormat('en-US', { timeStyle: 'short'}).format(new Date(v.date_time_stamp as string))}
                      </p>
                    ))}
                  </div>    
                </div>
              </div>
            </div>
            {/*<div className='row-span-5 '>
              <div className='grid grid-cols-2 '>
                <div >
                  <p className='text-2xl font-sans text-center text-slate-500  font-extrabold uppercase'>TIME IN</p>
                  {historyTimeIn && historyTimeIn.map(v => (
                    <p key={v.time_in} className='text-2xl font-sans text-center text-slate-900 font-extrabold uppercase'>
                      {new Intl.DateTimeFormat('en-US', { timeStyle: 'short'}).format(new Date(v.date_time_stamp as string))}
                    </p>
                  ))}
                </div>
                <div> 
                  <p className='text-2xl font-sans text-center text-slate-500  font-extrabold uppercase'>TIME OUT</p>
                  {historyTimeOut && historyTimeOut.map(v => (
                    <p key={v.time_out} className='text-2xl font-sans text-center text-slate-900 font-extrabold uppercase'>
                      {new Intl.DateTimeFormat('en-US', { timeStyle: 'short'}).format(new Date(v.date_time_stamp as string))}
                    </p>
                  ))}
                </div>    
              </div>
            </div> */}
          </>
        )}
      </div>
      <ToastContainer  />
    </>
  )
}
