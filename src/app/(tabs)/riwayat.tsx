// src/app/(tabs)/riwayat.tsx
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../providers/theme-provider";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { bacaRiwayatKota } from "../../services/searchHistory";
import type { KotaFavorit } from "../../types/favorit";
import type { HasilGeocoding } from "../../types/geocoding";

export default function TabRiwayat() {
  const { colors } = useAppTheme();
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [riwayatPencarian, setRiwayatPencarian] = useState<HasilGeocoding[]>(
    [],
  );

  useFocusEffect(
    useCallback(() => {
      let masihAktif = true;
      void Promise.all([ambilSemuaFavorit(), bacaRiwayatKota()])
        .then(([favorit, riwayat]) => {
          if (masihAktif) {
            setDaftarFavorit(favorit);
            setRiwayatPencarian(riwayat);
          }
        })
        .catch((error) => console.error("Gagal memuat riwayat:", error));

      return () => {
        masihAktif = false;
      };
    }, []),
  );

  async function hapusFavoritTersimpan(id: number) {
    try {
      await hapusFavorit(id);
      setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
    } catch (error) {
      console.error("Gagal menghapus favorit:", error);
    }
  }

  function konfirmasiHapus(kota: KotaFavorit) {
    const pesan = `Yakin hapus ${kota.nama}?`;

    if (Platform.OS === "web") {
      if (globalThis.confirm(pesan)) {
        void hapusFavoritTersimpan(kota.id);
      }
      return;
    }

    Alert.alert("Konfirmasi", pesan, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => void hapusFavoritTersimpan(kota.id),
      },
    ]);
  }

  function bukaRiwayat(kota: HasilGeocoding) {
    router.navigate({
      pathname: "/",
      params: {
        selectedCity: JSON.stringify(kota),
        selectionRequest: `${Date.now()}-${Math.random()}`,
      },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <View style={{ gap: 12 }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
            Pencarian Terakhir
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            {riwayatPencarian.length} dari 10 kota terakhir
          </Text>
          {riwayatPencarian.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>
              Kota yang dipilih dari hasil pencarian akan muncul di sini.
            </Text>
          ) : (
            riwayatPencarian.map((kota) => (
              <Pressable
                key={`${kota.id}-${kota.latitude}-${kota.longitude}`}
                accessibilityRole="button"
                accessibilityLabel={`Cari lagi ${kota.name}`}
                onPress={() => bukaRiwayat(kota)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Feather name="clock" size={18} color={colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 16 }}>
                    {kota.name}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    {[kota.admin1, kota.country].filter(Boolean).join(", ")}
                  </Text>
                </View>
                <Feather
                  name="arrow-up-right"
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
            ))
          )}
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
            Kota Favorit
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            Tersimpan {daftarFavorit.length} kota
          </Text>
          {daftarFavorit.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>
              Belum ada kota favorit.
            </Text>
          ) : (
            daftarFavorit.map((kota) => (
              <View
                key={kota.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View>
                  <Text style={{ color: colors.text, fontSize: 16 }}>
                    {kota.nama}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    {kota.latitude.toFixed(2)}, {kota.longitude.toFixed(2)}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus ${kota.nama} dari favorit`}
                  onPress={() => konfirmasiHapus(kota)}
                  hitSlop={8}
                  style={{ padding: 8 }}
                >
                  <Feather name="trash-2" size={18} color={colors.danger} />
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
