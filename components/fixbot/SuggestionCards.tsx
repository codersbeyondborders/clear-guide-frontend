export function SuggestionCards({ onSelect }: { onSelect: (text: string) => void }) {
  const suggestions = [
    "My Macbook Pro is running slow, how can I speed it up?",
    "Help me fix my ice maker on my fridge.",
    "My iPhone 14 pro max is not charging."
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 mb-6">
      <p className="text-sm font-semibold text-slate-700 mb-4 text-center">Not sure where to start? Try one of these</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(suggestion)}
            className="bg-white border border-slate-200 rounded-xl p-4 text-left text-sm text-slate-600 hover:border-emerald-300 hover:shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
