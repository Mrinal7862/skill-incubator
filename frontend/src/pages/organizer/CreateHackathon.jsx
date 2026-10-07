
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import {
  ArrowLeft,
  CalendarDays,
  Users,
  IndianRupee,
  Image as ImageIcon,
  Sparkles,
  Save,
  CircleAlert,
  CheckCircle2,
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
      {hint && <span className="mt-2 block text-xs leading-5 text-gray-500">{hint}</span>}
    </label>
  )
}

async function readError(response) {
  try {
    const body = await response.json()
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg).join(', ')
    }
  } catch {
    // Use fallback for non-JSON responses.
  }

  return `Request failed (${response.status}).`
}

export default function CreateHackathon() {
  const { getToken } = useAuth()
  const navigate = useNavigate()

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

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (Number(form.min_team_size) > Number(form.max_team_size)) {
      setError('Maximum team size must be greater than or equal to minimum team size.')
      return
    }

    const registrationStart = new Date(form.registration_start)
    const registrationEnd = new Date(form.registration_end)
    const eventStart = new Date(form.event_start)
    const eventEnd = new Date(form.event_end)

    if (
      registrationEnd <= registrationStart ||
      eventStart < registrationStart ||
      registrationEnd > eventStart ||
      eventEnd <= eventStart
    ) {
      setError(
        'Check your dates: registration must end after it starts and before the event starts. The event must end after it begins.',
      )
      return
    }

    setSaving(true)

    try {
      const token = await getToken()
      if (!token) throw new Error('Your login session could not be verified.')

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || '',
        image_url: form.image_url.trim() || '',
        min_team_size: Number(form.min_team_size),
        max_team_size: Number(form.max_team_size),
        registration_amount: Number(form.registration_amount),
        registration_start: registrationStart.toISOString(),
        registration_end: registrationEnd.toISOString(),
        event_start: eventStart.toISOString(),
        event_end: eventEnd.toISOString(),
      }

      const response = await fetch(`${API_BASE_URL}/hackathons`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(await readError(response))

      const created = await response.json()
      setSuccess('Hackathon saved as a draft. Redirecting to your events...')

      window.setTimeout(() => {
        navigate('/organizer/hackathons', {
          replace: true,
          state: { createdHackathonId: created.id },
        })
      }, 900)
    } catch (err) {
      setError(err.message || 'Could not create the hackathon.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen space-y-7 bg-[#09090f] text-white">
      <Link
        to="/organizer/hackathons"
        className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-cyan-300"
      >
        <ArrowLeft size={17} />
        Back to My Hackathons
      </Link>

      <header>
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
          <Sparkles size={15} />
          Organizer Workspace
        </div>
        <h1 className="si-glitch-title text-3xl font-black tracking-tight sm:text-4xl">
          Create <span className="text-cyan-300">Hackathon</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
          Set up your event details, define team limits, and choose the
          registration window. The event will initially be saved as a draft.
        </p>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-300/20 bg-rose-300/[0.05] p-4 text-sm text-rose-200">
          <CircleAlert size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-4 text-sm text-emerald-200">
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
              <p className="mt-1 text-xs text-gray-500">Introduce your event to participants.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Hackathon name">
                <input
                  required
                  minLength={3}
                  maxLength={255}
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="e.g. Campus Innovation Hackathon 2026"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Description" hint="Explain the goal, theme, and what participants should build.">
                <textarea
                  required
                  rows={5}
                  maxLength={5000}
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  placeholder="Tell students about the challenge..."
                  className={`${inputClass} resize-y`}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Banner image URL" hint="Optional. Use a publicly accessible image URL.">
                <input
                  type="url"
                  name="image_url"
                  value={form.image_url}
                  onChange={updateField}
                  placeholder="https://example.com/hackathon-banner.jpg"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#101019] p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-violet-300/10 text-violet-300">
              <Users size={20} />
            </div>
            <div>
              <h2 className="font-bold">Team and registration settings</h2>
              <p className="mt-1 text-xs text-gray-500">Set the team size and registration fee.</p>
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
                <IndianRupee size={17} className="absolute left-4 top-[26px] text-gray-500" />
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
              <h2 className="font-bold">Schedule</h2>
              <p className="mt-1 text-xs text-gray-500">Registration must close before the event starts.</p>
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
            to="/organizer/hackathons"
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
            {saving ? 'Saving...' : 'Save as draft'}
          </button>
        </div>
      </form>
    </main>
  )
}
