import { localDB, onlineDB } from "../database/db"
import { class_attendance, enrolled_students, grade_levels, sections, students } from "../database/schema"

export function get_all_students() {
  return onlineDB.select().from(students)
}

export function get_all_class_attendance() {
  return onlineDB.select().from(class_attendance)
}

export function get_all_enrolled_students() {
  return onlineDB.select().from(enrolled_students)
}

export function get_all_grade_level() {
  return onlineDB.select().from(grade_levels)
}

export function get_all_sections() {
  return onlineDB.select().from(sections)
}

export async function init_local_data() {
  const t = await localDB.transaction(async (tx) => {
    const stu =  await get_all_students()
    const cls_attendance = await get_all_class_attendance()
    const en_students = await get_all_enrolled_students()
    const all_sections = await get_all_sections()
    const all_grade_level = await get_all_grade_level()
    try {
      await tx.insert(students).values(stu)
      await tx.insert(class_attendance).values(cls_attendance)
      await tx.insert(enrolled_students).values(en_students)
      await tx.insert(sections).values(all_sections)
      await tx.insert(grade_levels).values(all_grade_level)
      return true
    } catch (error) {
      console.log(error)
      tx.rollback()
      // console.log(error)
      return false
    }
  })
  return t
}