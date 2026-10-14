'use client'
/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect -- dnd-kit exposes ref-backed sortable bindings during render; mounted gates the body portal. */

import * as React from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type Columns<T> = Record<string, T[]>

type KanbanContextValue<T> = {
  columns: Columns<T>
  getItemValue: (item: T) => string
  activeId: UniqueIdentifier | null
}

const KanbanContext = createContext<KanbanContextValue<unknown> | null>(null)
const ItemHandleContext = createContext<ReturnType<typeof useSortable>['listeners']>(undefined)
const ColumnHandleContext = createContext<ReturnType<typeof useSortable>['listeners']>(undefined)

export type KanbanProps<T> = React.ComponentProps<'div'> & {
  value: Columns<T>
  onValueChange: (value: Columns<T>) => void
  getItemValue: (item: T) => string
}

export function Kanban<T>({ value, onValueChange, getItemValue, children, className, ...props }: KanbanProps<T>) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function findColumn(id: UniqueIdentifier) {
    const itemId = String(id)
    if (itemId in value) return itemId
    return Object.keys(value).find((column) => value[column].some((item) => getItemValue(item) === itemId))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    if (!event.over) return

    const activeColumn = findColumn(event.active.id)
    const overColumn = findColumn(event.over.id)
    if (!activeColumn || !overColumn) return

    if (event.active.id in value && event.over.id in value) {
      const keys = Object.keys(value)
      const reordered = arrayMove(keys, keys.indexOf(String(event.active.id)), keys.indexOf(String(event.over.id)))
      onValueChange(Object.fromEntries(reordered.map((key) => [key, value[key]])))
      return
    }

    const activeIndex = value[activeColumn].findIndex((item) => getItemValue(item) === event.active.id)
    const overIndex = event.over.id in value
      ? value[overColumn].length
      : value[overColumn].findIndex((item) => getItemValue(item) === event.over?.id)

    if (activeColumn === overColumn) {
      if (activeIndex !== overIndex) {
        onValueChange({ ...value, [activeColumn]: arrayMove(value[activeColumn], activeIndex, overIndex) })
      }
      return
    }

    const source = [...value[activeColumn]]
    const target = [...value[overColumn]]
    const [item] = source.splice(activeIndex, 1)
    target.splice(overIndex < 0 ? target.length : overIndex, 0, item)
    onValueChange({ ...value, [activeColumn]: source, [overColumn]: target })
  }

  const context = useMemo<KanbanContextValue<T>>(
    () => ({ columns: value, getItemValue, activeId }),
    [activeId, getItemValue, value],
  )

  return (
    <KanbanContext.Provider value={context as KanbanContextValue<unknown>}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <div data-slot="kanban" className={cn(className)} {...props}>{children}</div>
      </DndContext>
    </KanbanContext.Provider>
  )
}

export function KanbanBoard({ className, ...props }: React.ComponentProps<'div'>) {
  const context = useContext(KanbanContext)
  return (
    <SortableContext items={Object.keys(context?.columns ?? {})}>
      <div data-slot="kanban-board" className={cn('grid gap-4 sm:grid-cols-3', className)} {...props} />
    </SortableContext>
  )
}

export function KanbanColumn({ value, className, ...props }: React.ComponentProps<'div'> & { value: string }) {
  const sortable = useSortable({ id: value })
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition } as CSSProperties
  return (
    <ColumnHandleContext.Provider value={sortable.listeners}>
      <div ref={sortable.setNodeRef} style={style} {...sortable.attributes} data-slot="kanban-column" className={cn(sortable.isDragging && 'opacity-50', className)} {...props} />
    </ColumnHandleContext.Provider>
  )
}

export function KanbanColumnHandle({ children, ...props }: React.ComponentProps<'div'>) {
  const listeners = useContext(ColumnHandleContext)
  return <div {...listeners} {...props}>{children}</div>
}

export function KanbanColumnContent({ value, ...props }: React.ComponentProps<'div'> & { value: string }) {
  const context = useContext(KanbanContext)
  const ids = context ? (context.columns[value] ?? []).map((item) => context.getItemValue(item)) : []
  return <SortableContext items={ids} strategy={verticalListSortingStrategy}><div data-slot="kanban-column-content" {...props} /></SortableContext>
}

export function KanbanItem({ value, className, ...props }: React.ComponentProps<'div'> & { value: string }) {
  const sortable = useSortable({ id: value })
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition } as CSSProperties
  return (
    <ItemHandleContext.Provider value={sortable.listeners}>
      <div ref={sortable.setNodeRef} style={style} {...sortable.attributes} data-slot="kanban-item" className={cn(sortable.isDragging && 'opacity-40', className)} {...props} />
    </ItemHandleContext.Provider>
  )
}

export function KanbanItemHandle({ children, className, ...props }: React.ComponentProps<'div'>) {
  const listeners = useContext(ItemHandleContext)
  return <div {...listeners} className={cn('cursor-grab active:cursor-grabbing', className)} {...props}>{children}</div>
}

export function KanbanOverlay({ children, ...props }: Omit<React.ComponentProps<typeof DragOverlay>, 'children'> & {
  children?: ReactNode | ((params: { value: UniqueIdentifier; variant: 'column' | 'item' }) => ReactNode)
}) {
  const context = useContext(KanbanContext)
  const [mounted, setMounted] = useState(false)
  useLayoutEffect(() => setMounted(true), [])
  if (!mounted) return null
  const activeId = context?.activeId ?? null
  const variant = activeId && String(activeId) in (context?.columns ?? {}) ? 'column' : 'item'
  let content: ReactNode = null
  if (activeId && typeof children === 'function') content = children({ value: activeId, variant })
  else if (typeof children !== 'function') content = children
  return createPortal(<DragOverlay {...props}>{content}</DragOverlay>, document.body)
}
