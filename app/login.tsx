import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { AppDispatch, RootState } from "@/redux/store";
import { loginThunk } from "@/redux/thunks";
import { ActivityIndicator } from "react-native-paper";

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
            .catch((error) => console.error("Login error:", error));
    };

console.log('LoginScreen')
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            {status === "loading" ? (
                <ActivityIndicator size="large" color="#ff6f61" />
            ) : (
                <TouchableOpacity 
                    disabled={username === '' || password === ''} 
                    style={[styles.button, (username === '' || password === '') && styles.lock]} 
                    onPress={handleLogin}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            )}
            
            {status === "failed" && <Text style={styles.errorText}>Login failed. Please try again.</Text>}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
      },
      // Logo styling: adjust width/height as needed
      logo: {
        width: 140,
        height: 140,
        resizeMode: "contain",
        marginBottom: 30,
      },
      // Form container with a semi-transparent white background and rounded corners
      formContainer: {
        width: "100%",
        padding: 20,
        borderRadius: 15,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
      },
      // Title styling
      title: {
        fontSize: 28,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        marginBottom: 25,
      },
      // Input fields occupy full width with increased height and padding for better touch experience
      input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: "#fff",
        fontSize: 16,
        color: "#333",
      },
      // Attractive button styling with a bright color, rounded corners, and shadow for depth
      button: {
        width: "100%",
        backgroundColor: "#ff6f61", // Bright, attractive button color
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
      // Button text styling
      buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
      },
      errorText: { color: "red", marginTop: 10 },
      lock: {opacity: 0.5}
});
