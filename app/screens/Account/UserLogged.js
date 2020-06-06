import React from "react";
import { Text, View, Button } from "react-native";
import * as firebase from "firebase";

const UserLogged = () => {
  return (
    <View>
      <Text>UserLogged</Text>

      <Button title="Sign out" onPress={() => firebase.auth().signOut()} />
    </View>
  );
};

export default UserLogged;
