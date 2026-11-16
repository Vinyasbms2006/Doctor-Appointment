import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, FileText, RotateCcw, UploadCloud, X } from 'lucide-react'
import { analyzeReport } from '../services/labReportService'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png']

const STATUS_STYLE = {
  normal: 'bg-green-50 text-green-700',
  high: 'bg-red-50 text-red-700',
  low: 'bg-amber-50 text-amber-700',
}

const validate = (file) => {
  if (!ACCEPTED.includes(file.type)) return 'Please upload a PDF, JPG or PNG file.'
  if (file.size > MAX_BYTES) return 'This file is larger than 5 MB. Please upload a smaller file.'
  return ''
}

const LabReport = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | failed
  const [result, setResult] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) { setPreview(''); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const pick = useCallback((picked) => {
    if (!picked) return
    const problem = validate(picked)
    setError(problem)
    setResult(null)
    setStatus('idle')
    setFile(problem ? null : picked)
  }, [])

  const analyze = async () => {
    if (!file) return
    setStatus('loading')
    try {
      setResult(await analyzeReport(file))
      setStatus('done')
    } catch {
      setStatus('failed')
    }
  }

  const reset = () => { setFile(null); setResult(null); setStatus('idle'); setError('') }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className='mx-auto max-w-3xl pb-16'>
      <h1 className='text-3xl font-medium text-gray-900'>AI lab report analysis</h1>
      <p className='mt-2 text-sm text-gray-600'>Upload a lab report to get a plain-language summary. This is a demo: your file stays in your browser and nothing is uploaded.</p>

      {status !== 'done' && (
        <div className='mt-6'>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]) }}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed bg-white px-6 py-12 text-center transition-colors ${dragging ? 'border-primary bg-indigo-50' : 'border-gray-300'}`}
          >
            <UploadCloud size={36} className='text-primary' />
            <p className='text-sm text-gray-700'>Drag and drop your report here, or</p>
            <button type='button' onClick={() => inputRef.current?.click()} className='rounded-full bg-primary px-6 py-2 text-sm text-white'>Choose file</button>
            <p className='text-xs text-gray-500'>PDF, JPG or PNG, up to 5 MB</p>
            <input ref={inputRef} type='file' accept='.pdf,.jpg,.jpeg,.png' className='hidden' aria-label='Upload lab report' onChange={(e) => { pick(e.target.files[0]); e.target.value = '' }} />
          </div>

          <p className='mt-2 min-h-5 text-sm text-red-600' role='alert'>{error}</p>

          {file && (
            <div className='mt-2 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3'>
              <div className='flex min-w-0 items-center gap-3'>
                {preview ? <img src={preview} alt='Report preview' className='h-14 w-14 rounded-lg object-cover' /> : <FileText size={32} className='shrink-0 text-gray-400' />}
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium text-gray-800'>{file.name}</p>
                  <p className='text-xs text-gray-500'>{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button type='button' aria-label='Remove file' onClick={reset} className='rounded p-1 text-gray-500 hover:bg-gray-100'><X size={18} /></button>
            </div>
          )}

          <button type='button' onClick={analyze} disabled={!file || status === 'loading'} className='mt-4 w-full rounded-full bg-primary py-3 text-white disabled:opacity-50'>
            {status === 'loading' ? 'Analyzing report…' : 'Analyze report'}
          </button>

          {status === 'failed' && (
            <div className='mt-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700' role='alert'>
              <p>We could not analyze this report. Please try again.</p>
              <button type='button' onClick={analyze} className='flex items-center gap-1 font-medium underline'><RotateCcw size={14} /> Try again</button>
            </div>
          )}

          {status === 'loading' && (
            <div className='mt-6 space-y-3' aria-busy='true' aria-label='Analyzing report'>
              <div className='h-20 animate-pulse rounded-xl bg-gray-200 motion-reduce:animate-none' />
              {[0, 1, 2, 3].map((i) => <div key={i} className='h-10 animate-pulse rounded-lg bg-gray-100 motion-reduce:animate-none' />)}
            </div>
          )}
        </div>
      )}

      {status === 'done' && result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className='mt-6 space-y-6'>
          <div className='rounded-2xl border border-blue-200 bg-white p-6'>
            <p className='text-xs uppercase tracking-wide text-gray-500'>Summary for {result.fileName}</p>
            <p className='mt-2 text-gray-800'>{result.summary}</p>
          </div>

          <div className='overflow-x-auto rounded-2xl border border-gray-200 bg-white'>
            <table className='w-full min-w-[480px] text-left text-sm'>
              <thead className='bg-gray-50 text-gray-600'>
                <tr><th className='px-4 py-3 font-medium'>Test</th><th className='px-4 py-3 font-medium'>Your value</th><th className='px-4 py-3 font-medium'>Reference range</th><th className='px-4 py-3 font-medium'>Result</th></tr>
              </thead>
              <tbody>
                {result.values.map((row) => (
                  <tr key={row.name} className='border-t border-gray-100'>
                    <td className='px-4 py-3 font-medium text-gray-800'>{row.name}</td>
                    <td className='px-4 py-3'>{row.value}</td>
                    <td className='px-4 py-3 text-gray-500'>{row.range}</td>
                    <td className='px-4 py-3'><span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLE[row.status]}`}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='rounded-2xl border border-gray-200 bg-white p-6'>
            <h2 className='font-medium text-gray-900'>What this may mean</h2>
            <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700'>
              {result.insights.map((text) => <li key={text}>{text}</li>)}
            </ul>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <Link to={`/doctors/${result.suggestedSpeciality}`} className='rounded-full bg-primary px-6 py-3 text-sm text-white'>Consult a {result.suggestedSpeciality}</Link>
            <button type='button' onClick={reset} className='rounded-full border border-gray-300 px-6 py-3 text-sm text-gray-700'>Analyze another report</button>
          </div>
        </motion.div>
      )}

      <p className='mt-8 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-xs text-amber-800'>
        <AlertTriangle size={16} className='mt-0.5 shrink-0' />
        This tool provides general information only and is not medical advice. Always discuss your results with a qualified doctor.
      </p>
    </motion.div>
  )
}

export default LabReport
