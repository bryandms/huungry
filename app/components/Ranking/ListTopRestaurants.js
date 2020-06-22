import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Card, Image, Rating } from "react-native-elements";

const Restaurant = ({ restaurant, navigation }) => {
  const { id, name, description, rating, images } = restaurant.item;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("restaurants", {
          screen: "restaurant",
          params: { id },
        })
      }
    >
      <Card containerStyle={styles.containerCard}>
        <Image
          style={styles.restaurantImage}
          resizeMode="cover"
          source={
            images[0]
              ? { uri: images[0] }
              : require("../../../assets/img/no-image.png")
          }
        />
        <View style={styles.titleRating}>
          <Text style={styles.title}>{name}</Text>
          <Rating imageSize={20} startingValue={rating} readonly />
        </View>
        <Text style={styles.description}>{description}</Text>
      </Card>
    </TouchableOpacity>
  );
};

const ListTopRestaurants = ({ restaurants, navigation }) => {
  return (
    <FlatList
      data={restaurants}
      renderItem={(restaurant) => (
        <Restaurant restaurant={restaurant} navigation={navigation} />
      )}
      keyExtractor={(item, index) => index.toString()}
    />
  );
};

export default ListTopRestaurants;

const styles = StyleSheet.create({
  containerCard: {
    marginBottom: 10,
    borderWidth: 0,
  },

  restaurantImage: {
    width: "100%",
    height: 200,
  },
  titleRating: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    color: "gray",
    marginTop: 0,
    textAlign: "justify",
  },
});
