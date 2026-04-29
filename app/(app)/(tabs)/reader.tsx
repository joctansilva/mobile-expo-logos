import { Redirect } from "expo-router";
import { useLastPosition } from "@features/bible/hooks/useLastPosition";

export default function ReaderTab() {
  const { lastPosition } = useLastPosition();

  return (
    <Redirect
      href={`/(app)/reader?book=${lastPosition.book_id}&chapter=${lastPosition.chapter}`}
    />
  );
}
