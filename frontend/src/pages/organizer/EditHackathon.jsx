
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import {
  ArrowLeft,
  Save,
  CalendarDays,
  Users,
  Image as ImageIcon,
  IndianRupee,
  RefreshCw,
  CircleAlert,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
).replace(/\/+$/, '')

const inputClass =
  'mt-2 w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10'

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      {children}
      {hint && (
        <span className="mt-2 block text-xs leading-5 text-gray-500">
          {hint}
        </span>
      )}
    </label>
  )
}

function toLocalDateTime(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 16)
}

async function readError(response) {
  try {
    const body = await response.json()

    if (typeof body.detail === 'string') return body.detail

    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg).join(', ')
    }
  } catch {
    // Handle non-JSON error responses below.
  }

  return `Request failed (${response.status}).`
}

export default function EditHackathon() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const [form, setForm] = useState({
    name: '',
    description: '',
    image_url: '',
    min_team_size: '1',
    max_team_size: '4',
    registration_amount: '0',
    registration_start: '',
    registration_end: '',
    event_start: '',
    event_end: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadHackathon = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Your login session could not be verified.')
      }

      const response = await fetch(
        `${API_BASE_URL}/hackathons/${encodeURIComponent(id)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(await readError(response))
      }

      const data = await response.json()

      setForm({
        name: data.name || '',
        description: data.description || '',
        image_url: data.image_url || '',
        min_team_size: String(data.min_team_size ?? 1),
        max_team_size: String(data.max_team_size ?? 4),
        registration_amount: String(data.registration_amount ?? 0),
        registration_start: toLocalDateTime(data.registration_start),
        registration_end: toLocalDateTime(data.registration_end),
        event_start: toLocalDateTime(data.event_start),
        event_end: toLocalDateTime(data.event_end),
      })
    } catch (err) {
      setError(err.message || 'Could not load this hackathon.')
    } finally {
      setLoading(false)
    }
  }, [getToken, id])

  useEffect(() => {
    loadHackathon()
  }, [loadHackathon])

  function updateField(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (Number(form.min_team_size) > Number(form.max_team_size)) {
      setError('Maximum team size cannot be smaller than minimum team size.')
      return
    }

    const dates = {
      registration_start: new Date(form.registration_start),
      registration_end: new Date(form.registration_end),
      event_start: new Date(form.event_start),
      event_end: new Date(form.event_end),
    }

    if (Object.values(dates).some((date) => Number.isNaN(date.getTime()))) {
      setError('Please enter valid dates for all schedule fields.')
      return
    }

    if (
      dates.registration_end <= dates.registration_start ||
      dates.event_start < dates.registration_start ||
      dates.registration_end > dates.event_start ||
      dates.event_end <= dates.event_start
    ) {
      setError(
        'Check the schedule: registration must close after it opens and no later than the event start. The event must end after it starts.',
      )
      return
    }

    if (Number(form.registration_amount) < 0) {
      setError('Registration fee cannot be negative.')
      return
    }

    setSaving(true)

    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Your login session could not be verified.')
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim(),
        min_team_size: Number(form.min_team_size),
        max_team_size: Number(form.max_team_size),
        registration_amount: Number(form.registration_amount),
        registration_start: dates.registration_start.toISOString(),
        registration_end: dates.registration_end.toISOString(),
        event_start: dates.event_start.toISOString(),
        event_end: dates.event_end.toISOString(),
      }

      const response = await fetch(
        `${API_BASE_URL}/hackathons/${encodeURIComponent(id)}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        throw new Error(await readError(response))
      }

      setSuccess('Hackathon details saved successfully.')

      window.setTimeout(() => {
        navigate(`/organizer/hackathons/${id}/manage`, { replace: true })
      }, 700)
    } catch (err) {
      setError(err.message || 'Could not save hackathon changes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-gray-300">
        <div className="text-center">
          <RefreshCw size={26} className="mx-auto animate-spin text-cyan-300" />
          <p className="mt-4 text-sm">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error && !form.name) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-rose-300/20 bg-[#101019] p-6 text-white">
        <CircleAlert size={24} className="text-rose-300" />
        <h1 className="mt-4 text-xl font-bold">Unable to edit hackathon</h1>
        <p className="mt-2 text-sm leading-6 text-gray-400">{error}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadHackathon}
            className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-[#09090f]"
          >
            Try again
          </button>
          <Link
            to="/organizer/hackathons"
            className="rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300"
          >
            Back to hackathons
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen space-y-7 bg-[#09090f] text-white">
      <Link
        to={`/organizer/hackathons/${id}/manage`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-cyan-300"
      >
        <ArrowLeft size={17} />
        Back to event management
      </Link>

      <header>
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
          <Sparkles size={15} />
          Organizer Workspace
        </div>

        <h1 className="si-glitch-title text-3xl font-black tracking-tight sm:text-4xl">
          Edit <span className="text-cyan-300">Hackathon.</span>
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          Update event details, team limits, registration fees, and schedule.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-300/20 bg-rose-300/[0.05] p-4 text-sm text-rose-200"
        >
          <CircleAlert size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-4 text-sm text-emerald-200"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-[#101019] p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 className="font-bold">Basic information</h2>
              <p className="mt-1 text-xs text-gray-500">
                Update your event title, description, and banner.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <Field label="Hackathon name">
              <input
                required
                minLength={3}
                maxLength={255}
                name="name"
                value={form.name}
                onChange={updateField}
                className={inputClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={5}
                maxLength={5000}
                name="description"
                value={form.description}
                onChange={updateField}
                placeholder="Describe the event and challenge..."
                className={`${inputClass} resize-y`}
              />
            </Field>

            <Field label="Banner image URL" hint="Optional; use a publicly accessible URL.">
              <input
                type="url"
                name="image_url"
                value={form.image_url}
                onChange={updateField}
                placeholder="https://example.com/banner.jpg"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#101019] p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-violet-300/10 text-violet-300">
              <Users size={20} />
            </div>
            <div>
              <h2 className="font-bold">Team and fee settings</h2>
              <p className="mt-1 text-xs text-gray-500">
                Define participation limits and entry fees.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Minimum team size">
              <input
                required
                type="number"
                min="1"
                max="100"
                name="min_team_size"
                value={form.min_team_size}
                onChange={updateField}
                className={inputClass}
              />
            </Field>

            <Field label="Maximum team size">
              <input
                required
                type="number"
                min="1"
                max="100"
                name="max_team_size"
                value={form.max_team_size}
                onChange={updateField}
                className={inputClass}
              />
            </Field>

            <Field label="Registration fee (INR)">
              <div className="relative">
                <IndianRupee
                  size={17}
                  className="absolute left-4 top-[26px] text-gray-500"
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  name="registration_amount"
                  value={form.registration_amount}
                  onChange={updateField}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#101019] p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 className="font-bold">Event schedule</h2>
              <p className="mt-1 text-xs text-gray-500">
                Confirm the registration window and event dates.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Registration opens">
              <input
                required
                type="datetime-local"
                name="registration_start"
                value={form.registration_start}
                onChange={updateField}
                className={inputClass}
              />
            </Field>

            <Field label="Registration closes">
              <input
                required
                type="datetime-local"
                name="registration_end"
                value={form.registration_end}
                onChange={updateField}
                className={inputClass}
              />
            </Field>

            <Field label="Event starts">
              <input
                required
                type="datetime-local"
                name="event_start"
                value={form.event_start}
                onChange={updateField}
                className={inputClass}
              />
            </Field>

            <Field label="Event ends">
              <input
                required
                type="datetime-local"
                name="event_end"
                value={form.event_end}
                onChange={updateField}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-white/[0.07] pt-5 sm:flex-row">
          <Link
            to={`/organizer/hackathons/${id}/manage`}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-3 text-sm font-bold text-[#09090f] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? 'Saving changes...' : 'Save changes'}
          </button>
        </div>
      </form>
    </main>
  )
}
