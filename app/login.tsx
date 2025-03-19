import { View, Text, TextInput, StyleSheet, ImageBackground } from "react-native";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { AppDispatch, RootState } from "@/redux/store";
import { loginThunk } from "@/redux/thunks";
import { ActivityIndicator } from "react-native-paper";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import AppVersion from "@/components/AppVersion";

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const status = useSelector((state: RootState) => state.login.status);

  const handleLogin = () => {
    dispatch(loginThunk({ login: username, pass: password }))
      .unwrap()
      .then(() => {
        router.replace("/");
      })
      .catch((error) => console.log("Login error:"));
  };

  console.log('LoginScreen')
  return (
    <ImageBackground
      source={require("../assets/globoza.jpg")}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        position: "absolute",
      }}
    >
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Авторизація</Text>
          <TextInput
            placeholder="Логін"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          {status === "loading" ? (
            <ActivityIndicator size="large" color="#ff6f61" />
          ) : (
            <TouchableVibrate
              disabled={username === '' || password === ''}
              style={[styles.button, (username === '' || password === '') && styles.lock]}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Вхід</Text>
            </TouchableVibrate>
          )}

          {status === "failed" && <Text style={styles.errorText}>Помилка входу. Спробуйте ще раз.</Text>}
          <AppVersion />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    shadowColor: "rgba(255, 255, 255, 0.1)",
    shadowOpacity: 0.15,
    //shadowOffset: { width: 0, height: 4 },
    //shadowRadius: 10,
    elevation: 1
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    fontSize: 16,
    color: "#333",
  },
  button: {
    width: "100%",
    backgroundColor: "rgba(255, 111, 97, 1)", // Bright, attractive button color
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#ff6f61",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: { color: "red", marginTop: 10 },
  lock: { opacity: 0.5 }
});
