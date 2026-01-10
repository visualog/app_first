import { FeedContainer } from "@/components/feed/FeedContainer";
import { useLottoData } from "@/App";

export function HomeTab() {
  const { lottoData, history } = useLottoData();

  if (!lottoData) return <div className="p-10 text-center">Loading...</div>;

  const handleCardClick = (item: any) => {
    console.log("Card clicked:", item);
    // TODO: Implement Detail View Modal or Navigation
  };

  // Ensure we sort history by newest first if not already
  const sortedHistory = [...history].sort((a, b) => b.회차 - a.회차);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <FeedContainer history={sortedHistory} onCardClick={handleCardClick} />
    </div>
  );
}
