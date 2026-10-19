// src/components/SearchBox.tsx
import { TextInput, View } from "react-native";
import { useAppTheme } from "../providers/theme-provider";

interface SearchBoxProps {
  value: string;
  onCari: (teks: string) => void;
}

export default function SearchBox({ value, onCari }: SearchBoxProps) {
  const { colors } = useAppTheme();

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onCari}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
          borderRadius: 8,
          color: colors.text,
          backgroundColor: colors.surface,
        }}
      />
    </View>
  );
}
