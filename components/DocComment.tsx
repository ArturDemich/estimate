
import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Animated,
    ScrollView,
} from "react-native";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { setDocComment } from "@/redux/dataSlice";
import { myToast } from "@/utils/toastConfig";
import { Modal, Portal } from "react-native-paper";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { updateDocComment } from "@/db/db.native";
import { useLocalSearchParams } from "expo-router";




const DocComment = () => {
    const dispatch = useDispatch<AppDispatch>();
    const params = useLocalSearchParams();
    const docId = Array.isArray(params.docId) ? params.docId[0] : params.docId;
    const docComment = useSelector<RootState, string>((state) => state.data.docComment);
    const [commentShow, setCommentShow] = useState(false);
    const [input, setInput] = useState(docComment);
    const translateY = useRef(new Animated.Value(300)).current; // Start off-screen

    const showModal = () => {
        setCommentShow(true);
        Animated.timing(translateY, {
            toValue: 0, // Move modal to visible position
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const hideModal = () => {
        Animated.timing(translateY, {
            toValue: 300, // Move modal down before hiding
            duration: 300,
            useNativeDriver: true,
        }).start(() => setCommentShow(false)); // Hide modal after animation
    };

    const handleSaveComment = async () => {
        await updateDocComment(Number(docId), input)
        .then(() => {
            dispatch(setDocComment(input));
            myToast({ type: "customToast", text1: 'Коментар збережено!', position: 'top' })
        })
        .catch((e) => {
            console.log('Error save comment', e)
            myToast({ type: "customError", text1: `Не вдалось зберегти коментар`, visibilityTime: 4000, position: 'top' })
        })
    }




    console.log('DocComment', docComment)

    return (
        <>
            <TouchableVibrate onPressOut={showModal} style={[styles.buttonStep, styles.containerNBTN,]}>
                <MaterialCommunityIcons name="message-draw" size={28} color="rgba(7, 3, 71, 0.85)" />
                <View style={styles.arrow} />
            </TouchableVibrate>

            <Portal>
                <Modal visible={commentShow} onDismiss={hideModal} style={styles.centeredView}>
                    <Animated.View style={[styles.modalView, { transform: [{ translateY }] }]}>
                        <View style={styles.titleBlock}>
                            <Text style={styles.modalTitle}>Коментар до документа:</Text>
                            <TouchableVibrate 
                                style={[styles.saveBtn, input != docComment && styles.saveBtnActive]} 
                                onPress={handleSaveComment}
                                disabled={input === docComment}
                            >
                                <MaterialCommunityIcons name="content-save-edit-outline" size={28} color="black" />
                            </TouchableVibrate>
                        </View>

                        <ScrollView style={{ maxHeight: 150, }}>
                            <Text style={styles.comment}>{docComment}</Text>
                        </ScrollView>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                onChangeText={setInput}
                                value={input}
                                multiline
                                numberOfLines={5}
                                placeholder={"введіть текст"}
                                placeholderTextColor="#A0A0AB"
                            />
                            {input ? (
                                <TouchableVibrate onPress={() => setInput("")} style={styles.clearButton}>
                                    <EvilIcons name="close-o" size={24} color="#FFFFFF" style={{ lineHeight: 24 }} />
                                </TouchableVibrate>
                            ) : null}

                        </View>

                    </Animated.View>
                </Modal>
            </Portal>
        </>
    );
};

export default DocComment;


const styles = StyleSheet.create({
    containerNBTN: {
        elevation: 5,
        position: "absolute",
        left: 12,
        bottom: 15,
    },
    buttonStep: {
        borderRadius: 8,
        paddingVertical: 2,
        paddingHorizontal: 5,
        opacity: 0.95,
        elevation: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderColor: '#E4E4E7',
        shadowColor: "#131316",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 3,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',

    },
    arrow: {
        position: "absolute",
        bottom: -10, // Move it outside the tooltip
        left: "50%",
        marginLeft: -7, // Center the arrow
        width: 0,
        height: 0,
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderTopWidth: 10,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: 'rgba(255, 255, 255, 0.85)', // Match tooltip color
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    modalView: {
        margin: 1,
        backgroundColor: "rgba(254, 246, 216, 0.95)",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 5,
        paddingTop: 5,
        shadowColor: "rgba(255, 255, 255, 0.4)",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    titleBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 10,
    },
    saveBtn: {
        elevation: 0,
        borderWidth: 1,
        borderColor: "rgba(254, 246, 216, 0.9)",
        borderRadius: 5,
        shadowColor: "none",
        backgroundColor: "rgba(254, 246, 216, 0.9)",
        opacity: 0.2
    },
    saveBtnActive: {
        elevation: 3,
        borderColor: "rgba(31, 30, 30, 0.18)",
        shadowColor: "rgb(27, 27, 27)",
        opacity: 1,
    },
    comment: {
        fontSize: 14,
        color: "rgb(74, 74, 74)",
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
        backgroundColor: "rgba(251, 248, 240, 0.98)",
        marginBottom: 10,
        marginTop: 10,
    },
    clearButton: {
        position: "absolute",
        right: 10,
        top: 18,
        backgroundColor: "#A0A0AB",
        borderRadius: 8,
        width: 25,
        height: 25,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1
    },
})