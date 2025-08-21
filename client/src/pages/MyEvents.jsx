import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function MyEvents() {
  const { token } = useAuth()
  const [created, setCreated] = useState([])

  useEffect(() => {
    fetch('/api/me/created-events', { headers: { 'Authorization': `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setCreated)
  }, [token])

  return (
    <div className="container">
      <h2>My Events</h2>
      <div className="grid">
        {created.map((e) => (
          <div key={e.id} className="card event-card">
            <img src={e.bannerUrl} className="banner" />
            <h3>{e.title}</h3>
            <p>{e.date} {e.time}</p>
            <Link to={`/events/${e.id}/edit`}>Edit</Link>
          </div>
        ))}
      </div>
    </div>
  )
}

