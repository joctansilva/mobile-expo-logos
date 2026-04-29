import { View, Text, TouchableOpacity, Share } from "react-native";
import { Highlighter, Share2, Copy, BookOpen, X } from "lucide-react-native";

interface Props {
  verseText: string;
  verseRef: string;
  bottomInset: number;
  onHighlight: () => void;
  onStrong: () => void;
  onClose: () => void;
}

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function ActionItem({ icon, label, onPress }: ActionItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ alignItems: "center", paddingHorizontal: 12, paddingVertical: 6 }}
    >
      {icon}
      <Text
        style={{
          color: "#EDE0C4",
          fontSize: 9,
          fontWeight: "700",
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginTop: 3,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Divider() {
  return (
    <View
      style={{
        width: 1,
        height: 32,
        backgroundColor: "rgba(212,175,55,0.2)",
        alignSelf: "center",
      }}
    />
  );
}

export function VerseActionBar({
  verseText,
  verseRef,
  bottomInset,
  onHighlight,
  onStrong,
  onClose,
}: Props) {
  const handleShare = async () => {
    await Share.share({ message: `"${verseText}" — ${verseRef}` });
    onClose();
  };

  const handleCopy = async () => {
    // expo-clipboard não instalado; usa Share como fallback
    await Share.share({ message: verseText });
    onClose();
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: bottomInset + 16,
        left: 16,
        right: 16,
        backgroundColor: "#3F3024",
        borderRadius: 99,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(212,175,55,0.3)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
        elevation: 12,
        paddingVertical: 4,
      }}
    >
      <ActionItem
        icon={<Highlighter color="#EDE0C4" size={16} />}
        label="Destacar"
        onPress={onHighlight}
      />
      <Divider />
      <ActionItem
        icon={<Copy color="#EDE0C4" size={16} />}
        label="Copiar"
        onPress={handleCopy}
      />
      <Divider />
      <ActionItem
        icon={<Share2 color="#EDE0C4" size={16} />}
        label="Compartilhar"
        onPress={handleShare}
      />
      <Divider />
      <ActionItem
        icon={<BookOpen color="#D4AF37" size={16} />}
        label="Strong"
        onPress={onStrong}
      />
      <Divider />
      <ActionItem
        icon={<X color="#8B7355" size={16} />}
        label="Fechar"
        onPress={onClose}
      />
    </View>
  );
}
