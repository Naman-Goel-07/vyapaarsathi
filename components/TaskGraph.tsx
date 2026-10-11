'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Circle, Clock, FileText, CheckCircle, ShieldCheck } from 'lucide-react'
import CollaborativePipeline from './CollaborativePipeline'

export interface TaskGraphProps {
  noticeId: string
  initialTasks?: any[]
  userRole?: string
  showPipeline?: boolean
  noticeStatus?: string
}

export default function TaskGraph({
  noticeId,
  initialTasks = [],
  userRole = 'owner',
  showPipeline = false,
  noticeStatus = 'open'
}: TaskGraphProps) {
  const [tasks, setTasks] = useState<any[]>(initialTasks)
  const supabase = createClient()

  useEffect(() => {
    // Fetch tasks if none provided initially
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('notice_id', noticeId)
        .order('created_at', { ascending: true })

      if (data) setTasks(data)
    }

    if (!initialTasks || initialTasks.length === 0) {
      fetchTasks()
    }

    // Subscribe to realtime updates for tasks related to this specific notice
    const channelName = `tasks-updates-${noticeId}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `notice_id=eq.${noticeId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => {
              if (prev.some((t) => t.id === payload.new.id)) return prev
              return [...prev, payload.new]
            })
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t))
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [noticeId, supabase, initialTasks])

  const toggleTaskStatus = async (task: any) => {
    // Only allow toggle if user role matches owner_role or if user is CA (CAs can override)
    if (userRole !== task.owner_role && userRole !== 'ca') {
      alert('You are not authorized to complete this specific task. Switch role to perform action.')
      return
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed'

    // Optimistic local update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    )

    try {
      await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    } catch (err) {
      console.error('Failed to update task status in database:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Optional Embedded Collaborative Pipeline */}
      {showPipeline && (
        <CollaborativePipeline
          noticeId={noticeId}
          initialNoticeStatus={noticeStatus}
          initialTasks={tasks}
          userRole={userRole}
        />
      )}

      {/* Task List / Timeline */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <FileText size={28} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm font-medium">No tasks logged in case file yet.</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Tasks are automatically generated when evidentiary records are requisitioned or filed.
            </p>
          </div>
        ) : (
          <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {tasks.map((task) => {
              const isCompleted = task.status === 'completed'

              return (
                <div
                  key={task.id}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-4"
                >
                  {/* Status Toggle Icon */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 cursor-pointer transition-transform hover:scale-105 ${
                      isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}
                    onClick={() => toggleTaskStatus(task)}
                    title={
                      isCompleted
                        ? 'Completed (click to mark pending)'
                        : 'Pending (click to mark completed)'
                    }
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="text-emerald-600" />
                    ) : (
                      <Circle size={20} className="text-blue-500" />
                    )}
                  </div>

                  {/* Task Card */}
                  <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-col gap-2 transition-shadow hover:shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-900 text-sm leading-snug">
                        {task.action}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                          task.owner_role === 'ca'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {task.owner_role === 'ca' ? 'CA Bench' : 'Owner Desk'}
                      </span>
                    </div>

                    {/* Requisitioned Documents List */}
                    {task.documents_requested && task.documents_requested.length > 0 && (
                      <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded text-xs text-blue-900">
                        <span className="font-mono font-bold block mb-1 text-[11px] uppercase tracking-wide">
                          Requisitioned Evidences ({task.documents_requested.length}):
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {task.documents_requested.map((doc: string, i: number) => (
                            <li key={i} className="text-blue-800">{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-[11px] text-gray-400 font-mono flex items-center justify-between pt-1 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {new Date(task.created_at).toLocaleDateString()}
                      </span>
                      <span
                        className={`font-semibold ${
                          isCompleted ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {isCompleted ? '● Completed' : '○ Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
