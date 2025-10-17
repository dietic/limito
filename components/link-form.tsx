'use client'
import { useState } from 'react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'

export interface LinkFormValues {
  destination_url: string
  fallback_url?: string
  mode: 'by_date' | 'by_clicks'
  expires_at?: string
  click_limit?: number
  slug?: string
}

interface LinkFormProps {
  onSubmit?: (values: LinkFormValues) => void
}

export default function LinkForm({ onSubmit }: LinkFormProps) {
  const [mode, setMode] = useState<'by_date' | 'by_clicks'>('by_date')
  const [values, setValues] = useState<LinkFormValues>({ destination_url: '', mode: 'by_date' })

  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault()
        if (onSubmit) onSubmit(values)
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Destination URL</label>
        <Input
          type="url"
          placeholder="https://example.com"
          value={values.destination_url}
          onChange={e => setValues(v => ({ ...v, destination_url: e.target.value }))}
          required
        />
      </div>
      <div className="flex gap-3">
        <Button type="button" variant={mode === 'by_date' ? 'primary' : 'ghost'} onClick={() => { setMode('by_date'); setValues(v => ({ ...v, mode: 'by_date' })) }}>By date</Button>
        <Button type="button" variant={mode === 'by_clicks' ? 'primary' : 'ghost'} onClick={() => { setMode('by_clicks'); setValues(v => ({ ...v, mode: 'by_clicks' })) }}>By clicks</Button>
      </div>
      {mode === 'by_date' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">Expires at</label>
          <Input
            type="datetime-local"
            onChange={e => setValues(v => ({ ...v, expires_at: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
            required
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">Click limit</label>
          <Input
            type="number"
            min={1}
            step={1}
            onChange={e => setValues(v => ({ ...v, click_limit: Number(e.target.value) }))}
            required
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Custom slug (optional)</label>
        <Input type="text" placeholder="my-offer" onChange={e => setValues(v => ({ ...v, slug: e.target.value }))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fallback URL (optional)</label>
        <Input type="url" placeholder="https://example.com/expired" onChange={e => setValues(v => ({ ...v, fallback_url: e.target.value }))} />
      </div>
      <div className="pt-2">
        <Button type="submit">Create link</Button>
      </div>
    </form>
  )
}

