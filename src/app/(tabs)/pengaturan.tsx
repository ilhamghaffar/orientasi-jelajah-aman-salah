// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import { Alert, Button, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    useAppTheme,
    type ThemePreference,
} from "../../providers/theme-provider";
import { hapusSemuaCache } from "../../services/cacheRepository";

const PILIHAN_TEMA: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Terang" },
  { value: "dark", label: "Gelap" },
  { value: "system", label: "Ikuti Sistem" },
];

export default function TabPengaturan() {
  const { colors, preference, setThemePreference } = useAppTheme();
  const [pesan, setPesan] = useState<string | null>(null);

  async function hapusDataTersimpan() {
    try {
      await hapusSemuaCache();
      setPesan("Data cuaca tersimpan sudah dihapus.");
    } catch {
      setPesan("Data cuaca tersimpan gagal dihapus.");
    }
  }

  function konfirmasiHapusSemuaCache() {
    const hapus = () => void hapusDataTersimpan();
    if (Platform.OS === "web") {
      if (globalThis.confirm("Hapus seluruh cache cuaca dari perangkat?"))
        hapus();
      return;
    }

    Alert.alert("Hapus semua cache?", "Data cuaca tersimpan akan dihapus.", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: hapus },
    ]);
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
        gap: 24,
        backgroundColor: colors.background,
      }}
    >
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
          Tampilan
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Pilih tema yang nyaman digunakan.
        </Text>
        <View
          accessibilityRole="radiogroup"
          style={{
            flexDirection: "row",
            borderWidth: 1,
            borderColor: colors.border,
            marginTop: 8,
          }}
        >
          {PILIHAN_TEMA.map((pilihan) => {
            const aktif = preference === pilihan.value;
            return (
              <Pressable
                key={pilihan.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: aktif }}
                onPress={() => void setThemePreference(pilihan.value)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 6,
                  backgroundColor: aktif ? colors.accent : colors.background,
                  borderRightWidth: pilihan.value === "system" ? 0 : 1,
                  borderRightColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: aktif ? colors.background : colors.text,
                    fontWeight: aktif ? "700" : "400",
                    textAlign: "center",
                  }}
                >
                  {pilihan.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
          Data Tersimpan
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Hapus seluruh cache cuaca yang tersedia untuk penggunaan offline.
        </Text>
        <Button
          title="Hapus Semua Cache Cuaca"
          color={colors.danger}
          onPress={konfirmasiHapusSemuaCache}
        />
        {pesan && (
          <Text accessibilityLabel={pesan} style={{ color: colors.text }}>
            {pesan}
          </Text>
        )}
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
          Jelajah Aman
        </Text>
        <Text style={{ color: colors.textSecondary }}>Versi 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}
