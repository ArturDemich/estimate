import { PropsWithChildren, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AutocompleteDropdown, AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";

type ModalProps = {
  show: boolean;
  close: () => void;
};

const DATA = [
  { id: "1", title: "Apple" },
  { id: "2", title: "Banana" },
  { id: "3", title: "Cherry" },
  { id: "4", title: "Date" },
  { id: "5", title: "Elderberry" },
  { id: "6", title: "Fig" },
  { id: "7", title: "Grape" },
];

export default function ModalAddItem({ show, close }: ModalProps) {
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [reserv, setReserv] = useState("");
  const [qty, setQty] = useState("");

  const handleSelectItem = (item: any) => {
    if (item) {
      setSize(item.title);
    }
  };

  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={show}
        onRequestClose={() => close()}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text
              style={styles.textStr}
              allowFontScaling={true}
              maxFontSizeMultiplier={1}
            >
              Назва
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={setName}
              value={name}
            />
            <Text style={styles.textStyle}>Х-ка</Text>
            <TextInput
              style={styles.input}
              onChangeText={setSize}
              value={size}
              readOnly={name ? false : true}
              placeholder={name ? "" : "Оберіть назву рослини"}
              placeholderTextColor="orange"
            />

          <AutocompleteDropdownContextProvider>
            <View style={{flex: 1}}>
            <AutocompleteDropdown
              dataSet={DATA}
              onSelectItem={handleSelectItem}
              textInputProps={{
                placeholder: "Enter text",
                value: size,
                onChangeText: setSize,
              }}
              inputContainerStyle={styles.inputContainer}
              suggestionsListContainerStyle={styles.suggestionsContainer}
            />
            </View>
            </AutocompleteDropdownContextProvider>

            <View style={styles.qtyBlock}>
              <View>
                <Text style={styles.textStyle}>В резерв:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  onChangeText={setReserv}
                  value={reserv}
                />
              </View>

              <View>
                <Text style={styles.textStyle}>К-сть загальна:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  onChangeText={setQty}
                  value={qty}
                />
              </View>
            </View>
            <View style={styles.btnBlock}>
              <TouchableOpacity
                onPress={() => close()}
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
              <TouchableOpacity
                onPress={() => console.log("1")}
                style={styles.buttonModal}
              >
                <Text
                  style={styles.modalText}
                  allowFontScaling={true}
                  maxFontSizeMultiplier={1}
                >
                  Створити
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    width: "93%",
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
    width: "95%",
    height: 40,
    padding: 3,
    backgroundColor: "#f0ede6",
    marginBottom: 3,
  },
  qtyBlock: {
    width: "97%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
