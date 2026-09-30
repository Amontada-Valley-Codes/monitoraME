import { UploadCloud, File, Trash2, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { Badge } from '@/components/ui/badge'

interface FileUploadCardProps {
  title: string
  description: string
  required?: boolean
  status: 'missing' | 'selected' | 'uploaded' | 'invalid'
  fileName?: string
  errorReason?: string
  onFileSelect: (file: File) => void
  onRemove: () => void
}

export function FileUploadCard({ title, description, required, status, fileName, errorReason, onFileSelect, onRemove }: FileUploadCardProps) {
  return (
    <div data-slot="file-upload-card" className="border border-border rounded-lg p-5 bg-surface-raised flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            {title} {required && <span className="text-destructive">*</span>}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        {status === 'invalid' && <Badge variant="destructive">Inválido</Badge>}
        {status === 'uploaded' && <Badge variant="default">Enviado</Badge>}
      </div>

      {status === 'missing' && (
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-input rounded-lg cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-ring">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-primary">Clique para anexar</span> ou arraste</p>
          </div>
          <input type="file" className="hidden" accept=".pdf,.png,.jpg" onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])} />
        </label>
      )}

      {(status === 'selected' || status === 'uploaded' || status === 'invalid') && (
        <div className={`flex items-center justify-between p-3 rounded-md border ${status === 'invalid' ? 'border-destructive bg-destructive/10' : 'border-input bg-surface'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {status === 'invalid' ? <AlertCircle className="w-5 h-5 text-destructive shrink-0" /> : <File className="w-5 h-5 text-primary shrink-0" />}
            <span className="text-sm text-foreground truncate">{fileName}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" aria-label="Remover arquivo" onClick={onRemove}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        </div>
      )}
      
      {status === 'invalid' && errorReason && (
        <p className="text-xs text-destructive mt-1">{errorReason}</p>
      )}
    </div>
  )
}