import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { setSelectDeletePhoto } from "@/redux/photoSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet} from "react-native";
import { useDispatch, useSelector } from "react-redux";


const DeletePhotoOn = () => {
    const dispatch = useDispatch<AppDispatch>();
    const selectDeletePhoto = useSelector((state: RootState) => state.photos.selectDeletePhoto);

    const setSelectMode = async (val: boolean) => {
        await dispatch(setSelectDeletePhoto(val))
    };

    return (
        <TouchableVibrate style={styles.openBtn} onPress={() => setSelectMode(!selectDeletePhoto)}>
            {selectDeletePhoto ?
                <MaterialCommunityIcons name="delete-off" size={24} color="rgba(255, 111, 97, 1)" />
                :
                <MaterialCommunityIcons name="delete" size={24} color="black" />}
        </TouchableVibrate>
    )
};

export default DeletePhotoOn;


const styles = StyleSheet.create({
    openBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderRadius: 5,
    },
    menuItemText: {
        fontSize: 16,
        color: 'black',
    },
})