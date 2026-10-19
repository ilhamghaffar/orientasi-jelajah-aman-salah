import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AtribusiCuaca from "../../components/AtribusiCuaca";
import SearchBox from "../../components/SearchBox";
import StatusData from "../../components/StatusData";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useDebounce } from "../../hooks/use-debounce";
import { useAppTheme } from "../../providers/theme-provider";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import {
  BATAS_CACHE_MS,
  ambilCuacaOfflineFirst,
} from "../../services/cuacaRepository";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { cariKota } from "../../services/geocodingService";
import {
  ambilKoordinatSaatIni,
  mintaIzinLokasi,
} from "../../services/locationServices";
import { simpanRiwayatKota } from "../../services/searchHistory";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import type {
  HasilCuacaOffline,
  RingkasanKotaTersimpan,
} from "../../types/cache";
import type { KotaFavorit } from "../../types/favorit";
import type { HasilGeocoding } from "../../types/geocoding";

export default function HalamanUtama() {
  const { colors } = useAppTheme();
  const { selectedCity, selectionRequest } = useLocalSearchParams<{
    selectedCity?: string;
    selectionRequest?: string;
  }>();
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [favoritSudahDimuat, setFavoritSudahDimuat] = useState(false);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let masihAktif = true;
      setFavoritSudahDimuat(false);

      void ambilSemuaFavorit().then((favorit) => {
        if (masihAktif) {
          setDaftarFavorit(favorit);
          setFavoritSudahDimuat(true);
        }
      });

      return () => {
        masihAktif = false;
      };
    }, []),
  );

  useEffect(() => {
    let masihAktif = true;

    async function muatKotaTersimpan() {
      try {
        await bersihkanCacheLama(BATAS_CACHE_MS);
        const daftar = await daftarKotaTersimpan();
        if (masihAktif) setKotaTersimpan(daftar);
      } catch {
        if (masihAktif) setKotaTersimpan([]);
      }
    }

    void muatKotaTersimpan();
    return () => {
      masihAktif = false;
    };
  }, []);

  useEffect(() => {
    let masihAktif = true;
    const kueri = teksTertunda.trim();

    if (!kueri) {
      setHasilPencarian([]);
      return () => {
        masihAktif = false;
      };
    }

    cariKota(kueri)
      .then((daftar) => {
        if (masihAktif) setHasilPencarian(daftar);
      })
      .catch(() => {
        if (masihAktif) setHasilPencarian([]);
      });

    return () => {
      masihAktif = false;
    };
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    const idPermintaan = ++requestIdRef.current;
    setKotaTerpilih(kota);
    void simpanRiwayatKota(kota);
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui },
      );

      if (idPermintaan !== requestIdRef.current) return;

      setHasil(data);
      void daftarKotaTersimpan()
        .then(setKotaTersimpan)
        .catch(() => {});
    } catch {
      if (idPermintaan !== requestIdRef.current) return;

      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi.",
      );
    } finally {
      if (idPermintaan === requestIdRef.current) setSedangMemuat(false);
    }
  }

  const pilihKotaDariRiwayat = useEffectEvent((dataKota: string) => {
    try {
      const kota = JSON.parse(dataKota) as HasilGeocoding;
      setTeksCari(kota.name);
      void pilihKota(kota);
    } catch {
      setPesanError("Data riwayat tidak dapat dibaca. Silakan cari kota lagi.");
    }
  });

  useEffect(() => {
    if (selectedCity && selectionRequest) {
      pilihKotaDariRiwayat(selectedCity);
    }
  }, [selectedCity, selectionRequest]);

  async function hapusCacheTersimpan(kunci: string) {
    try {
      await hapusCacheKota(kunci);
      setKotaTersimpan((daftar) =>
        daftar.filter((kota) => kota.kunci !== kunci),
      );
    } catch {
      Alert.alert("Gagal", "Cache kota tidak dapat dihapus.");
    }
  }

  function konfirmasiHapusCache(kota: RingkasanKotaTersimpan) {
    const pesan = `Hapus cache cuaca ${kota.nama} dari perangkat?`;

    if (Platform.OS === "web") {
      if (globalThis.confirm(pesan)) void hapusCacheTersimpan(kota.kunci);
      return;
    }

    Alert.alert("Hapus cache kota?", pesan, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => void hapusCacheTersimpan(kota.kunci),
      },
    ]);
  }

  async function gunakanLokasiSaatIni() {
    try {
      const status = await mintaIzinLokasi();

      if (status === "denied") {
        setPesanLokasi(
          "Izin lokasi ditolak. Silakan cari kota secara manual di atas.",
        );
        return;
      }

      if (status === "unavailable") {
        setPesanLokasi(
          "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.",
        );
        return;
      }

      setPesanLokasi(null);
      const koordinat = await ambilKoordinatSaatIni();
      await pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch {
      setPesanLokasi(
        "Lokasi tidak dapat diambil. Silakan cari kota secara manual.",
      );
    }
  }

  function pilihKotaTersimpan(kota: RingkasanKotaTersimpan) {
    void pilihKota({
      id: kota.id,
      name: kota.nama,
      latitude: kota.latitude,
      longitude: kota.longitude,
      country: "",
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox value={teksCari} onCari={setTeksCari} />
        <Button
          title="Gunakan Lokasi Saat Ini"
          color={colors.accent}
          onPress={gunakanLokasiSaatIni}
        />
        {pesanLokasi && (
          <Text accessibilityLabel={pesanLokasi} style={{ color: colors.text }}>
            {pesanLokasi}
          </Text>
        )}

        {hasilPencarian.map((kota) => (
          <TouchableOpacity key={kota.id} onPress={() => void pilihKota(kota)}>
            <Text style={{ color: colors.text }}>{kota.name}</Text>
          </TouchableOpacity>
        ))}

        {kotaTersimpan.length > 0 && (
          <View
            style={{ gap: 6, padding: 12, backgroundColor: colors.surface }}
          >
            <Text style={{ fontWeight: "bold", color: colors.text }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((kota) => (
              <View
                key={kota.kunci}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  paddingVertical: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => pilihKotaTersimpan(kota)}
                  style={{ flex: 1 }}
                >
                  <Text style={{ color: colors.text }}>{kota.nama}</Text>
                </TouchableOpacity>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus cache ${kota.nama}`}
                  onPress={() => konfirmasiHapusCache(kota)}
                  hitSlop={8}
                  style={{ padding: 8 }}
                >
                  <Feather name="trash-2" size={18} color={colors.danger} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator color={colors.accent} />}
        {pesanError && (
          <View>
            <Text
              accessibilityLabel={pesanError}
              style={{ color: colors.text }}
            >
              {pesanError}
            </Text>
            <Button
              title="Coba Lagi"
              color={colors.accent}
              onPress={() => {
                if (kotaTerpilih) void pilihKota(kotaTerpilih, true);
              }}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
              kondisiCuaca={labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
              kecepatanAngin={hasil.cuaca.saatIni.kecepatanAngin}
            />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}{" "}
              {"\u2022"} Angin {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>
            <Button
              title="Perbarui Sekarang"
              color={colors.accent}
              onPress={() => void pilihKota(kotaTerpilih, true)}
            />
            {favoritSudahDimuat &&
              !daftarFavorit.some(
                (favorit) => favorit.id === kotaTerpilih.id,
              ) && (
                <Button
                  title="Tambahkan ke Favorit"
                  color={colors.accent}
                  onPress={() =>
                    router.push({
                      pathname: "/tambah-favorit",
                      params: {
                        id: String(kotaTerpilih.id),
                        nama: kotaTerpilih.name,
                        lat: String(kotaTerpilih.latitude),
                        lon: String(kotaTerpilih.longitude),
                      },
                    })
                  }
                />
              )}
          </>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
