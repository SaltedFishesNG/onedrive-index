import { Fragment } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Menu, Transition } from '@headlessui/react'

import { useRouter } from 'next/router'
import Link from 'next/link'
import { useCookies, withCookies } from 'react-cookie'

// https://headlessui.dev/react/menu#integrating-with-next-js
const CustomLink = ({ href, children, as, locale, ...props }): JSX.Element => {
  return (
    <Link href={href} as={as} locale={locale} {...props}>
      {children}
    </Link>
  )
}