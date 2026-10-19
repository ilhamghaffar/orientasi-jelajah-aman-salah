// src/app/tambah-favorit.tsx
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Button, Text, View } from "react-native";
import { useAppTheme } from "../providers/theme-provider";
import { tambahFavorit } from "../services/favoritStorage";

export default function ModalTambahFavorit() {
  const { colors } = useAppTheme();
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  async function simpan() {
    if (!id || !nama || !lat || !lon) {
      Alert.alert("Error", "Data kota tidak lengkap atau tidak valid.");
      return;
    }

    try {
      await tambahFavorit({
        id: Number(id),
        nama,
        latitude: Number(lat),
        longitude: Number(lon),
      });
      router.back();
    } catch (error) {
      console.error("Terjadi kesalahan saat menyimpan:", error);
      Alert.alert("Gagal", "Tidak dapat menyimpan ke favorit.");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        gap: 16,
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ fontSize: 16, textAlign: "center", color: colors.text }}>
        Tambahkan <Text style={{ fontWeight: "bold" }}>{nama}</Text> ke daftar
        favorit?
      </Text>
      <View style={{ gap: 8 }}>
        <Button title="Simpan" color={colors.accent} onPress={simpan} />
        <Button
          title="Batal"
          color={colors.danger}
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
