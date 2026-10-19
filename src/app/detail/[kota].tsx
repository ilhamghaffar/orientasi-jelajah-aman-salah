import { router, useLocalSearchParams } from "expo-router";
import { Button, View } from "react-native";
import WeatherCard from "../../components/WeatherCard";
import { useAppTheme } from "../../providers/theme-provider";

export default function HalamanDetail() {
  const { colors } = useAppTheme();
  const { kota } = useLocalSearchParams<{ kota: string }>();

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        gap: 16,
        backgroundColor: colors.background,
      }}
    >
      <WeatherCard kota={kota} suhu={29} tingkatAQI="BAIK" />
      <Button
        title="Tambah Favorit"
        color={colors.accent}
        accessibilityLabel="Tambahkan kota ini ke daftar favorit"
        onPress={() =>
          router.push({
            pathname: "/tambah-favorit",
            params: { id: "-1", nama: kota, lat: "0", lon: "0" },
          })
        }
      />
    </View>
  );
}
