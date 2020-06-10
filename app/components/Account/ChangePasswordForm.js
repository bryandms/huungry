import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Input, Button } from "react-native-elements";
import { size } from "lodash";
import * as firebase from "firebase";
import { reauthenticate } from "../../utils/api";

const defaultValue = () => {
  return { password: "", newPassword: "", confirmPassword: "" };
};

const ChangePasswordForm = ({ setShowModal, toastRef }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(defaultValue());
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e, type) => {
    setFormData({ ...formData, [type]: e.nativeEvent.text });
  };

  const handleSubmit = () => {
    setErrors({});

    if (
      !formData.password ||
      !formData.newPassword ||
      !formData.confirmPassword
    )
      return setErrors({
        password: !formData.password ? "The field password is required" : "",
        newPassword: !formData.newPassword
          ? "The field new password is required"
          : "",
        confirmPassword: !formData.newPassword
          ? "The field confirm password is required"
          : "",
      });

    if (formData.newPassword !== formData.confirmPassword)
      return setErrors({
        newPassword: "Passwords do not match",
        confirmPassword: "Passwords do not match",
      });

    if (size(formData.newPassword) < 6)
      return setErrors({
        newPassword: "The password must be at least 6 characters",
        confirmPassword: "The password must be at least 6 characters",
      });

    setIsLoading(true);
    reauthenticate(formData.password)
      .then(async () => {
        await firebase
          .auth()
          .currentUser.updatePassword(formData.newPassword)
          .then(() => {
            setIsLoading(false);
            setShowModal(false);
            firebase.auth().signOut();
          })
          .catch(() => {
            setErrors({
              other: "Error updating password.",
            });
            setIsLoading(false);
          });
      })
      .catch(() => {
        setIsLoading(false);
        setErrors({
          password: "These credentials do not match our records.",
        });
      });
  };

  return (
    <View style={styles.view}>
      <Input
        placeholder="Current password"
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
      <Input
        placeholder="New password"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={!showPassword}
        rightIcon={{
          type: "material-community",
          name: showPassword ? "eye-off-outline" : "eye-outline",
          color: "#c2c2c2",
          onPress: () => setShowPassword(!showPassword),
        }}
        onChange={(e) => handleChange(e, "newPassword")}
        errorMessage={errors.newPassword}
      />
      <Input
        placeholder="Confirm new password"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={!showPassword}
        rightIcon={{
          type: "material-community",
          name: showPassword ? "eye-off-outline" : "eye-outline",
          color: "#c2c2c2",
          onPress: () => setShowPassword(!showPassword),
        }}
        onChange={(e) => handleChange(e, "confirmPassword")}
        errorMessage={errors.confirmPassword}
      />
      <Button
        title="Edit password"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={handleSubmit}
        loading={isLoading}
      />
      <Text>{errors.other}</Text>
    </View>
  );
};

export default ChangePasswordForm;

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
