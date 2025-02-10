import React, { useState, useRef } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    findNodeHandle,
    UIManager,
} from "react-native";
import { Portal } from "react-native-paper";
import EvilIcons from '@expo/vector-icons/EvilIcons';

const data = [
    { name: "Azalea japonica 'Babuschka', Азалія японська 'Бабушка'" },
    { name: "Platanus hispanica (x acerifolia), Платан іспанський (кленолистий)" },
    { name: "Acer platanoides 'Royal Red', Клен гостролистий 'Роял Ред'" },
    { name: "Thuja plicata 'Gelderland', Туя складчаста 'Гелдерланд'" },
    { name: "Thuja 'Golden Smaragd', Туя західна 'Голден Смарагд'" },
    { name: "Thuja occidentalis 'Smaragd Witbont', Туя західна 'Смарагд Вітбонт'" },
];

export default function InputDropDown() {
    const [input, setInput] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{
        top: number;
        left: number;
        width: number;
    } | null>(null);

    const inputRef = useRef<TextInput>(null);

    const showDropdown = () => {
        if (inputRef.current) {
            const handle = findNodeHandle(inputRef.current);
            if (handle) {
                UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
                    setDropdownPosition({
                        top: pageY + height,
                        left: pageX,
                        width,
                    });
                });
            }
        }
    };

    function getUkrainianPart(name: string): string {
        const parts = name.split(",");
        return parts.length > 1 ? parts[1].trim() : name;
    }

    return (
        <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    onChangeText={(text) => {
                        setInput(text);
                        setDropdownVisible(!!text);
                        showDropdown();
                    }}
                    onFocus={showDropdown}
                    onBlur={() => setDropdownVisible(false)}
                    value={getUkrainianPart(input)}
                    placeholder={input ? "" : "Оберіть назву рослини"}
                    placeholderTextColor="#A0A0AB"
                />
                {input ? (
                    <TouchableOpacity
                        onPress={() => {
                            setInput("");
                            setDropdownVisible(false);
                        }}
                        style={styles.clearButton}
                    >
                        <EvilIcons name="close-o" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {dropdownVisible && dropdownPosition && (
                <Portal>
                    <View
                        style={[
                            styles.listContainer,
                            {
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                width: dropdownPosition.width,
                            },
                        ]}
                    >
                        <FlatList
                            data={data.filter((item) => item.name.toLowerCase().includes(input.toLowerCase()))}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.pressItemList}
                                    onPress={() => {
                                        setInput(item.name);
                                        setDropdownVisible(false);
                                    }}
                                >
                                    <Text style={{ fontSize: 15, }}>{getUkrainianPart(item.name)}</Text>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => (
                                <View style={{ borderBottomWidth: 1, borderColor: "#E4E4E7", }} />
                            )}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ paddingBottom: 10 }}
                        />
                    </View>
                </Portal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    inputWrapper: {
        position: "relative",
        width: "100%",
        marginTop: 10,
        marginBottom: 10,
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
        height: 50,
        padding: 10,
        paddingRight: 45,
        backgroundColor: "#f6f6f6",
        marginBottom: 5,
    },
    clearButton: {
        position: "absolute",
        right: 10,
        top: 15,
        backgroundColor: "#A0A0AB",
        borderRadius: 8,
        width: 25,
        height: 25,
        alignItems: "center",
        justifyContent: "center",
    },
    clearButtonText: {
        fontSize: 12,
        color: "#333",
    },
    listContainer: {
        position: "absolute",
        backgroundColor: "#FFFFFF",
        zIndex: 110,
        elevation: 10,
        borderRadius: 3,
        maxHeight: 170,
        shadowColor: "#959595",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 3,
        padding: 5,
    },
    pressItemList: {
        paddingBottom: 8,
        paddingTop: 8,
    }
});
