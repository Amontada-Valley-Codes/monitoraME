import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, Play, Trash2, Edit3 } from "lucide-react";
import { SavedSearchEntity } from "../domain/types";

interface Props {
  search: SavedSearchEntity;
  isEditing: boolean;
  newName: string;
  onNewNameChange: (val: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onExecute: () => void;
}

export function SavedSearchCard({ search, isEditing, newName, onNewNameChange, onStartEdit, onSaveEdit, onDelete, onExecute }: Props) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input value={newName} onChange={(e) => onNewNameChange(e.target.value)} className="h-7 text-xs" />
                <Button size="sm" className="h-7 text-xs" onClick={onSaveEdit}>Salvar</Button>
              </div>
            ) : (
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-600" />
                {search.name}
              </CardTitle>
            )}
            <span className="text-xs text-muted-foreground">Criado em {search.createdAt}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {search.filters?.query && <Badge variant="secondary" className="text-xs">Termo: {search.filters.query}</Badge>}
          {search.filters?.municipalities?.map((m) => <Badge key={m} variant="outline" className="text-xs">Município: {m}</Badge>)}
          {search.filters?.cnaes?.map((c) => <Badge key={c} variant="outline" className="text-xs font-mono">CNAE: {c}</Badge>)}
          {search.filters?.modalities?.map((mod) => <Badge key={mod} variant="outline" className="text-xs">{mod}</Badge>)}
          {search.filters?.minValue && <Badge variant="outline" className="text-xs">Mín: R$ {search.filters.minValue}</Badge>}
          {search.filters?.maxValue && <Badge variant="outline" className="text-xs">Máx: R$ {search.filters.maxValue}</Badge>}
        </div>

        <div className="flex items-center justify-between pt-2 border-t text-xs">
          <Button variant="outline" size="sm" className="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={onExecute}>
            <Play className="w-3 h-3 mr-1" /> Executar Filtros
          </Button>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={onStartEdit}>
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
