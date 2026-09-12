export type Category = 'sub_junior' | 'junior' | 'senior' | 'super_senior' | 'general'
export type ProgramKind = 'individual' | 'group'
export type ProgramMode = 'on_stage' | 'off_stage'

export const CATEGORY_LABEL: Record<Category, string> = {
  sub_junior: 'Sub Junior',
  junior: 'Junior',
  senior: 'Senior',
  super_senior: 'Super Senior',
  general: 'General',
}

export const CATEGORIES: Category[] = ['sub_junior', 'junior', 'senior', 'super_senior', 'general']

export interface Team {
  id: string
  name: string
  color: string | null
  created_at: string
}

export interface Student {
  id: string
  name: string
  admission_no: string | null
  class: string | null
  category: Category
  team_id: string | null
  photo_url: string | null
  created_at: string
}

export interface Program {
  id: string
  name: string
  category: Category
  kind: ProgramKind
  mode: ProgramMode
  code: string | null
  created_at: string
}

export interface ProgramParticipant {
  id: string
  program_id: string
  student_id: string
  chest_no: string | null
  created_at: string
}

export interface Result {
  id: string
  program_id: string
  student_id: string | null
  team_id: string | null
  position: number | null
  grade: string | null
  points: number
  created_at: string
}

export interface ScheduleItem {
  id: string
  title: string
  program_id: string | null
  starts_at: string
  venue: string | null
  notes: string | null
  created_at: string
}

export interface GalleryImage {
  id: string
  url: string
  caption: string | null
  sort_order: number
  created_at: string
}

export interface SiteSettings {
  id: boolean
  fest_title: string
  tagline: string
  about: string | null
}
