import { useAuth } from '@/components/providers/AuthProvider'

export const useCurrentDoctor = () => {
  const { user } = useAuth()
  return user
}


