export async function uploadFile(file: File, type: 'cv' | 'headshot' | 'video'): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  const data: any = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data
}
