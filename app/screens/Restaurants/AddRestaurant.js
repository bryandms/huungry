import React, { useState, useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-easy-toast";
import Loading from "../../components/Loading";
import AddRestaurantForm from "../../components/Restaurants/AddRestaurantForm";

const AddRestaurant = ({ navigation }) => {
  const [isLoading, setisLoading] = useState(false);
  const toastRef = useRef();

  return (
    <View>
      <AddRestaurantForm
        toastRef={toastRef}
        setisLoading={setisLoading}
        navigation={navigation}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading isVisible={isLoading} text="Loading..." />
    </View>
  );
};

export default AddRestaurant;
