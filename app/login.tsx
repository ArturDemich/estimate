import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { AppDispatch } from "@/redux/store";
import { loginThunk } from "@/redux/thunks";

export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const handleLogin = () => {
        dispatch(loginThunk({ login: username, pass: password }))
            .unwrap()
            .then((data) => {
                console.log('handleLogin', data)
                if (data.token) {
                    router.replace("/");
                } else {
                    console.log("handleLogin", data);
                }
            })
    };

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
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
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
});
