import { firebaseAuth, firebaseDB } from "boot/firebase";

const state = {
  userDetails: {}
};

const mutations = {
  setUserDetails(state, payload) {
    state.userDetails = payload;
  }
};

const actions = {
  registerUser({}, payload) {
    firebaseAuth
      .createUserWithEmailAndPassword(payload.email, payload.password)
      .then(response => {
        console.log(response);
        let userId = firebaseAuth.currentUser.uid;
        firebaseDB.ref("users/" + userId).set({
          name: payload.name,
          email: payload.email,
          online: true
        });
      })
      .catch(error => {
        console.log(error.message);
      });
  },
  loginUser({}, payload) {
    firebaseAuth
      .signInWithEmailAndPassword(payload.email, payload.password)
      .then(response => {
        console.log(response);
        /*  let userId = firebaseAuth.currentUser.uid;
        firebaseDB.ref("users/" + userId).set({
          name: payload.name,
          email: payload.email,
          online: true
        }); */
      })
      .catch(error => {
        console.log(error.message);
      });
  },
  logoutUser() {
    firebaseAuth.signOut();
  },
  handleAuthStateChanged({ commit, dispatch, state }) {
    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        let userId = firebaseAuth.currentUser.uid;
        firebaseDB.ref("users/" + userId).once("value", snapshot => {
          console.log("snapshot", snapshot);
          let userDetails = snapshot.val();
          commit("setUserDetails", {
            name: userDetails.name,
            email: userDetails.email,
            userId: userId
          });
        });
        dispatch("firebaseUpdateUser", {
          userId: userId,
          updates: {
            online: true
          }
        });
        this.$router.push("/notes");
      } else {
        dispatch("firebaseUpdateUser", {
          userId: state.userDetails.userId,
          updates: {
            online: false
          }
        });
        commit("setUserDetails", {});
        this.$router.replace("/auth");
      }
    });
  },

  firebaseUpdateUser({}, payload) {
    firebaseDB.ref("users/" + payload.userId).update(payload.updates);
  }
};

const getters = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};