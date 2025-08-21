import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function CreateEvent() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', location: '', category: 'General', banner: null })
  const [error, setError] = useState('')

  const onChange = (e) => {
    const { name, value, files } = e.target
    if (files) setForm((f) => ({ ...f, [name]: files[0] }))
    else setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const body = new FormData()
    Object.entries({ ...form, banner: undefined }).forEach(([k, v]) => body.append(k, v))
    if (form.banner) body.append('banner', form.banner)
    const res = await fetch('/api/events', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body })
    if (res.ok) {
      const data = await res.json()
      navigate(`/events/${data.id}`)
    } else {
      const data = await res.json().catch(() => null)
      setError(data?.message || 'Failed to create')
    }
  }

  return (
    <div className="container">
      <h2>Create Event</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={onSubmit} className="form">
        <input name="title" placeholder="Title" value={form.title} onChange={onChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={onChange} required />
        <div className="row">
          <input name="date" type="date" value={form.date} onChange={onChange} required />
          <input name="time" type="time" value={form.time} onChange={onChange} required />
        </div>
        <input name="location" placeholder="Location" value={form.location} onChange={onChange} required />
        <select name="category" value={form.category} onChange={onChange}>
          <option>General</option>
          <option>Tech</option>
          <option>Music</option>
          <option>Art</option>
        </select>
        <input name="banner" type="file" accept="image/*" onChange={onChange} required />
        <button type="submit">Create</button>
      </form>
    </div>
  )
}

