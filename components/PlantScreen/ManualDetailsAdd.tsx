import { getUkrainianPart } from "@/components/helpers";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { EvilIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

interface ManualDetailsAddProps {
    add: (value: string) => void;
};

export default function ManualDetailsAdd({add}: ManualDetailsAddProps) {
    const [input, setInput] = useState("");

    return (
        <View style={styles.manualDetails}>
            <View style={styles.inputContainer}>
                <Text style={styles.textStr}>Ручний запис характеристики:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                        setInput(text);
                    }}
                    value={getUkrainianPart(input)}
                    placeholder={input ? "" : "Впишіть розмір"}
                    placeholderTextColor="#A0A0AB"
                />


                {input ? (
                    <TouchableVibrate
                        onPress={() => {
                            setInput("");
                        }}
                        style={styles.clearButton}
                    >
                        <EvilIcons name="close-o" size={24} color="#FFFFFF" style={{ lineHeight: 24 }} />
                    </TouchableVibrate>
                ) : null}

            </View>
            <TouchableVibrate
                onPress={() => add(input)}
                style={styles.buttonAdd}
                disabled={input === ''}
            >
                <FontAwesome6 name="add" size={18} color="#FFFFFF" />
                <Text style={styles.buttonAddText}>Додати</Text>
            </TouchableVibrate>
        </View>

    )
};


const styles = StyleSheet.create({
    manualDetails: {
        width: "100%",
        gap: 4,
    },
    inputContainer: {
        position: "relative",
        width: "100%",
    },
    input: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#E4E4E7",
        width: "100%",
        paddingVertical: 10,
        paddingLeft: 10,
        paddingRight: 45,
        backgroundColor: "#f6f6f6",
        marginBottom: 5,
        marginTop: 5,
    },
    clearButton: {
        position: "absolute",
        right: 10,
        top: 13,
        backgroundColor: "#A0A0AB",
        borderRadius: 8,
        width: 25,
        height: 25,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1
    },
    buttonAdd: {
        flexDirection: 'row',
        borderRadius: 5,
        textAlign: "center",
        backgroundColor: "rgba(255, 111, 97, 1)", //'rgb(106, 159, 53)',
        alignSelf: "flex-end",
        height: 35,
        elevation: 3,
        alignItems: "center",
        padding: 5,
        gap: 4
    },
    buttonAddText: {
        color: '#FFFFFF',
        fontSize: 20,
        lineHeight: 20,
    },
    textStr: {
        fontWeight: "600",
        fontSize: 14,
        marginBottom: 8,
        color: "rgba(255, 111, 97, 1)",
        paddingLeft: 10,
        paddingTop: 4,
    },
})