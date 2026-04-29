import { View, Text } from "react-native";
import { Image } from "expo-image";

const HERO_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB5HXQ5RN-nZI5EEQK_CHR4s92yuXMF6r3rFXq2nGAVYtUIFm9VEvQiLJa2P7E-bgksM2muB6g2u9h2MSWWIoQUeasXdF1DFY2ZRTygrEQxCzznM0ISk0JayHbMQfpPsiiWBi9Ciw8LTIHdfnfTvX4aPAVdLM0qFhbWaKDmqZ2YFoKXZ4Bd_cKiLbqqNvGzGG_INDEttUfDEUU8XRHarC_mqPy-QAoj5taMRiPTUs-7XIIKQdaZT7p_ymn7chNBOzyZB1Q3Qqljr_y0";

export function HeroImage() {
  return (
    <View
      style={{
        width: "100%",
        height: 192,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 32,
      }}
    >
      <Image
        source={{ uri: HERO_URI }}
        contentFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
      {/* bottom gradient overlay */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 24,
          backgroundColor: "rgba(63,48,36,0.75)",
        }}
      >
        <Text
          style={{
            color: "#EDE0C4",
            fontSize: 28,
            fontWeight: "600",
            lineHeight: 36,
          }}
        >
          Bem-vindo à Palavra
        </Text>
      </View>
    </View>
  );
}
