import React, { useState, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import { AirbnbRating, Button, Input } from "react-native-elements";
import Toast from "react-native-easy-toast";
import Loading from "../../components/Loading";
import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

const AddReviewRestaurant = ({ navigation, route }) => {
  const { idRestaurant } = route.params;
  const [rating, setRating] = useState(null);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();

  const addReview = () => {
    if (!rating) return toastRef.current.show("The field rating is required.");

    if (!title) return toastRef.current.show("The field title is required.");

    if (!review) return toastRef.current.show("The review title is required.");

    setIsLoading(true);

    const user = firebase.auth().currentUser;
    const payload = {
      idUser: user.uid,
      avatarUser: user.photoURL,
      idRestaurant,
      title,
      review,
      rating,
      createdAt: new Date(),
    };

    db.collection("reviews")
      .add(payload)
      .then(() => {
        udpateRestaurant();
      })
      .catch(() => {
        toastRef.current.show("Error sending the review.");
        setIsLoading(false);
      });
  };

  const udpateRestaurant = () => {
    const restaurantRef = db.collection("restaurants").doc(idRestaurant);

    restaurantRef.get().then((response) => {
      const restaurantData = response.data();
      const ratingTotal = restaurantData.ratingTotal + rating;
      const quantityVoting = restaurantData.quantityVoting + 1;
      const ratingResult = ratingTotal / quantityVoting;

      restaurantRef
        .update({
          rating: ratingResult,
          ratingTotal,
          quantityVoting,
        })
        .then(() => {
          setIsLoading(false);
          navigation.goBack();
        });
    });
  };

  return (
    <View style={styles.viewBody}>
      <View style={styles.viewRating}>
        <AirbnbRating
          count={5}
          reviews={["Bad", "Deficient", "Normal", "Very good", "Excellent"]}
          defaultRating={0}
          size={35}
          onFinishRating={(value) => {
            setRating(value);
          }}
        />
      </View>
      <View style={styles.formReview}>
        <Input
          placeholder="Title"
          containerStyle={styles.input}
          onChange={(e) => setTitle(e.nativeEvent.text)}
        />
        <Input
          placeholder="Review"
          multiline={true}
          inputContainerStyle={styles.textArea}
          onChange={(e) => setReview(e.nativeEvent.text)}
        />
        <Button
          title="Send"
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
          onPress={addReview}
        />
      </View>
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading isVisible={isLoading} text="Loading..." />
    </View>
  );
};

export default AddReviewRestaurant;

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
  },
  viewRating: {
    height: 110,
    backgroundColor: "#f2f2f2",
  },
  formReview: {
    flex: 1,
    alignItems: "center",
    margin: 10,
    marginTop: 40,
  },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 150,
    width: "100%",
    padding: 0,
    margin: 0,
  },
  btnContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 20,
    marginBottom: 10,
    width: "95%",
  },
  btn: {
    backgroundColor: "#00a680",
  },
});
