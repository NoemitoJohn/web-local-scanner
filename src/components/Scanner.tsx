'use client'

import { scanner, TScannerResponse } from "@/server/actions/scanner"
import { ImageOff } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useFormState } from "react-dom"

type TAttendanceHistory = {
  is_time_out: boolean | null; 
  time_in: string | null;
  time_out: string | null;
  date_time_stamp: Date | null | string;
}

async function action(prevState : TScannerResponse, formData : FormData) {
  const response = await scanner(formData)
  if(response)
    return response
  return prevState
}

export default function Scanner() {
  const [studentInfo, formAction] = useFormState(action, null)
  const [historyTimeIn, setHistoryTimeIn] = useState<TAttendanceHistory[]>();
  const [historyTimeOut, setHistoryTimeOut] = useState<TAttendanceHistory[]>();
  const inputScanRef = useRef<HTMLInputElement>(null)
  
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
      // document.body.removeEventListener('keydown', handleKeyDown);
      document.body.removeEventListener('click', handleBodyClick)
    };
  }, []);

  useEffect(() => {
    if(!inputScanRef.current) return

    if(studentInfo) {
     const timeOut = studentInfo.history.filter((v) => v.is_time_out)
     const timeIn = studentInfo.history.filter((v) => !v.is_time_out)
     setHistoryTimeIn(timeIn)
     setHistoryTimeOut(timeOut)
     inputScanRef.current.value = ''
    }
  }, [studentInfo])
  
  const handleKeyDown = async (event : React.KeyboardEvent<HTMLInputElement>) => {
    
    if(!inputScanRef.current) return

    if(event.key === 'Enter'){
      const formData = new FormData()
      
      formData.set('code', inputScanRef.current.value)
      
      formAction(formData)
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
                  <div className="bg-red-400 w-full h-full relative">
                     <Image loader={(l) => l.src} src={studentInfo?.profile_url} alt="" fill  />
                  </div>
                )
              :
                (
                  <div className='e bg-zinc-600 flex min-h-full justify-center items-center'>
                    <ImageOff className='text-white' size={60}/>
                  </div>
              )}
            </div>
            <div className= 'col-start-2 col-span-2 row-span-4'>
              <div className='grid grid-cols-2 gap-5'>
                <div className='col-span-2 flex flex-col justify-end '>
                  <p className='text-2xl font-bold font-sans   text-slate-500 uppercase'>Full Name</p>
                </div>
                <div className='col-span-2  '>
                  <p className='text-4xl   font-sans text-slate-900 font-extrabold uppercase'>{studentInfo?.full_name}</p>
                </div>
                <div className='col-span-2 flex flex-col justify-end '>
                  <p className='text-2xl font-bold font-sans  text-slate-500 uppercase'>Grade Level</p>
                </div>
                <div className='col-span-2  '>
                  <p className='text-4xl   font-sans text-slate-900 font-extrabold uppercase'>{studentInfo?.grade_level}</p>
                </div>
                <div className='col-span-2 flex flex-col justify-end '>
                  <p className='text-2xl font-bold font-sans   text-slate-500 uppercase'>Section</p>
                </div>
                <div className='col-span-2  '>
                  <p className='text-4xl   font-sans text-slate-900 font-extrabold uppercase'>{studentInfo?.section_name}</p>
                </div>
                <div className='col-span-2 flex flex-col justify-end '>
                  <p className='text-2xl font-bold font-sans   text-slate-500 uppercase'>School year</p>
                </div>
                <div className='col-span-2  '>
                  <p className='text-4xl   font-sans text-slate-900 font-extrabold uppercase'>{studentInfo?.school_year}</p>
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
            {/* <div className='row-span-5 '>
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
      
    </>
  )
}
