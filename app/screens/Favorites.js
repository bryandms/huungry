import React, { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image, Icon, Button } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-easy-toast";
import Loading from "../components/Loading";
import { firebaseApp } from "../utils/firebase";
import firebase from "firebase";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

const NotFoundRestaurants = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Icon
        type="material-community"
        name="alert-outline"
        size={50}
        color="gray"
      />
      <Text style={{ fontSize: 20 }}>No favorite restaurants found</Text>
    </View>
  );
};

const UserNotLogged = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Icon
        type="material-community"
        name="alert-outline"
        size={50}
        color="gray"
      />
      <Text style={{ fontSize: 20, textAlign: "center" }}>
        You must login to see this section
      </Text>
      <Button
        title="Log in"
        containerStyle={{ marginTop: 20, width: "80%" }}
        buttonStyle={{ backgroundColor: "#00a680" }}
        onPress={() => {
          navigation.navigate("account", { screen: "login" });
        }}
      />
    </View>
  );
};

const Restaurant = ({
  restaurant,
  setIsLoading,
  toastRef,
  setReloadData,
  navigation,
}) => {
  const { id, name, images } = restaurant.item;

  const confirmRemoveFavorite = () => {
    Alert.alert(
      "Remove restaurant from favorites",
      "Are you sure you want to remove the restaurant from favorites?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: removeFavorite,
        },
      ],
      { cancelable: false }
    );
  };

  const removeFavorite = () => {
    setIsLoading(true);
    db.collection("favorites")
      .where("idRestaurant", "==", id)
      .where("idUser", "==", firebase.auth().currentUser.uid)
      .get()
      .then((response) => {
        response.forEach((doc) => {
          const idFavorite = doc.id;
          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsLoading(false);
              setReloadData(true);
              toastRef.current.show("Restaurant successfully removed.");
            })
            .catch(() => {
              setIsLoading(false);
              toastRef.current.show("Error when removing the restaurant.");
            });
        });
      });
  };

  return (
    <View style={styles.restaurant}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("restaurants", {
            screen: "restaurant",
            params: { id },
          })
        }
      >
        <Image
          resizeMode="cover"
          style={styles.image}
          PlaceholderContent={<ActivityIndicator color="#fff" />}
          source={
            images[0]
              ? { uri: images[0] }
              : require("../../assets/img/no-image.png")
          }
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Icon
            type="material-community"
            name="heart"
            color="#f00"
            containerStyle={styles.favorites}
            onPress={confirmRemoveFavorite}
            underlayColor="transparent"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const Favorites = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState(null);
  const [userLogged, setUserLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const toastRef = useRef();

  firebase.auth().onAuthStateChanged((user) => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useFocusEffect(
    useCallback(() => {
      if (userLogged) {
        const idUser = firebase.auth().currentUser.uid;
        db.collection("favorites")
          .where("idUser", "==", idUser)
          .get()
          .then((response) => {
            const idRestaurantsArray = [];

            response.forEach((doc) => {
              idRestaurantsArray.push(doc.data().idRestaurant);
            });

            getDataRestaurant(idRestaurantsArray).then((response) => {
              const restaurants = [];

              response.forEach((doc) => {
                const restaurant = doc.data();
                restaurant.id = doc.id;
                restaurants.push(restaurant);
              });

              setRestaurants(restaurants);
            });
          });
      }
      setReloadData(false);
    }, [userLogged, reloadData])
  );

  const getDataRestaurant = (idRestaurantsArray) => {
    const arrayRestaurants = [];

    idRestaurantsArray.forEach((idRestaurant) => {
      const result = db.collection("restaurants").doc(idRestaurant).get();
      arrayRestaurants.push(result);
    });

    return Promise.all(arrayRestaurants);
  };

  if (!userLogged) return <UserNotLogged navigation={navigation} />;

  if (restaurants?.length === 0) return <NotFoundRestaurants />;

  return (
    <View style={styles.viewBody}>
      {restaurants ? (
        <FlatList
          data={restaurants}
          renderItem={(restaurant) => (
            <Restaurant
              restaurant={restaurant}
              setIsLoading={setIsLoading}
              toastRef={toastRef}
              setReloadData={setReloadData}
              navigation={navigation}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.loaderRestaurants}>
          <ActivityIndicator size="large" />
          <Text style={{ textAlign: "center" }}>Loading</Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading text="Loading..." isVisible={isLoading} />
    </View>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  loaderRestaurants: {
    marginTop: 10,
    marginBottom: 10,
  },
  restaurant: {
    margin: 10,
  },
  image: {
    width: "100%",
    height: 180,
  },
  info: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: -30,
    backgroundColor: "#fff",
  },
  name: {
    fontWeight: "bold",
    fontSize: 30,
  },
  favorites: {
    marginTop: -35,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 100,
  },
});
