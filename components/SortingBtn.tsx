import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { cleaneSortList } from "@/redux/dataSlice";
import { PlantNameDB } from "@/redux/stateServiceTypes";
import { AppDispatch, RootState } from "@/redux/store";
import { setSortByEmptyThunk } from "@/redux/thunks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";


const SortingBtn = () => {
    const dispatch = useDispatch<AppDispatch>();
    const sortList = useSelector<RootState, PlantNameDB[]>((state) => state.data.sortingPlantList);

    const sortData = async () => {
        sortList.length > 0 ?
            await dispatch(cleaneSortList()) 
            :
            await dispatch(setSortByEmptyThunk())
    };

    return (
        <TouchableVibrate style={styles.openBtn} onPress={sortData}>
            {sortList.length > 0 ?
                <MaterialCommunityIcons name="sort-reverse-variant" size={24} color="rgba(255, 111, 97, 1)" />
                :
                <MaterialCommunityIcons name="sort" size={24} color="black" />}
        </TouchableVibrate>
    )
};

export default SortingBtn;


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
        alignSelf: 'center'
    },
})