import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Input, Icon, Button } from "react-native-elements";
import Loading from "../Loading";
import { validateEmail } from "../../utils/validations";
import { size, isEmpty } from "lodash";
import * as firebase from "firebase";
import { useNavigation } from "@react-navigation/native";

const defaultFormValue = () => {
  return {
    email: "",
    password: "",
    confirmPassword: "",
  };
};

const RegisterForm = ({ toastRef }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState(defaultFormValue());
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleChange = (e, type) => {
    setFormData({ ...formData, [type]: e.nativeEvent.text });
  };

  const handleSubmit = () => {
    if (
      isEmpty(formData.email) ||
      isEmpty(formData.password) ||
      isEmpty(formData.confirmPassword)
    )
      return toastRef.current.show("All fields are required");

    if (!validateEmail(formData.email))
      return toastRef.current.show("The email field is not a valid");

    if (formData.password != formData.confirmPassword)
      return toastRef.current.show(
        "Password confirmation does not match password"
      );

    if (size(formData.password) < 6)
      return toastRef.current.show(
        "The password must be at least 6 characters"
      );

    setLoading(true);
    firebase
      .auth()
      .createUserWithEmailAndPassword(formData.email, formData.password)
      .then(() => {
        setLoading(false);
        navigation.navigate("account");
      })
      .catch(() => {
        setLoading(false);
        toastRef.current.show("The email is already in use");
      });
  };

  return (
    <View style={styles.formContainer}>
      <Input
        placeholder="Email"
        containerStyle={styles.inputForm}
        onChange={(e) => handleChange(e, "email")}
        rightIcon={
          <Icon
            type="material-community"
            name="at"
            iconStyle={styles.iconRight}
          />
        }
      />
      <Input
        placeholder="Password"
        containerStyle={styles.inputForm}
        onChange={(e) => handleChange(e, "password")}
        password={true}
        secureTextEntry={!showPassword}
        rightIcon={
          <Icon
            type="material-community"
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            iconStyle={styles.iconRight}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />
      <Input
        placeholder="Confirm password"
        containerStyle={styles.inputForm}
        onChange={(e) => handleChange(e, "confirmPassword")}
        password={true}
        secureTextEntry={!showConfirmPassword}
        rightIcon={
          <Icon
            type="material-community"
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            iconStyle={styles.iconRight}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        }
      />
      <Button
        title="Register"
        containerStyle={styles.btnContainerRegister}
        buttonStyle={styles.btnRegister}
        onPress={handleSubmit}
      />
      <Loading isVisible={loading} text="Loading..." />
    </View>
  );
};

export default RegisterForm;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  inputForm: {
    width: "100%",
    marginTop: 20,
  },
  btnContainerRegister: {
    marginTop: 20,
    width: "95%",
  },
  btnRegister: {
    backgroundColor: "#00a680",
  },
  iconRight: {
    color: "#c1c1c1",
  },
});
