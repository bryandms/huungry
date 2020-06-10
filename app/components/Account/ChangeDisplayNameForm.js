import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Input, Button } from "react-native-elements";
import * as firebase from "firebase";

const ChangeDisplayNameForm = ({
  displayName,
  setShowModal,
  toastRef,
  setReloadUserInfo,
}) => {
  const [newDisplayName, setNewDisplayName] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setError(null);

    if (!newDisplayName) return setError("The field name is required.");

    if (displayName === newDisplayName)
      return setError("The name cannot be the same as the current one.");

    setIsLoading(true);

    const update = { displayName: newDisplayName };
    firebase
      .auth()
      .currentUser.updateProfile(update)
      .then(() => {
        setIsLoading(false);
        setReloadUserInfo(true);
        setShowModal(false);
      })
      .catch(() => {
        setError("Failed to update name.");
        setIsLoading(false);
      });
  };

  return (
    <View style={styles.view}>
      <Input
        placeholder="Name"
        containerStyle={styles.input}
        rightIcon={{
          type: "material-community",
          name: "account-circle-outline",
          color: "#c2c2c2",
        }}
        defaultValue={displayName || ""}
        onChange={(e) => setNewDisplayName(e.nativeEvent.text)}
        errorMessage={error}
      />
      <Button
        title="Edit name"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={handleSubmit}
        loading={isLoading}
      />
    </View>
  );
};

export default ChangeDisplayNameForm;

const styles = StyleSheet.create({
  view: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  btnContainer: {
    marginTop: 20,
    width: "95%",
  },
  btn: {
    backgroundColor: "#00a680",
  },
});
