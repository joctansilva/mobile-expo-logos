import { View, Text, TouchableOpacity } from "react-native";
import { BookText, BookOpen, PenLine } from "lucide-react-native";

export function StudyToolsGrid() {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: "#8B7355",
          letterSpacing: 2,
          marginBottom: 12,
        }}
      >
        FERRAMENTAS DE ESTUDO
      </Text>

      <View style={{ gap: 16 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            backgroundColor: "#1B3A5C",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <View>
            <Text style={{ fontSize: 12, color: "rgba(237,224,196,0.7)", marginBottom: 4 }}>
              Aprofundamento
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "500", color: "#EDE0C4" }}>
              Estudo de Palavras Gregas
            </Text>
          </View>
          <BookText color="#EDE0C4" size={36} />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              flex: 1,
              backgroundColor: "#8B4513",
              borderRadius: 16,
              padding: 16,
              height: 128,
              justifyContent: "space-between",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <BookOpen color="#EDE0C4" size={22} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#EDE0C4" }}>
              Gramática Hebraica
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              flex: 1,
              backgroundColor: "#EDE0C4",
              borderWidth: 1,
              borderColor: "#E2D4B5",
              borderRadius: 16,
              padding: 16,
              height: 128,
              justifyContent: "space-between",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <PenLine color="#D4AF37" size={22} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#3F3024" }}>
              Diário de Estudo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
