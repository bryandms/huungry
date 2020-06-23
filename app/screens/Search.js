import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Image } from "react-native";
import { SearchBar, ListItem, Icon } from "react-native-elements";
import { FireSQL } from "firesql";
import firebase from "firebase/app";

const fireSQL = new FireSQL(firebase.firestore(), { includeId: "id" });

const NotFoundRestaurants = () => {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Image
        source={require("../../assets/img/not-found.png")}
        resizeMode="cover"
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
};

const Restaurant = ({ restaurant, navigation }) => {
  const { id, name, images } = restaurant.item;

  return (
    <ListItem
      title={name}
      leftAvatar={{
        source: images[0]
          ? { uri: images[0] }
          : require("../../assets/img/no-image.png"),
      }}
      rightIcon={<Icon type="material-community" name="chevron-right" />}
      onPress={() =>
        navigation.navigate("restaurants", {
          screen: "restaurant",
          params: { id, name },
        })
      }
    />
  );
};

const Search = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    if (search) {
      fireSQL
        .query(`SELECT * FROM restaurants WHERE name LIKE '${search}%'`)
        .then((response) => {
          setRestaurants(response);
        });
    }
  }, [search]);

  return (
    <View>
      <SearchBar
        placeholder="Search..."
        onChangeText={(e) => setSearch(e)}
        value={search}
        containerStyle={styles.searchBar}
      />

      {restaurants.length === 0 ? (
        <NotFoundRestaurants />
      ) : (
        <FlatList
          data={restaurants}
          renderItem={(restaurant) => (
            <Restaurant restaurant={restaurant} navigation={navigation} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 20,
  },
});
