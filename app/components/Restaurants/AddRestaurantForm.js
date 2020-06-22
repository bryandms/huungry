import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Dimensions } from "react-native";
import { Icon, Avatar, Image, Input, Button } from "react-native-elements";
import { map, size, filter } from "lodash";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import uuid from "random-uuid-v4";
import Modal from "../Modal";
import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/storage";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

const widthScreen = Dimensions.get("window").width;

const Map = ({
  isVisibleMap,
  toastRef,
  setIsVisibleMap,
  setLocationRestaurant,
}) => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const resultPermissions = await Permissions.askAsync(
        Permissions.LOCATION
      );

      const statusPermisssions = resultPermissions.permissions.location.status;

      if (statusPermisssions !== "granted")
        return toastRef.current.show(
          "It is necessary to accept the location permissions to access the location.",
          3000
        );

      const loc = await Location.getCurrentPositionAsync({});

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
    })();
  }, []);

  const confirmLocation = () => {
    setLocationRestaurant(location);
    toastRef.current.show("Location saved correctly.");
    setIsVisibleMap(false);
  };

  return (
    <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}>
      <View>
        {location && (
          <MapView
            style={styles.mapStyle}
            initialRegion={location}
            showsUserLocation={true}
            onRegionChange={(region) => setLocation(region)}
          >
            <MapView.Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              draggable
            />
          </MapView>
        )}
        <View style={styles.viewMapBtn}>
          <Button
            title="Save"
            containerStyle={styles.viewMapBtnContainerSave}
            buttonStyle={styles.viewMapBtnSave}
            onPress={confirmLocation}
          />
          <Button
            title="Cancel"
            containerStyle={styles.viewMapBtnContainerCancel}
            buttonStyle={styles.viewMapBtnCancel}
            onPress={() => setIsVisibleMap(false)}
          />
        </View>
      </View>
    </Modal>
  );
};

const UploadImage = ({ toastRef, imagesSelected, setimagesSelected }) => {
  const imageSelect = async () => {
    const resultPermissions = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );

    if (resultPermissions === "denied")
      return toastRef.current.show(
        "It is necessary to accept the permissions of the gallery to be able to upload images, if you have rejected it you can go to settings and activate it manually.",
        3000
      );

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.cancelled)
      return toastRef.current.show("No image has been selected.", 2000);

    setimagesSelected([...imagesSelected, result.uri]);
  };

  const removeImage = (image) => {
    const arrayImages = imagesSelected;

    Alert.alert(
      "Delete image",
      "Are you sure you want to delete the image?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            setimagesSelected(
              filter(arrayImages, (imageUrl) => imageUrl !== image)
            );
          },
        },
      ],
      {
        cancelable: false,
      }
    );
  };

  return (
    <View style={styles.viewImages}>
      {size(imagesSelected) < 4 && (
        <Icon
          type="material-community"
          name="camera"
          color="#7a7a7a"
          containerStyle={styles.containerIcon}
          onPress={imageSelect}
        />
      )}

      {map(imagesSelected, (imageRestaurant, index) => (
        <Avatar
          key={index}
          style={styles.miniatureStyle}
          source={{ uri: imageRestaurant }}
          onPress={() => removeImage(imageRestaurant)}
        />
      ))}
    </View>
  );
};

const ImageRestaurant = ({ imageRestaurant }) => {
  return (
    <View style={styles.viewPhoto}>
      <Image
        source={
          imageRestaurant
            ? {
                uri: imageRestaurant,
              }
            : require("../../../assets/img/no-image.png")
        }
        style={{ width: widthScreen, height: 200 }}
      />
    </View>
  );
};

