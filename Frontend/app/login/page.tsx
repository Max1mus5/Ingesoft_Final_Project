/**
 * The system implements the login page.
 * This page serves as the entry point for user authentication.
 */

import { LoginForm } from '@/components/login-form'
import { Toaster } from '@/components/ui/sonner'

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <Toaster position="top-right" />
    </>
  )
}
