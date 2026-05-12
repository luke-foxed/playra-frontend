import { useState } from 'react'
import supabase from './lib/supabase_client'
import AuthProvider from './providers/auth_provider'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.error('Error creating user:', error)
    }
    setLoading(false)
  }

  // Show login form
  return (
    <AuthProvider>
      <div>
        <h1>Playra</h1>
        <p>Sign Up</p>
        <form onSubmit={handleCreateUser}>
          <input
            type='email'
            placeholder='Your email'
            value={email}
            required={true}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type='password'
            placeholder='Your password'
            value={password}
            required={true}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button disabled={loading}>{loading ? <span>Loading</span> : <span>Sign Up</span>}</button>
        </form>
      </div>
    </AuthProvider>
  )
}