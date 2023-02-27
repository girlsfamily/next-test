import { forwardRef, ComponentPropsWithoutRef } from 'react'
import { IoLanguageOutline } from 'react-icons/io5'

interface IconProps extends ComponentPropsWithoutRef<'span'> {
  className: string
}

const LangIcon = forwardRef<HTMLSpanElement, IconProps>(
  ({ className, ...others }: IconProps, ref) => (
    <span style={{display: 'flex'}} ref={ref} {...others}>
      <IoLanguageOutline className={className} />
    </span>
  )
)
LangIcon.displayName = 'LangIcon'

export default LangIcon