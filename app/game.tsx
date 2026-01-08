import { BlockBlastGame } from "@/components/game/BlockBlastGame";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      {/* <TouchableOpacity onPress={() => router.push(PATH.HOME)} style={styles.settingIconContainer}>
        <SvgIcon source={icons.settingIcon} width={20} height={20} />
      </TouchableOpacity> */}
      <BlockBlastGame />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    paddingTop: 16
  },
  settingIconContainer: {
    position: "absolute",
    top: 50,
    right: 10,
    zIndex: 1000,
  },
});
