import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Input, Button } from "react-native-elements";
import * as firebase from "firebase";
import { validateEmail } from "../../utils/validations";
import { reauthenticate } from "../../utils/api";

const defaultValue = () => {
  return {
    email: "",
    password: "",
  };
};

const ChangeEmailForm = ({
  email,
  setShowModal,
  toastRef,
  setReloadUserInfo,
}) => {
  const [formData, setFormData] = useState(defaultValue());
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e, type) => {
    setFormData({ ...formData, [type]: e.nativeEvent.text });
  };

  const handleSubmit = () => {
    setErrors({});

    if (!formData.email || email === formData.email)
      return setErrors({
        email: "The email has not changed.",
      });

    if (!validateEmail(formData.email))
      return setErrors({
        email: "The email is not valid.",
      });

    if (!formData.password)
      return setErrors({ password: "The password is required." });

    setIsLoading(true);
    reauthenticate(formData.password)
      .then((response) => {
        firebase
          .auth()
          .currentUser.updateEmail(formData.email)
          .then(() => {
            setIsLoading(false);
            setReloadUserInfo(true);
            toastRef.current.show("Email successfully updated.");
            setShowModal(false);
          })
          .catch(() => {
            setErrors({ email: "Error updating the mail." });
            setIsLoading(false);
          });
      })
      .catch(() => {
        setIsLoading(false);
        setErrors({ password: "These credentials do not match our records." });
      });
  };

  return (
    <View style={styles.view}>
      <Input
        placeholder="Email"
        containerStyle={styles.input}
        defaultValue={email || ""}
        rightIcon={{
          type: "material-community",
          name: "at",
          color: "#c2c2c2",
        }}
        onChange={(e) => handleChange(e, "email")}
        errorMessage={errors.email}
      />
      <Input
        placeholder="Password"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={!showPassword}
        rightIcon={{
          type: "material-community",
          name: showPassword ? "eye-off-outline" : "eye-outline",
          color: "#c2c2c2",
          onPress: () => setShowPassword(!showPassword),
        }}
        onChange={(e) => handleChange(e, "password")}
        errorMessage={errors.password}
      />
      <Button
        title="Edit email"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={handleSubmit}
        loading={isLoading}
      />
    </View>
  );
};

export default ChangeEmailForm;

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
