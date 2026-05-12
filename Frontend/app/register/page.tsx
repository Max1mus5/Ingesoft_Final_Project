/**
 * The system implements the registration page.
 * This page serves as the entry point for new user registration.
 */

import { RegisterForm } from '@/components/register-form'
import { Toaster } from '@/components/ui/sonner'

export default function RegisterPage() {
  return (
    <>
      <RegisterForm />
      <Toaster position="top-right" />
    </>
  )
}