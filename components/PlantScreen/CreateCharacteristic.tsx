import TouchableVibrate from "@/components/ui/TouchableVibrate";
import ManualDetailsAdd from "@/components/PlantScreen/ManualDetailsAdd";
import EmptyList from "@/components/ui/EmptyList";
import { AppDispatch } from "@/redux/store";
import { AttributeGroup, AttributeValue, PlantItemRespons } from "@/redux/stateServiceTypes";
import { createCharacteristicThunk } from "@/redux/thunks";
import { myToast } from "@/utils/toastConfig";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useDispatch } from "react-redux";

const DROPDOWN_MIN_HEIGHT = 160;

interface ComboItem {
    attributeId: string;
    attributeName: string;
    valueId: string;
    valueName: string;
}

export interface CreateMeta {
    canCreate: boolean;
    submitting: boolean;
}

interface CreateCharacteristicProps {
    productId: string;
    attributes: AttributeGroup[];
    manual: boolean;
    onBack: () => void;
    onCreated: (item: PlantItemRespons) => void | Promise<void>;
    addManual: (value: string) => void;
    registerCreate: (fn: (() => void) | null) => void;
    onCreateMeta: (meta: CreateMeta) => void;
}

export default function CreateCharacteristic({
    productId,
    attributes,
    manual,
    onBack,
    onCreated,
    addManual,
    registerCreate,
    onCreateMeta,
}: CreateCharacteristicProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [combo, setCombo] = useState<ComboItem[]>([]);
    const [selectedAttrId, setSelectedAttrId] = useState<string | null>(null);
    const [selectedValueId, setSelectedValueId] = useState<string | null>(null);
    const [openSelect, setOpenSelect] = useState<"attr" | "value" | null>(null);
    const [query, setQuery] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const selectedAttr = attributes.find((a) => a.id === selectedAttrId) ?? null;
    const selectedValue = selectedAttr?.values.find((v) => v.id === selectedValueId) ?? null;

    const attrOptions = useMemo(
        () => attributes.filter((a) => !combo.some((c) => c.attributeId === a.id)),
        [attributes, combo]
    );

    const panelItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (openSelect === "attr") {
            return q ? attrOptions.filter((a) => a.name.toLowerCase().includes(q)) : attrOptions;
        }
        if (openSelect === "value") {
            const values = selectedAttr?.values ?? [];
            return q ? values.filter((v) => v.name.toLowerCase().includes(q)) : values;
        }
        return [];
    }, [openSelect, query, attrOptions, selectedAttr]);

    const canAdd = Boolean(selectedAttr && selectedValue);

    const onCreatedRef = useRef(onCreated);
    onCreatedRef.current = onCreated;

    const handleCreate = useCallback(async () => {
        if (combo.length === 0 || submitting) return;
        setSubmitting(true);
        try {
            const item = await dispatch(
                createCharacteristicThunk({
                    productId,
                    attributeValueIds: combo.map((c) => c.valueId),
                })
            ).unwrap();
            await onCreatedRef.current(item);
        } catch {
            // toast in thunk; stay in constructor
        } finally {
            setSubmitting(false);
        }
    }, [combo, submitting, dispatch, productId]);

    const handleCreateRef = useRef(handleCreate);
    handleCreateRef.current = handleCreate;

    useEffect(() => {
        registerCreate(() => {
            void handleCreateRef.current();
        });
        return () => registerCreate(null);
    }, [registerCreate]);

    useEffect(() => {
        onCreateMeta({ canCreate: combo.length > 0, submitting });
    }, [combo.length, submitting, onCreateMeta]);

    const toggleSelect = (which: "attr" | "value") => {
        if (which === "value" && !selectedAttrId) {
            myToast({ type: "customToast", text1: "Спочатку оберіть атрибут", visibilityTime: 2500 });
            return;
        }
        setQuery("");
        setOpenSelect((prev) => (prev === which ? null : which));
    };

    const handlePickAttr = (item: AttributeGroup) => {
        setSelectedAttrId(item.id);
        setSelectedValueId(null);
        setQuery("");
        setOpenSelect("value");
    };

    const handlePickValue = (item: AttributeValue) => {
        setSelectedValueId(item.id);
        setQuery("");
        setOpenSelect(null);
    };

    const handleAddToCombo = () => {
        if (!selectedAttr || !selectedValue) return;
        if (combo.some((c) => c.attributeId === selectedAttr.id)) {
            myToast({ type: "customToast", text1: "Цей атрибут уже в комбінації", visibilityTime: 2500 });
            return;
        }
        setCombo((prev) => [
            ...prev,
            {
                attributeId: selectedAttr.id,
                attributeName: selectedAttr.name,
                valueId: selectedValue.id,
                valueName: selectedValue.name,
            },
        ]);
        setSelectedAttrId(null);
        setSelectedValueId(null);
        setOpenSelect(null);
        setQuery("");
    };

    const handleRemoveChip = (attributeId: string) => {
        setCombo((prev) => prev.filter((c) => c.attributeId !== attributeId));
    };

    return (
        <View style={styles.wrap}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>Нова комбінація:</Text>
                <TouchableVibrate
                    style={styles.backBtn}
                    onPress={onBack}
                    disabled={submitting}
                >
                    <Ionicons name="arrow-back" size={22} color="rgb(90, 90, 90)" />
                </TouchableVibrate>
            </View>

            {manual ? (
                <View style={styles.manualWrap}>
                    <ManualDetailsAdd add={addManual} />
                </View>
            ) : (
                <>
                    <View style={styles.chips}>
                        {combo.length === 0 ? (
                            <Text style={styles.chipsEmpty}>Додайте атрибути</Text>
                        ) : (
                            combo.map((item) => (
                                <View key={item.attributeId} style={styles.chip}>
                                    <Text style={styles.chipText}>{item.valueName}</Text>
                                    <TouchableVibrate
                                        onPress={() => handleRemoveChip(item.attributeId)}
                                        style={styles.chipClose}
                                        disabled={submitting}
                                    >
                                        <EvilIcons name="close" size={16} color="#FFFFFF" />
                                    </TouchableVibrate>
                                </View>
                            ))
                        )}
                    </View>

                    <View style={styles.selectRow}>
                        <TouchableVibrate
                            style={[styles.selectBtn, openSelect === "attr" && styles.selectBtnOpen]}
                            onPress={() => toggleSelect("attr")}
                            disabled={submitting}
                        >
                            <Text style={styles.selectBtnText} numberOfLines={1}>
                                {selectedAttr?.name || "Атрибут"}
                            </Text>
                            <EvilIcons name="chevron-down" size={22} color="#555" />
                        </TouchableVibrate>
                        <TouchableVibrate
                            style={[
                                styles.selectBtn,
                                openSelect === "value" && styles.selectBtnOpen,
                                !selectedAttrId && styles.selectBtnDisabled,
                            ]}
                            onPress={() => toggleSelect("value")}
                            disabled={submitting}
                        >
                            <Text style={styles.selectBtnText} numberOfLines={1}>
                                {selectedValue?.name || "Значення"}
                            </Text>
                            <EvilIcons name="chevron-down" size={22} color="#555" />
                        </TouchableVibrate>
                        <TouchableVibrate
                            style={[styles.plusBtn, { opacity: canAdd ? 1 : 0.45 }]}
                            onPress={handleAddToCombo}
                            disabled={!canAdd || submitting}
                        >
                            <Text style={styles.plusBtnText}>+</Text>
                        </TouchableVibrate>
                    </View>

                    <View style={styles.dropdown}>
                        {openSelect ? (
                            <>
                                <TextInput
                                    style={styles.searchInput}
                                    value={query}
                                    onChangeText={setQuery}
                                    placeholder="Пошук"
                                    placeholderTextColor="#A0A0AB"
                                    autoCorrect={false}
                                />
                                <FlatList
                                    data={panelItems}
                                    keyExtractor={(item) => item.id}
                                    keyboardShouldPersistTaps="handled"
                                    nestedScrollEnabled
                                    style={styles.dropdownList}
                                    renderItem={({ item }) => (
                                        <TouchableVibrate
                                            style={styles.dropdownItem}
                                            onPress={() =>
                                                openSelect === "attr"
                                                    ? handlePickAttr(item as AttributeGroup)
                                                    : handlePickValue(item)
                                            }
                                        >
                                            <Text style={styles.dropdownItemText}>{item.name}</Text>
                                        </TouchableVibrate>
                                    )}
                                    ListEmptyComponent={<EmptyList text="Співпадінь не знайдено" />}
                                />
                            </>
                        ) : (
                            <View style={styles.dropdownPlaceholder}>
                                <Text style={styles.dropdownPlaceholderText}>
                                    Оберіть атрибут і значення
                                </Text>
                            </View>
                        )}
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: "100%",
        alignSelf: "stretch",
        flex: 1,
        gap: 6,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 2,
        minHeight: 36,
    },
    title: {
        fontWeight: "600",
        fontSize: 14,
        paddingHorizontal: 5,
        flex: 1,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(31, 30, 30, 0.08)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        alignItems: "center",
        justifyContent: "center",
    },
    manualWrap: {
        flex: 1,
        width: "100%",
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        minHeight: 32,
        maxHeight: 64,
        paddingHorizontal: 4,
        overflow: "hidden",
    },
    chipsEmpty: {
        color: "#A0A0AB",
        fontSize: 13,
        paddingVertical: 4,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 111, 97, 0.9)",
        borderRadius: 8,
        paddingLeft: 8,
        paddingRight: 4,
        paddingVertical: 4,
        gap: 2,
    },
    chipText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
    },
    chipClose: {
        padding: 2,
    },
    selectRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        width: "100%",
    },
    selectBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#E4E4E7",
        backgroundColor: "#f6f6f6",
        borderRadius: 5,
        paddingLeft: 8,
        paddingRight: 2,
        minHeight: 40,
    },
    selectBtnOpen: {
        borderColor: "rgba(255, 111, 97, 0.7)",
    },
    selectBtnDisabled: {
        opacity: 0.55,
    },
    selectBtnText: {
        flex: 1,
        fontSize: 13,
        color: "#131316",
    },
    plusBtn: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: "rgba(255, 111, 97, 1)",
        alignItems: "center",
        justifyContent: "center",
    },
    plusBtnText: {
        color: "#FFFFFF",
        fontSize: 24,
        lineHeight: 26,
        fontWeight: "600",
    },
    dropdown: {
        width: "100%",
        flex: 1,
        minHeight: DROPDOWN_MIN_HEIGHT,
        borderWidth: 1,
        borderColor: "#E4E4E7",
        borderRadius: 5,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
    },
    searchInput: {
        borderBottomWidth: 1,
        borderBottomColor: "#E4E4E7",
        paddingVertical: 8,
        paddingHorizontal: 10,
        fontSize: 15,
        backgroundColor: "#f6f6f6",
    },
    dropdownList: {
        flex: 1,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    dropdownItemText: {
        fontSize: 14,
    },
    dropdownPlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafafa",
    },
    dropdownPlaceholderText: {
        color: "#A0A0AB",
        fontSize: 13,
    },
});
