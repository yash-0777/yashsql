import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setEvent(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Not found')
        setLoading(false)
      })
  }, [id])

  const onRegister = async () => {
    if (!user) return navigate('/login')
    const res = await fetch(`/api/events/${id}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (res.ok) setRegistered(true)
  }

  if (loading) return <div className="container">Loading…</div>
  if (error || !event) return <div className="container">{error || 'Error'}</div>

  const isOwner = user && event.createdBy === user.id

  return (
    <div className="container">
      <img className="banner-lg" src={event.bannerUrl} alt={event.title} />
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <div className="meta">
        <span>{event.date} {event.time}</span>
        <span>{event.location}</span>
        <span>{event.category || 'General'}</span>
        <span>{event.attendeesCount || 0} going</span>
      </div>
      <div className="actions">
        {isOwner ? (
          <>
            <Link to={`/events/${event.id}/edit`}>Edit</Link>
          </>
        ) : (
          <button onClick={onRegister} disabled={registered}>
            {registered ? 'Registered' : 'Register'}
          </button>
        )}
      </div>
    </div>
  )
}

