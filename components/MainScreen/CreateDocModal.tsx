import { AppDispatch, RootState } from "@/redux/store";
import { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { addDocument } from "@/db/db.native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { EvilIcons } from "@expo/vector-icons";
import EmptyList from "@/components/ui/EmptyList";
import { setDocComment } from "@/redux/dataSlice";

type StorageItem = {
  id: string;
  id_parent: string;
  is_group: boolean;
  name: string;
};


export default function CreateDocModal() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const storages: StorageItem[] = useSelector((state: RootState) => state.data.digStorages);
  const [show, setShow] = useState(false);

  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const toggleExpand = (id: number) => {
    setExpandedItems(prevState =>
      prevState.includes(id) ? prevState.filter(itemId => itemId !== id) : [...prevState, id]
    );
  };
  
  const filterStorages = (storages: StorageItem[]) => {
    const middleGroups: StorageItem[] = storages.filter(
      item => item.is_group && item.id_parent !== '00000000-0000-0000-0000-000000000000'
    );
    const rootStorages: StorageItem[] = storages.filter(
      item => item.is_group && item.id_parent === '00000000-0000-0000-0000-000000000000'
    );
    const maxRootStorages = rootStorages.filter(root =>
      middleGroups.some(middle => middle.id_parent === root.id)
    );
    const filteredStorages = [
      ...middleGroups,
      ...rootStorages.filter(root => !maxRootStorages.some(maxRoot => maxRoot.id === root.id))
    ];
  
    return filteredStorages;
  };
  

  const handleClose = () => {
    setShow(false);
  };

  const navigateToDocument = async (storeName: string, storeId: string) => {
    setShow(false);
    await dispatch(setDocComment(''))
    const docId = await addDocument(storeName, storeId)
    router.push({
      pathname: "/document",
      params: { docName: storeName, docId, docSent: 0, docTimeCr: new Date().toISOString() },
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const children = storages.filter(child => child.id_parent === item.id);

    return (
      <View>
        <TouchableVibrate
          style={styles.listItem}
          onPress={() => toggleExpand(item.id)} // Toggle expand
        >
          <Text style={styles.listItemText}>{item.name}</Text>
          {item.is_group ? (expandedItems.includes(item.id) ?
            <MaterialIcons name="expand-less" size={24} color="black" /> :
            <MaterialIcons name="expand-more" size={24} color="black" />)
            : null}
        </TouchableVibrate>

        {/* Render nested items if expanded */}
        {(expandedItems.includes(item.id) && children.length > 0) && (
          <FlatList
            data={children}
            keyExtractor={(child) => child.id.toString()}
            renderItem={({ item }) => (
              <TouchableVibrate
                style={styles.listItem}
                onPress={() => navigateToDocument(item.name, item.id)}
              >
                <Text style={styles.listItemText}>{item.name}</Text>
              </TouchableVibrate>
            )}
            style={{ marginLeft: 20 }}
          />
        )}
      </View>
    );
  };


  return (
    <>
      <View style={styles.containerNBTN}>
        <TouchableVibrate
          style={styles.buttonStep}
          onPress={() => setShow(!show)}
          //onPress={() => deleteDatabase()}
          //onPress={() => listDatabases()}
        >
          <Feather name="plus" size={22} color="black" />
          <Ionicons name="document-text-outline" size={26} color="black" />
        </TouchableVibrate>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={show}
        onRequestClose={() => handleClose()}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text
              style={styles.textStr}
              allowFontScaling={true}
              maxFontSizeMultiplier={1}
            >
              Оберіть склад
            </Text>

            <FlatList
              data={filterStorages(storages)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              style={{ width: '100%' }}
              ListEmptyComponent={<EmptyList text="Склади не завантажено" />}
            />

            <View style={styles.btnBlock}>
              <TouchableVibrate
                onPress={() => handleClose()}
                style={styles.buttonClose}
              >
                <EvilIcons name="close" size={24} color="#FFFFFF" style={{lineHeight: 24 }} />
              </TouchableVibrate>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  listItemText: {
    fontSize: 16,
    alignSelf: "center",
  },
  containerNBTN: {
    elevation: 5,
    position: "absolute",
    right: 12,
    bottom: 10,
  },
  buttonStep: {
    borderRadius: 12,
    paddingVertical: 8,
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
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00002329",
  },
  modalView: {
    width: "80%",
    height: "70%",
    flexDirection: "column",
    margin: 1,
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: 10,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minHeight: "15%",
    maxHeight: "70%",
  },

  btnBlock: {
    flexDirection: "row",
    width: "100%",
    marginTop: 5,
  },
  buttonClose: {
    borderRadius: 8,
    elevation: 3,
    padding: 4,
    backgroundColor: "rgba(199, 199, 199, 0.99)",
    justifyContent: "center",
    alignItems: 'center',
  },
  textStr: {
    fontWeight: "600",
    fontSize: 13,
  },
});
