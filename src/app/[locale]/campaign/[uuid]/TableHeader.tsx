interface TableHeaderProps {
  showReward?: boolean;
}

export default function TableHeader({ showReward = true }: TableHeaderProps) {
  return (
    <div className={`grid gap-2 font-cofo uppercase text-white ${
      showReward 
        ? "grid-cols-2 lg:grid-cols-3" 
        : "grid-cols-1 lg:grid-cols-2"
    }`}>
      <span className="lg:ml-6">
        USER<span className="lg:hidden"> / TRADING VOLUME</span>
      </span>
      <span className="hidden lg:block ml-6">TRADING VOLUME</span>
      {showReward && (
        <span className="justify-self-end lg:ml-6 lg:justify-self-start">
          REWARD
        </span>
      )}
    </div>
  );
}
