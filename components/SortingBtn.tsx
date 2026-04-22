import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { cleaneSortList } from "@/redux/dataSlice";
import { PlantNameDB } from "@/redux/stateServiceTypes";
import { AppDispatch, RootState } from "@/redux/store";
import { setSortByEmptyThunk } from "@/redux/thunks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, Vibration } from "react-native";
import { useDispatch, useSelector } from "react-redux";


const SortingBtn = () => {
    const dispatch = useDispatch<AppDispatch>();
    const sortList = useSelector<RootState, PlantNameDB[]>((state) => state.data.sortingPlantList);

    const sortData = async () => {
        Vibration.vibrate(5);
        sortList.length > 0 ?
            await dispatch(cleaneSortList()) 
            :
            await dispatch(setSortByEmptyThunk())
    };

    return (
        <TouchableVibrate style={styles.openBtn} onPressOut={sortData}>
            {sortList.length > 0 ?
                <MaterialCommunityIcons name="sort-reverse-variant" size={24} color="rgba(255, 111, 97, 1)" />
                :
                <MaterialCommunityIcons name="sort" size={24} color="black" />}
                <Text style={styles.menuItemText}>Сортування</Text>
        </TouchableVibrate>
    )
};

export default SortingBtn;


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