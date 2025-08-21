import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function EventCard({ event }) {
  return (
    <div className="card event-card">
      <img src={event.bannerUrl} alt={event.title} className="banner" />
      <h3>{event.title}</h3>
      <p>{event.description.slice(0, 120)}{event.description.length > 120 ? '…' : ''}</p>
      <div className="meta">
        <span>{event.date} {event.time}</span>
        <span>{event.location}</span>
        <span>{event.category || 'General'}</span>
      </div>
      <Link to={`/events/${event.id}`}>View</Link>
    </div>
  )
}

export default function Home() {
  const [events, setEvents] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('All')
  const [range, setRange] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category && category !== 'All') params.set('category', category)
    if (range) params.set('range', range)
    fetch(`/api/events?${params.toString()}`)
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => setEvents([]))
  }, [q, category, range])

  return (
    <div className="container">
      <h2>Discover Events</h2>
      <div className="filters">
        <input placeholder="Search by title" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All</option>
          <option>Tech</option>
          <option>Music</option>
          <option>Art</option>
          <option>General</option>
        </select>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="">Any Time</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
        </select>
      </div>
      <div className="grid">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  )
}

