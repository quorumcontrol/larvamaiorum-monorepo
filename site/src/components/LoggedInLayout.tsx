import { Button, Spinner, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import { useAccount } from 'wagmi';
import { useUsername } from '../hooks/Player';
import useIsClientSide from '../hooks/useIsClientSide';
import { useLogin } from '../hooks/useUser';
import Layout from './Layout'

const LoggedInLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  const isClient = useIsClientSide();
  const { address } = useAccount()
  const { data:username, isLoading } = useUsername(address)
  const { isLoggedIn, login, isLoggingIn, readyToLogin } = useLogin()
  
  const loading = isLoading || isLoggingIn || !readyToLogin

  useEffect(() => {
    if (isClient && !loading && !username) {
      router.push('/')
    }
  }, [isClient, loading, username])

  if (!isClient || loading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    )
  }

  if (!isLoggedIn && readyToLogin) {
    return (
      <Layout>
        <Text>You must sign in</Text>
        <Button onClick={() => login()}>Login</Button>
      </Layout>
    )
  }

  return (
    <Layout>
      {children}
    </Layout>
  )
}

export default LoggedInLayout
