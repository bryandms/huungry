import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
import ListRestaurants from "../../components/Restaurants/ListRestaurants";

const db = firebase.firestore(firebaseApp);

const Restaurants = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [startRestaurant, setStartRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const LIMIT_RESTAURANT = 10;

  useEffect(() => {
    firebase.auth().onAuthStateChanged((userInfo) => {
      setUser(userInfo);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      db.collection("restaurants")
        .get()
        .then((snap) => {
          setTotalRestaurants(snap.size);
        });

      const resultRestaurants = [];

      db.collection("restaurants")
        .orderBy("createdAt", "desc")
        .limit(LIMIT_RESTAURANT)
        .get()
        .then((response) => {
          setStartRestaurant(response.docs[response.docs.length - 1]);

          response.forEach((doc) => {
            const restaurant = doc.data();
            restaurant.id = doc.id;
            resultRestaurants.push(restaurant);
          });

          setRestaurants(resultRestaurants);
        });
    }, [])
  );

  const handleLoadMore = () => {
    const resultRestaurants = [];
    restaurants.length < totalRestaurants && setIsLoading(true);

    db.collection("restaurants")
      .orderBy("createdAt", "desc")
      .startAfter(startRestaurant.data().createdAt)
      .limit(LIMIT_RESTAURANT)
      .get()
      .then((response) => {
        if (response.docs.length > 0)
          setStartRestaurant(response.docs[response.docs.length - 1]);
        else setIsLoading(false);

        response.forEach((doc) => {
          const restaurant = doc.data();
          restaurant.id = doc.id;
          resultRestaurants.push(restaurant);
        });

        setRestaurants([...restaurants, ...resultRestaurants]);
      });
  };

  return (
    <View style={styles.viewBody}>
      <ListRestaurants
        restaurants={restaurants}
        handleLoadMore={handleLoadMore}
        isLoading={isLoading}
      />

      {user && (
        <Icon
          reverse
          type="material-community"
          name="plus"
          color="#00a680"
          containerStyle={styles.btnContainer}
          onPress={() => navigation.navigate("add-restaurant")}
        />
      )}
    </View>
  );
};

export default Restaurants;

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  btnContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
  },
});
