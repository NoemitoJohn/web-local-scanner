'use server'

import { localDB, onlineDB, supabase } from "@/database/db"
import { class_attendance, enrolled_students, grade_levels, sections, students } from "@/database/schema"
import { and, eq, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"


export type TScannerResponse = Awaited<ReturnType<typeof scanner>>

export async function scanner(data: FormData) {
  const code = data.get('code')?.toString()
  const now = new Date()
  console.log(code)
  const parent = alias(class_attendance, 'parent')
  // subquery get max created_date 
  const subquery = localDB.select({
    max_date: sql<string>`MAX(${class_attendance.created_date})`.as('sq_max_date'),
    attendance_date: sql<string>`${class_attendance.attendance_date}`.as('sq_attendance_date'),
    student_id: sql<string>`${class_attendance.student_id}`.as('sq_student_id'),
  })
  .from(class_attendance)
  .innerJoin(students, eq(students.id, class_attendance.student_id))
  .where(
    and(
      eq(students.lrn, code!), 
      eq(class_attendance.attendance_date, sql`DATE(${new Intl.DateTimeFormat('en-US').format(now)})`)
    )
  )
  .groupBy(class_attendance.student_id, class_attendance.attendance_date).as('sq')

  const latestAttendance = await localDB.select({ // get latest inserted 
    is_time_out: parent.is_time_out
  }).from(subquery)
  .innerJoin(parent, sql`${subquery.max_date} = ${parent.created_date} AND ${subquery.attendance_date} = ${parent.attendance_date} AND ${subquery.student_id} = ${parent.student_id}`)


  const studentInfo = await localDB.select(
    {
      student_id: students.id,
      full_name: sql<string>`CONCAT(${students.last_name},', ',${students.first_name}, '. ',  COALESCE(${students.middle_name}, ''))`.as('full_name'),
      grade_level: sql<string>`${grade_levels.level_name}`.as('grade_level'),
      section_name: sql<string>`${sections.section_name}`.as('section_name'),
      img_url: students.img_url,
      section_id: sections.id,
      school_year: enrolled_students.school_year
    }
  ).from(students).where(eq(students.lrn, code!))
  .innerJoin(enrolled_students, eq(enrolled_students.id, students.enrollment_id))
  .innerJoin(sections, eq(sections.id, enrolled_students.section_id))
  .innerJoin(grade_levels, eq(grade_levels.id, sql`CAST (${sections.grade_level_id} as TEXT)`))
  
  if(studentInfo.length === 0) return null
  let profile_url : string | null = null
  
  if(studentInfo[0].img_url){
    const {data} = await supabase.storage.from('profile').getPublicUrl(studentInfo[0].img_url)
    profile_url = data.publicUrl
  }

  const attendanceHistory = await localDB.select({
    is_time_out : class_attendance.is_time_out,
    date_time_stamp: class_attendance.created_date,
    time_in: class_attendance.time_in,
    time_out: class_attendance.time_out,
  }).from(class_attendance).where(
    and(
      eq(class_attendance.student_id, studentInfo[0].student_id), 
      eq(class_attendance.attendance_date, sql`DATE(${new Intl.DateTimeFormat('en-US').format(now)})`)
    )
  )

  if(latestAttendance.length <= 0) { // if no entries in the database
    const insertTimeIn = await localDB.insert(class_attendance).values({
      attendance_date: new Intl.DateTimeFormat('en-US').format(now),
      is_time_out: false,
      time_in_procedure: 'Scan',
      // created_by: user?.id as string,
      created_date: now,
      section_id: studentInfo[0].section_id,
      student_id: studentInfo[0].student_id,
      time_in: new Intl.DateTimeFormat('en-US', { timeStyle: 'medium' }).format(now),
      // updated_by: user?.id as string,
      updated_date: now,
    }).returning()

    const timeInData = {
      is_time_out: insertTimeIn[0].is_time_out, 
      time_in:  insertTimeIn[0].time_in, 
      date_time_stamp: insertTimeIn[0].created_date,
      time_out:  insertTimeIn[0].time_out
    }
    
    await onlineDB.insert(class_attendance).values(insertTimeIn)
    
    return {
      full_name : studentInfo[0].full_name,
      grade_level: studentInfo[0].grade_level,
      school_year:  studentInfo[0].school_year,
      section_name: studentInfo[0].section_name,
      profile_url: profile_url,
      history: [...attendanceHistory, timeInData]
    }
  }
  
  
  const time_out = !latestAttendance[0].is_time_out // toggle
  
  let addedAttendance : { is_time_out: boolean | null; time_in: string | null; time_out: string | null; date_time_stamp: Date | null; }  

  if(time_out) {
    const insertTimeOut = await localDB.insert(class_attendance).values({
      attendance_date: new Intl.DateTimeFormat('en-US').format(now),
      is_time_out: time_out,
      time_out_procedure: 'Scan',
      // created_by: user?.id as string,
      created_date: now,
      section_id: studentInfo[0].section_id,
      student_id: studentInfo[0].student_id,
      time_out:  new Intl.DateTimeFormat('en-US', { timeStyle: 'medium' }).format(now),
      // updated_by: user?.id as string,
      updated_date: now,
    }).returning()

    await onlineDB.insert(class_attendance).values(insertTimeOut) // insert to supabase
    
    addedAttendance = {
      is_time_out: insertTimeOut[0].is_time_out, 
      date_time_stamp: insertTimeOut[0].created_date,
      time_in: insertTimeOut[0].time_in, 
      time_out: insertTimeOut[0].time_out
    } 

  } else {
    
    const insertTimeIn = await localDB.insert(class_attendance).values({
      attendance_date: new Intl.DateTimeFormat('en-US').format(now),
      is_time_out: time_out,
      time_in_procedure: 'Scan',
      // created_by: user?.id as string,
      created_date: now,
      section_id: studentInfo[0].section_id,
      student_id: studentInfo[0].student_id,
      time_in:  new Intl.DateTimeFormat('en-US', { timeStyle: 'medium' }).format(now),
      // updated_by: user?.id as string,
      updated_date: now,
    }).returning()
    
    await onlineDB.insert(class_attendance).values(insertTimeIn)

    addedAttendance = {
      is_time_out: insertTimeIn[0].is_time_out, 
      date_time_stamp: insertTimeIn[0].created_date,
      time_in: insertTimeIn[0].time_in, 
      time_out: insertTimeIn[0].time_out
    }   
  }
  
  const temp = {
    full_name : studentInfo[0].full_name,
    grade_level: studentInfo[0].grade_level,
    section_name: studentInfo[0].section_name,
    school_year:  studentInfo[0].school_year,
    profile_url: profile_url,
    history: [...attendanceHistory, addedAttendance]
  }
  return temp
}