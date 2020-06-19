import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Restaurant = ({ navigation, route }) => {
  console.log(navigation, route);
  return (
    <View>
      <Text>Restaurant info</Text>
    </View>
  );
};

export default Restaurant;

const styles = StyleSheet.create({});
