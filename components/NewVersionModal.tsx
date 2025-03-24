import { useEffect, useState } from "react";
import { Linking, Modal, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import Constants from 'expo-constants';
import { StyleSheet } from "react-native";
import { RootState } from "@/redux/store";
import { NewVersionRes } from "@/redux/stateServiceTypes";
import Toast from "react-native-toast-message";




function NewVersionModal({ }) {
    const [show, setShow] = useState(false);
    const newVersion = useSelector<RootState, NewVersionRes | null>((state) => state.data.newVersion);
    const ver = Constants.expoConfig?.version;

    const refreshApp = () => {
        if (newVersion?.url) {
            Linking.openURL(newVersion.url);
            setShow(!show)
        } else {
            setShow(!show)
            Toast.show({
                type: "customError",
                text1: "URL для завантаження не отримано!",
                position: "bottom",
                bottomOffset: 150,
                visibilityTime: 4000,
            })
        }
    };

    const get = () => {
        if (newVersion && newVersion.version?.length > 0 && String(ver) < String(newVersion.version)) {
            setShow(true)
        }
    }

    useEffect(() => {
        get()
    }, [newVersion])

    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={show}
                onRequestClose={() => setShow(!show)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text
                            style={styles.textStr}
                            allowFontScaling={true}
                            maxFontSizeMultiplier={1}
                        >Все файно! </Text>
                        <Text style={{ fontSize: 17, color: 'rgb(101, 100, 100)' }}>Є нова версія додатка!!</Text>
                        <Text style={styles.textStyle}>Оновити зараз?</Text>
                        <View style={styles.btnBlock}>
                            <TouchableOpacity
                                onPress={() => setShow(!show)}
                                style={styles.buttonClose}
                            >
                                <Text
                                    style={styles.modalText}
                                    allowFontScaling={true}
                                    maxFontSizeMultiplier={1}
                                >Пізніше</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => refreshApp()}
                                style={styles.buttonModal}
                            >
                                <Text
                                    style={styles.modalText}
                                    allowFontScaling={true}
                                    maxFontSizeMultiplier={1}
                                >Оновити</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default NewVersionModal


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    modalView: {
        width: 300,
        flexDirection: 'column',
        margin: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        paddingLeft: 5,
        paddingRight: 5,
        paddingBottom: 5,
        paddingTop: 5,
        alignItems: "center",
        justifyContent: 'center',
        shadowColor: 'rgba(255, 255, 255, 0.85)',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minHeight: '15%',
        maxHeight: '70%',
        gap: 10,
    },

    btnBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
        width: "100%",
        marginTop: 0,
    },

    buttonModal: {
        borderRadius: 3,
        textAlign: "center",
        backgroundColor: "#45aa45",
        width: 110,
        alignSelf: 'flex-end',
        height: 35,
        elevation: 3,
        shadowColor: 'rgba(23, 22, 22, 0.85)',
        justifyContent: 'center',
    },

    buttonClose: {
        borderRadius: 3,
        height: 35,
        elevation: 3,
        width: 110,
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(109, 109, 109, 1)',
        shadowColor: 'rgba(109, 109, 109, 0.85)',
        justifyContent: 'center',
    },
    textStyle: {
        fontWeight: 500,
        fontSize: 20,
        color: 'rgb(72, 71, 71)',
        marginBottom: 40,
        paddingLeft: 5,
        paddingRight: 5,
    },
    textStr: {
        fontWeight: 600,
        fontSize: 21,
    },
    modalText: {
        textAlign: "center",
        alignSelf: 'center',
        color: 'snow',
        fontSize: 15,
        fontWeight: 700
    },

})