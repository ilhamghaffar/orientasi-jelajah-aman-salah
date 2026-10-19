// src/components/AtribusiCuaca.tsx
import { Linking, Text, TouchableOpacity } from "react-native";
import { useAppTheme } from "../providers/theme-provider";

export default function AtribusiCuaca() {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      onPress={() => Linking.openURL("https://open-meteo.com/")}
    >
      <Text
        style={{
          fontSize: 11,
          color: colors.textSecondary,
          textAlign: "center",
        }}
      >
        Data cuaca disediakan oleh Open-Meteo.com
      </Text>
    </TouchableOpacity>
  );
}
