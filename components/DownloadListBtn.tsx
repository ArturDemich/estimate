import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { Storages } from "@/redux/stateServiceTypes";
import { AppDispatch, RootState } from "@/redux/store";
import { getAllPlantsSaveDBThunk, getPlantsNameDB } from "@/redux/thunks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";


interface DownloadListBtnProps {
    docId: number;
    closeModal: () => void;
};

const DownloadListBtn = ({docId, closeModal}: DownloadListBtnProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentStorage = useSelector<RootState, Storages | null>((state) => state.data.currentStorage);
    const [isLoding, setLoding] = useState(false);
    const [progress, setProgress] = useState(0);

    const loadSaveData = async () => {
        setLoding(true)
        currentStorage?.id && await dispatch(getAllPlantsSaveDBThunk({
            docId, 
            storageId: currentStorage?.id,
            progressCallback: (current: number, total: number) => {
                const percent = Math.round((current / total) * 100);
                setProgress(percent);
              }
        }))
         await dispatch(getPlantsNameDB({ docId })).unwrap().then(() => setLoding(false))
         closeModal()
    };

    return (
        <TouchableVibrate style={styles.openBtn} onPress={loadSaveData} disabled={isLoding}>
            {isLoding ?
            <View style={{position: 'relative',}}>
                <ActivityIndicator style={{position: 'absolute', alignSelf: 'center', top: '-45%'}} size={32} color="rgba(255, 111, 97, 1)" />
                <Text style={{ fontSize: 11, lineHeight: 16, textAlign: 'center' }}>{progress}%</Text>
            </View>
            :
            <MaterialCommunityIcons name="file-download-outline" size={26} color="black" />}
        </TouchableVibrate>
    )
};

export default DownloadListBtn;


const styles = StyleSheet.create({
    openBtn: {
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(31, 30, 30, 0.06)",
        borderRadius: 5,
        shadowColor: 'rgba(143, 143, 143, 0.9)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 2,
        paddingHorizontal: 3,
        alignSelf: 'center',
        minHeight: 33,
        minWidth: 35,
        justifyContent: 'center'
    },
})