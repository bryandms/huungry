import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Avatar, Rating } from "react-native-elements";
import { map } from "lodash";
import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

const Review = ({
  review: { title, review, rating, createdAt, avatarUser },
}) => {
  const createdReview = new Date(createdAt.seconds * 1000);

  return (
    <View style={styles.viewReview}>
      <View style={styles.viewImageAvatar}>
        <Avatar
          size="large"
          rounded
          containerStyle={styles.imageAvatarUser}
          source={
            avatarUser
              ? { uri: avatarUser }
              : require("../../../assets/img/avatar-default.jpg")
          }
        />
      </View>
      <View style={styles.viewInfo}>
        <Text style={styles.reviewTitle}>{title}</Text>
        <Text style={styles.reviewText}>{review}</Text>
        <Rating imageSize={15} startingValue={rating} readonly />
        <Text style={styles.reviewDate}>
          {createdReview.getDate()}/{createdReview.getMonth() + 1}/
          {createdReview.getFullYear()} - {createdReview.getHours()}:
          {createdReview.getMinutes() < 10 ? "0" : ""}
          {createdReview.getMinutes()}
        </Text>
      </View>
    </View>
  );
};

const ListReviews = ({ navigation, idRestaurant }) => {
  const [userLogged, setUserLogged] = useState(false);
  const [reviews, setReviews] = useState([]);

  firebase
    .auth()
    .onAuthStateChanged((user) =>
      user ? setUserLogged(true) : setUserLogged(false)
    );

  useEffect(() => {
    db.collection("reviews")
      .where("idRestaurant", "==", idRestaurant)
      .get()
      .then((response) => {
        const resultReviews = [];

        response.forEach((doc) => {
          const data = doc.data();
          data.id = doc.id;
          resultReviews.push(data);
        });

        setReviews(resultReviews);
      });
  }, []);

  return (
    <View>
      {userLogged ? (
        <Button
          title="Write a review"
          buttonStyle={styles.btnAddReview}
          titleStyle={styles.btnTitleAddReview}
          icon={{
            type: "material-community",
            name: "square-edit-outline",
            color: "#00a680",
          }}
          onPress={() =>
            navigation.navigate("add-review-restaurant", {
              idRestaurant: idRestaurant,
            })
          }
        />
      ) : (
        <View>
          <Text
            style={styles.textReview}
            onPress={() => {
              navigation.navigate("login");
            }}
          >
            Log in to write your review
          </Text>
        </View>
      )}

      {map(reviews, (review, index) => (
        <Review key={index} review={review} />
      ))}
    </View>
  );
};

export default ListReviews;

const styles = StyleSheet.create({
  btnAddReview: {
    backgroundColor: "transparent",
  },
  btnTitleAddReview: {
    color: "#00a680",
  },
  textReview: {
    textAlign: "center",
    color: "#00a680",
    padding: 20,
  },
  viewReview: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 20,
    borderBottomColor: "#e3e3e3",
    borderBottomWidth: 1,
  },
  viewImageAvatar: {
    marginRight: 15,
  },
  imageAvatarUser: {
    width: 50,
    height: 50,
  },
  viewInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  reviewTitle: {
    fontWeight: "bold",
  },
  reviewText: {
    paddingTop: 2,
    color: "gray",
    marginBottom: 5,
  },
  reviewDate: {
    marginTop: 5,
    color: "gray",
    fontSize: 12,
    position: "absolute",
    right: 0,
    bottom: 0,
  },
});
