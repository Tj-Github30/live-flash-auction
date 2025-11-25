interface SecondaryNavProps {
  activeTab: 'buy' | 'sell' | 'my-bids';
  onTabChange: (tab: 'buy' | 'sell' | 'my-bids') => void;
}

export function SecondaryNav({ activeTab, onTabChange }: SecondaryNavProps) {
  const tabs = [
    { id: 'buy' as const, label: 'Buy' },
    { id: 'sell' as const, label: 'Sell' },
    { id: 'my-bids' as const, label: 'My Bids' },
  ];

  return (
    <div className="fixed top-[73px] left-0 right-0 z-40 bg-white border-b border-border">
      <div className="max-w-[1600px] mx-auto px-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 relative transition-colors ${
                activeTab === tab.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}