import React from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Image } from "react-native-elements";
import { size } from "lodash";
import { useNavigation } from "@react-navigation/native";

const Restaurant = ({ restaurant: { item }, navigation }) => {
  const { images, id, name, address, description } = item;
  const imageRestaurant = images[0];

  const goToRestaurant = () => {
    navigation.navigate("restaurant", {
      id,
      name,
    });
  };

  return (
    <TouchableOpacity onPress={goToRestaurant}>
      <View style={styles.viewRestaurant}>
        <View style={styles.viewRestaurantImage}>
          <Image
            resizeMode="cover"
            PlaceholderContent={<ActivityIndicator color="fff" />}
            source={
              imageRestaurant
                ? { uri: imageRestaurant }
                : require("../../../assets/img/no-image.png")
            }
            style={styles.imageRestaurant}
          />
        </View>
        <View>
          <Text style={styles.restaurantName}>{name}</Text>
          <Text style={styles.restaurantAddress}>{address}</Text>
          <Text style={styles.restaurantDescription}>
            {description.substr(0, 60)}...
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FooterList = ({ isLoading }) => {
  if (isLoading)
    return (
      <View style={styles.loaderRestaurants}>
        <ActivityIndicator size="large" />
      </View>
    );
  else
    return (
      <View style={styles.notFoundRestaurant}>
        <Text>No more restaurants found</Text>
      </View>
    );
};

const ListRestaurants = ({ restaurants, handleLoadMore, isLoading }) => {
  const navigation = useNavigation();

  return (
    <View>
      {size(restaurants) > 0 ? (
        <FlatList
          data={restaurants}
          renderItem={(restaurant) => (
            <Restaurant restaurant={restaurant} navigation={navigation} />
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ListFooterComponent={<FooterList isLoading={isLoading} />}
        />
      ) : (
        <View style={styles.loaderRestaurants}>
          <ActivityIndicator size="large" />
          <Text>Loading...</Text>
        </View>
      )}
    </View>
  );
};

export default ListRestaurants;

const styles = StyleSheet.create({
  loaderRestaurants: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  viewRestaurant: {
    flexDirection: "row",
    margin: 10,
  },
  viewRestaurantImage: {
    marginRight: 15,
  },
  imageRestaurant: {
    width: 80,
    height: 80,
  },
  restaurantName: {
    fontWeight: "bold",
  },
  restaurantAddress: {
    paddingTop: 2,
    color: "gray",
  },
  restaurantDescription: {
    paddingTop: 2,
    color: "gray",
    width: 300,
  },
  notFoundRestaurant: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },
});
