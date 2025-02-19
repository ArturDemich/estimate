import { RootState } from "@/redux/store";
import { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { addDocument } from "@/db/db.native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type StorageItem = {
  id: string;
  id_parent: string;
  is_group: boolean;
  name: string;
};


export default function AddDetailsModal() {
  const router = useRouter();
  const storages: StorageItem[] = useSelector((state: RootState) => state.data.digStorages);
  console.log('CreateDocModal')
  const [show, setShow] = useState(false);

  

  const handleClose = () => {
    setShow(false);
  };

  const navigateToDocument = async (docName: string) => {
    setShow(false);
    const docId = await addDocument(docName)
    router.push({
      pathname: "/document",
      params: { docName, docId },
    });
  };


  return (
    <>
      <View style={styles.containerNBTN}>
        <TouchableOpacity
          style={styles.buttonStep}
          onPress={() => setShow(!show)}
        >
          <Text style={styles.textBtn}>New +</Text>
        </TouchableOpacity>
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
              Оберіть х-ка
            </Text>

            <FlatList
            data={['children']}
            keyExtractor={(child) => child}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => navigateToDocument(item)}
              >
                <Text style={styles.listItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            style={{ width: '100%'}}
          />

            <View style={styles.btnBlock}>
              <TouchableOpacity
                onPress={() => handleClose()}
                style={styles.buttonClose}
              >
                <Text
                  style={styles.modalText}
                  allowFontScaling={true}
                  maxFontSizeMultiplier={1}
                >
                  Х
                </Text>
              </TouchableOpacity>
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
  textBtn: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
  },
  buttonStep: {
    borderRadius: 3,
    backgroundColor: "green",
    height: 40,
    padding: 5,
    opacity: 0.95,
    elevation: 5,
    shadowColor: "#d70000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00002329",
  },
  inputContainer: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 8,
    elevation: 3,
  },
  suggestionsContainer: {
    backgroundColor: "white",
    borderRadius: 5,
    elevation: 3,
  },
  modalView: {
    width: "80%",
    height: "70%",
    flexDirection: "column",
    margin: 1,
    backgroundColor: "white",
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
    justifyContent: "space-between",
    // flex: 1,
    width: "100%",
    marginTop: 10,
  },

  buttonModal: {
    borderRadius: 3,
    textAlign: "center",
    backgroundColor: "#45aa45",
    width: 110,
    alignSelf: "flex-end",
    height: 35,
    elevation: 3,
    justifyContent: "center",
  },

  buttonClose: {
    borderRadius: 3,
    height: 35,
    elevation: 3,
    width: 40,
    alignSelf: "flex-end",
    backgroundColor: "#999999e6",
    justifyContent: "center",
  },
  textStyle: {
    fontWeight: "500",
    fontSize: 14,
    color: "#555555",
    //marginBottom: 40,
    paddingLeft: 5,
    paddingRight: 5,
  },
  textStr: {
    fontWeight: "600",
    fontSize: 13,
  },
  modalText: {
    textAlign: "center",
    alignSelf: "center",
    color: "snow",
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 3,
    borderColor: "#e8e7e3",
    width: "90%",
    minHeight: 35,
    padding: 3,
    backgroundColor: "#f0ede6",
    marginBottom: 3,
    marginTop: 10,
  },
  qtyBlock: {
    width: "97%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
