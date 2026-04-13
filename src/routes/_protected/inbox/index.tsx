import { createFileRoute, Link } from '@tanstack/react-router'
import { MessageSquare } from 'lucide-react'

export const Route = createFileRoute('/_protected/inbox/')({
  component: InboxIndex,
})

function InboxIndex() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-stone-50/50">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-stone-400" />
      </div>
      <p className="font-semibold text-stone-700 text-lg mb-1">
        Select a conversation
      </p>
      <p className="text-stone-500 text-sm max-w-xs mb-4">
        Choose a conversation from the list or start a new one by messaging a
        creator
      </p>
      <Link
        to="/creators"
        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
      >
        Browse Creators
      </Link>
    </div>
  )
}
