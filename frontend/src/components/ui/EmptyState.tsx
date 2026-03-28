interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <span className="text-4xl">{icon}</span>
      <p className="text-gray-300 font-medium">{title}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
