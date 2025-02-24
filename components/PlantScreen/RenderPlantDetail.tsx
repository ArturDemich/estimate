import { PlantDetails } from "@/redux/stateServiceTypes";
import { RootState } from "@/redux/store";
import { memo, } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

const nullId = '00000000-0000-0000-0000-000000000000';

interface RenderPlantDetailProps {
    item: PlantDetails;
    index: number;
    existPlantProps: PlantDetails | null;
};

const RenderPlantDetail = memo(({ item, index, existPlantProps, }: RenderPlantDetailProps) => {
    const selected = existPlantProps?.characteristic_id === item.characteristic_id;
    console.log('__RenderPlantDetail___ #ff6f61')

    return (
        <TouchableOpacity style={[styles.documentItem, selected && styles.selectedItem]}>
            {selected && <View style={styles.shadowOverlay} />}
            <View style={{ display: "flex", flexDirection: "row", gap: 5 }}>
                <Text style={styles.itemNum}>{index + 1}.</Text>
                <Text style={styles.itemSize}>{
                    item.characteristic_id === nullId || null ? 'Немає характеристики' : item.characteristic_name
                }</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                <View style={{ flexDirection: "column", flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', }}>
                        <View style={{ gap: 4, flexDirection: "row", }}>
                            <TouchableOpacity style={styles.btnRes}>
                                <Text>склад:</Text>
                            </TouchableOpacity>
                            <Text style={[styles.itemQty, { color: "#70707B" }]}>{item.quantity}5555{item.unit_name}</Text>
                        </View>

                        <Text style={styles.itemQty}>2000шт</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.btnPlus}>
                    <Text>+1</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}, (prevProps, nextProps) => {
    console.log('__RenderPlantDetail___ MEMO_', prevProps.existPlantProps?.characteristic_id, nextProps.item.characteristic_id)
    return nextProps.existPlantProps?.characteristic_id !== nextProps.item.characteristic_id && 
    prevProps.existPlantProps?.characteristic_id !== nextProps.item.characteristic_id
});

const mapStateToProps = (state: RootState) => ({
    existPlantProps: state.data.existPlantProps,
})

export default connect(mapStateToProps)(RenderPlantDetail);

const styles = StyleSheet.create({
    documentItem: {
        backgroundColor: "#fff",
        justifyContent: "center",
        minHeight: 40,
        borderRadius: 5,
        margin: 7,
        padding: 5,
        elevation: 10,
        shadowColor: "black",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 7,
    },
    btnPlus: {
        backgroundColor: "green",
        width: 40,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    btnRes: {
        padding: 4,
        borderRadius: 3,
        alignItems: "center",
        justifyContent: "center",
    },
    itemQty: {
        alignSelf: "center",
        fontSize: 14,
    },
    itemSize: {
        fontSize: 13,
        fontWeight: "600",
        padding: 5,
        width: '100%'
    },
    itemNum: {
        alignSelf: "center",
        fontSize: 12,
        color: "grey",
    },
    selectedItem: {
        shadowColor: "rgba(0,0,0,0.8)", 
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 3, 
        elevation: 3,
    },
    shadowOverlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: "#ff6b5c10",
        borderRadius: 5, 
    },
});