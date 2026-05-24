import { Link } from "@tanstack/react-router"
import supabase from "../../lib/supabase_client"
import useGetProfile from "../auth/hooks/useGetProfile"

export default function Navbar() {
  const profile = useGetProfile()

  console.log("Navbar profile", profile)

  return (
    <nav>
      <Link to='/'>Home</Link>
      {!profile && (
        <>
          <Link to='/login'>Login</Link>
          <Link to='/signup'>Signup</Link>
        </>
      )}

      {profile && (
        <>
          <Link to='/games' search={{ page: 1, page_size: 20 }}>
            Games
          </Link>
          <Link to="/profile/$id" params={{ id: profile.id }}>Profile</Link>
          <button onClick={() => supabase.auth.signOut()}>Logout</button>
        </>
      )}
    </nav>
  )
}
