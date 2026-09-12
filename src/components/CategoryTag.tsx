import type { Category } from '../lib/types'
import { CATEGORY_LABEL } from '../lib/types'

export function CategoryTag({ category }: { category: Category }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border"
      style={{ borderColor: 'var(--line)', color: 'var(--silver)' }}
    >
      <span className="chip rounded-full" style={{ background: `var(--cat-${category})`, width: 7, height: 7 }} />
      {CATEGORY_LABEL[category]}
    </span>
  )
}