const FormAdd = ({
  setName,
  setAddress,
  locationRestaurant,
  setDescription,
  setIsVisibleMap,
}) => {
  return (
    <View style={styles.viewForm}>
      <Input
        placeholder="Name"
        style={styles.input}
        onChange={(e) => setName(e.nativeEvent.text)}
      />
      <Input
        placeholder="Address"
        style={styles.input}
        onChange={(e) => setAddress(e.nativeEvent.text)}
        rightIcon={{
          type: "material-community",
          name: "google-maps",
          color: locationRestaurant ? "#00a680" : "#c2c2c2",
          onPress: () => setIsVisibleMap(true),
        }}
      />
      <Input
        placeholder="Description"
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={(e) => setDescription(e.nativeEvent.text)}
      />
    </View>
  );
};

const AddRestaurantForm = ({ toastRef, setisLoading, navigation }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [imagesSelected, setimagesSelected] = useState([]);
  const [isVisibleMap, setIsVisibleMap] = useState(false);
  const [locationRestaurant, setLocationRestaurant] = useState(null);

  const addRestaurant = () => {
    if (!name || !address || !description)
      return toastRef.current.show("All fields are required.");

    if (size(imagesSelected) === 0)
      return toastRef.current.show("You must select at least one photo.");

    if (!locationRestaurant)
      return toastRef.current.show("You must select the location.");

    setisLoading(true);
    uploadImageStorage().then((response) => {
      db.collection("restaurants")
        .add({
          name,
          address,
          description,
          location: locationRestaurant,
          images: response,
          rating: 0,
          ratingTotal: 0,
          quantityVoting: 0,
          createdAt: new Date(),
          createdBy: firebase.auth().currentUser.uid,
        })
        .then(() => {
          setisLoading(false);
          navigation.navigate("restaurants");
        })
        .catch(() => {
          setisLoading(false);
          toastRef.current.show("Error creating restaurant, try again.");
        });
    });
  };

  const uploadImageStorage = async () => {
    const imageBlob = [];

    await Promise.all(
      map(imagesSelected, async (image) => {
        const response = await fetch(image);
        const blob = await response.blob();
        const ref = firebase.storage().ref("restaurants").child(uuid());
        await ref.put(blob).then(async (result) => {
          await firebase
            .storage()
            .ref(`restaurants/${result.metadata.name}`)
            .getDownloadURL()
            .then((photoUrl) => imageBlob.push(photoUrl));
        });
      })
    );

    return imageBlob;
  };

  return (
    <ScrollView style={styles.scrollView}>
      <ImageRestaurant imageRestaurant={imagesSelected[0]} />
      <FormAdd
        setName={setName}
        setAddress={setAddress}
        setDescription={setDescription}
        setIsVisibleMap={setIsVisibleMap}
        locationRestaurant={locationRestaurant}
      />
      <UploadImage
        toastRef={toastRef}
        imagesSelected={imagesSelected}
        setimagesSelected={setimagesSelected}
      />
      <Button
        title="Create"
        onPress={addRestaurant}
        buttonStyle={styles.btnAddRestaurant}
      />
      <Map
        isVisibleMap={isVisibleMap}
        toastRef={toastRef}
        setIsVisibleMap={setIsVisibleMap}
        setLocationRestaurant={setLocationRestaurant}
      />
    </ScrollView>
  );
};

export default AddRestaurantForm;

const styles = StyleSheet.create({
  scrollView: {
    height: "100%",
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10,
  },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    width: "100%",
    padding: 0,
    margin: 0,
  },
  btnAddRestaurant: {
    backgroundColor: "#00a680",
    margin: 20,
  },
  viewImages: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
  },
  containerIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    height: 70,
    width: 70,
    backgroundColor: "#e3e3e3",
  },
  miniatureStyle: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  viewPhoto: {
    alignItems: "center",
    height: 200,
    marginBottom: 20,
  },
  mapStyle: {
    width: "100%",
    height: 550,
  },
  viewMapBtn: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  viewMapBtnContainerCancel: {
    paddingLeft: 5,
  },
  viewMapBtnCancel: {
    backgroundColor: "#a60d0d",
  },
  viewMapBtnContainerSave: {
    paddingRight: 5,
  },
  viewMapBtnSave: {
    backgroundColor: "#00a680",
  },
});
