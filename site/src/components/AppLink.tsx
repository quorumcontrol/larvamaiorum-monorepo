import { LinkProps, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

const AppLink:React.FC<LinkProps> = (userProps) => {
  const { href, children, ...linkProps } = userProps
  return (
    <NextLink passHref href={href || ''}>
      <Link {...linkProps}>
        { children }
      </Link>
    </NextLink>
  )
}

export default AppLink
